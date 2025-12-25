import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Standalone /scan page.
 * Represents a biometric device: no login, not part of any portal navigation.
 */
export default function ScanDevicePage() {
  const videoRef = useRef(null)
  const captureCanvasRef = useRef(null)

  const [cameraReady, setCameraReady] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('Starting camera…')

  // Prevent rapid re-triggers after a mark.
  const [cooldownUntil, setCooldownUntil] = useState(0)

  // Keep the most recent detected face box to crop frames (faster + more reliable).
  const lastFaceBoxRef = useRef(null)
  const bcRef = useRef(null)

  useEffect(() => {
    try {
      bcRef.current = new BroadcastChannel('presenceai_presence')
    } catch {
      // ignore
    }

    return () => {
      try {
        bcRef.current?.close()
      } catch {
        // ignore
      }
    }
  }, [])

  const faceDetector = useMemo(() => {
    // Chrome/Edge: FaceDetector API. If unsupported, we fall back to timed captures.
    // eslint-disable-next-line no-undef
    return typeof window !== 'undefined' && 'FaceDetector' in window ? new window.FaceDetector({ fastMode: true }) : null
  }, [])

  const getSubject = () => {
    const params = new URLSearchParams(window.location.search)
    return (params.get('subject') || 'Biometric Scan').trim() || 'Biometric Scan'
  }

  useEffect(() => {
    let stream
    let cancelled = false

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) return
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          // Wait for dimensions so we don't capture a blank frame.
          await new Promise((resolve) => {
            const v = videoRef.current
            if (!v) return resolve()
            if (v.videoWidth && v.videoHeight) return resolve()
            const onMeta = () => {
              v.removeEventListener('loadedmetadata', onMeta)
              resolve()
            }
            v.addEventListener('loadedmetadata', onMeta)
          })
          await videoRef.current.play()
        }
        setCameraReady(true)
        setMessage('Align your face to scan…')
      } catch (e) {
        console.error(e)
        setMessage('Camera access denied')
      }
    }

    start()

    return () => {
      cancelled = true
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const captureFrameBlob = async ({ forceFullFrame = false, targetSize = 360 } = {}) => {
    const video = videoRef.current
    const canvas = captureCanvasRef.current
    if (!video || !canvas) return null

    if (!video.videoWidth || !video.videoHeight) return null

    // Downscale aggressively for speed.
    // If FaceDetector provided a bounding box, crop around it to reduce background noise.
    const srcW = video.videoWidth || 1280
    const srcH = video.videoHeight || 720
    const box = forceFullFrame ? null : lastFaceBoxRef.current

    let sx = 0
    let sy = 0
    let sw = srcW
    let sh = srcH

    if (box && typeof box.x === 'number') {
      const pad = 0.35
      sx = Math.max(0, Math.floor(box.x - box.width * pad))
      sy = Math.max(0, Math.floor(box.y - box.height * pad))
      sw = Math.min(srcW - sx, Math.floor(box.width * (1 + pad * 2)))
      sh = Math.min(srcH - sy, Math.floor(box.height * (1 + pad * 2)))
    }

    // Target small square-ish for speed.
    const targetW = targetSize
    const targetH = targetSize
    canvas.width = targetW
    canvas.height = targetH

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH)

    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.75)
    })
  }

  const sendToBackend = async (blobs) => {
    const fd = new FormData()
    for (let i = 0; i < blobs.length; i++) {
      fd.append('files', blobs[i], `frame_${Date.now()}_${i}.jpg`)
    }

    // Use /api/checkin because it already implements multi-frame recognition + attendance marking.
    const resp = await fetch('/api/checkin', {
      method: 'POST',
      body: fd,
    })

    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      const err = data?.error || data?.message || data?.detail || 'Scan failed'
      throw new Error(err)
    }

    return data
  }

  const handleScanOnce = async () => {
    if (processing) return
    if (Date.now() < cooldownUntil) return

    try {
      setProcessing(true)
      setMessage('Scanning…')

      // Capture fewer frames for speed.
      const frames = []
      for (let i = 0; i < 2; i++) {
        // eslint-disable-next-line no-await-in-loop
        const blob = await captureFrameBlob()
        if (blob) frames.push(blob)
        // Small spacing between frames.
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 70))
      }

      if (frames.length === 0) {
        setMessage('Camera warming up…')
        return
      }

      const result = await sendToBackend(frames)

      if (result?.success) {
        const displayName = result?.student_name || result?.name || result?.student_id || 'Student'
        const status = result?.status || 'Present'

        // Instant cross-tab update (portal + scan on same origin).
        try {
          if (result?.student_id) {
            bcRef.current?.postMessage({
              type: 'presence',
              payload: {
                student_id: result.student_id,
                status,
                timestamp: result?.timestamp || new Date().toISOString(),
                avatarUrl: result?.avatarUrl,
              },
            })
          }
        } catch {
          // ignore
        }

        setMessage(`${displayName} ${status}`)
      } else {
        setMessage(result?.message || 'Face Not Recognized')
      }

      // Auto-reset after a short delay.
      setCooldownUntil(Date.now() + 2500)
      setTimeout(() => {
        setMessage('Align your face to scan…')
      }, 2000)
    } catch (e) {
      console.error(e)
      const msg = String(e?.message || '')

      // If we cropped wrongly (common when box coords were off), retry once with a full frame.
      if (msg.toLowerCase().includes('no faces detected') && lastFaceBoxRef.current) {
        try {
          lastFaceBoxRef.current = null
          const blob = await captureFrameBlob({ forceFullFrame: true, targetSize: 480 })
          if (blob) {
            const retry = await sendToBackend([blob])
            if (retry?.success) {
              const displayName = retry?.student_name || retry?.name || retry?.student_id || 'Student'
              const status = retry?.status || 'Present'
              try {
                if (retry?.student_id) {
                  bcRef.current?.postMessage({
                    type: 'presence',
                    payload: {
                      student_id: retry.student_id,
                      status,
                      timestamp: retry?.timestamp || new Date().toISOString(),
                      avatarUrl: retry?.avatarUrl,
                    },
                  })
                }
              } catch {
                // ignore
              }
              setMessage(`${displayName} ${status}`)
              setCooldownUntil(Date.now() + 2500)
              setTimeout(() => {
                setMessage('Align your face to scan…')
              }, 2000)
              return
            }
          }
        } catch (retryErr) {
          console.error(retryErr)
        }
      }

      setMessage(msg || 'Face Not Recognized')
      // Short cooldown to avoid hammering /api/checkin on repeated "no face".
      setCooldownUntil(Date.now() + 1200)
      setTimeout(() => {
        setMessage('Align your face to scan…')
      }, 1500)
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    let raf = 0
    let interval = 0

    const tickFaceDetect = async () => {
      try {
        if (!cameraReady || processing) {
          raf = requestAnimationFrame(tickFaceDetect)
          return
        }
        if (Date.now() < cooldownUntil) {
          raf = requestAnimationFrame(tickFaceDetect)
          return
        }

        const video = videoRef.current
        if (!video) {
          raf = requestAnimationFrame(tickFaceDetect)
          return
        }

        if (faceDetector) {
          // FaceDetector can detect directly from a <video> element in modern browsers.
          const faces = await faceDetector.detect(video)
          if (faces && faces.length > 0) {
            // Remember best (largest) face box for cropping.
            // IMPORTANT: FaceDetector boundingBox is in CSS pixels; convert to video pixels.
            const bestCss = faces
              .map((f) => f.boundingBox)
              .sort((a, b) => (b?.width || 0) * (b?.height || 0) - (a?.width || 0) * (a?.height || 0))[0]

            if (bestCss) {
              const rect = video.getBoundingClientRect()
              const cssW = rect?.width || video.clientWidth || 0
              const cssH = rect?.height || video.clientHeight || 0
              const scaleX = cssW > 0 ? video.videoWidth / cssW : 1
              const scaleY = cssH > 0 ? video.videoHeight / cssH : 1

              lastFaceBoxRef.current = {
                x: bestCss.x * scaleX,
                y: bestCss.y * scaleY,
                width: bestCss.width * scaleX,
                height: bestCss.height * scaleY,
              }
            }
            await handleScanOnce()
          }
        }
      } finally {
        raf = requestAnimationFrame(tickFaceDetect)
      }
    }

    if (faceDetector) {
      raf = requestAnimationFrame(tickFaceDetect)
    } else {
      // Fallback: if FaceDetector isn't available, attempt a scan periodically.
      // This keeps the device usable on older browsers, though face detection is less precise.
      interval = window.setInterval(() => {
        if (!cameraReady || processing) return
        if (Date.now() < cooldownUntil) return
        handleScanOnce()
      }, 2500)
    }

    return () => {
      if (raf) cancelAnimationFrame(raf)
      if (interval) window.clearInterval(interval)
    }
  }, [cameraReady, cooldownUntil, faceDetector, processing])

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 grid place-items-center p-4">
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <div className="relative aspect-video bg-black">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={captureCanvasRef} className="hidden" />
              <div className="absolute inset-0 grid place-items-end p-4">
                <div className="px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-lg font-semibold">
                  {message}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400 text-center">
            Virtual biometric device • URL: /scan
          </div>
        </div>
      </div>
    </div>
  )
}
