import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Loader, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { axiosApi } from '../stores'

export default function ScannerPage() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detectedPerson, setDetectedPerson] = useState(null)

  // Listen for real-time presence events from other sources (e.g., other devices scanning)
  useEffect(() => {
    const onPresence = (event) => {
      const payload = event?.detail
      if (!payload?.student_id) return
      
      const { name, student_id, status, alreadyMarked } = payload
      
      // Show notification for scans from other sources
      console.log('[Scanner] Presence update:', payload)
      
      if (alreadyMarked) {
        toast.success(`${name || student_id} already marked as present`, { duration: 4000 })
      } else {
        toast.success(`${name || student_id} marked as ${(status || 'present').toLowerCase()}`, { duration: 4000 })
      }
    }
    
    window.addEventListener('presence_event', onPresence)
    return () => window.removeEventListener('presence_event', onPresence)
  }, [])

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setScanning(true)
        }
      } catch (error) {
        console.error('Error accessing camera:', error)
        toast.error('Camera access denied')
      }
    }

    if (scanning) {
      initCamera()
    }

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
      }
    }
  }, [scanning])

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setLoading(true)
    try {
      const context = canvasRef.current.getContext('2d')
      const captureBlob = () =>
        new Promise((resolve) => {
          context.drawImage(
            videoRef.current,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          )
          canvasRef.current.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            0.9,
          )
        })

      // Backend expects multiple frames for consensus
      const blobs = []
      for (let i = 0; i < 3; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const blob = await captureBlob()
        if (blob) blobs.push(blob)
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 150))
      }

      if (blobs.length === 0) {
        toast.error('Failed to capture frames')
        setLoading(false)
        return
      }

      const fd = new FormData()
      blobs.forEach((b, idx) => {
        fd.append('files', b, `frame-${idx + 1}.jpg`)
      })

      const resp = await axiosApi.post('/attendance/checkin', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const { student_id, student_name, status, confidence, message, alreadyMarked } = resp.data || {}
      
      if (!student_id) {
        toast.error(message || 'No match found')
        setLoading(false)
        return
      }

      const name = student_name || student_id

      setDetectedPerson({
        name,
        student_id,
        status: status || 'Present',
        confidence: Number(confidence || 0),
        timestamp: new Date().toLocaleTimeString(),
        alreadyMarked: alreadyMarked || false,
      })
      
      // Show appropriate message
      if (alreadyMarked) {
        toast.success(`${name} already marked as present`, { duration: 4000 })
      } else {
        toast.success(`${name} marked as present`, { duration: 4000 })
      }
    } catch (error) {
      console.error('Error capturing frame:', error)
      toast.error(error?.response?.data?.message || error?.response?.data?.error || 'Recognition failed')
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Face Scanner</h1>
        <p className="text-gray-400">
          Scan student faces to mark attendance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="card overflow-hidden">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              {!scanning ? (
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                  <Camera size={48} className="text-gray-600" />
                  <p className="text-gray-400">Camera is off</p>
                  <button
                    onClick={() => setScanning(true)}
                    className="btn-primary"
                  >
                    Start Camera
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    width={1280}
                    height={720}
                    className="hidden"
                  />

                  {/* Scan Animation Overlay */}
                  <motion.div
                    animate={{ y: [0, 480, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent"
                  />

                  {/* Face Detection Frame */}
                  <motion.div
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-green-500 rounded-full"
                  />
                </>
              )}
            </div>

            {/* Controls */}
            <div className="p-6 space-y-4">
              <button
                onClick={handleCapture}
                disabled={!scanning || loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera size={20} />
                    Capture & Recognize
                  </>
                )}
              </button>
              {scanning && (
                <button
                  onClick={() => setScanning(false)}
                  className="btn-secondary w-full"
                >
                  Stop Camera
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Detection Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {detectedPerson ? (
            <div className={`card p-6 border-l-4 ${
              detectedPerson.alreadyMarked ? 'border-yellow-500' : 'border-green-500'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className={detectedPerson.alreadyMarked ? 'text-yellow-400' : 'text-green-400'} size={24} />
                <h3 className="text-lg font-bold text-white">
                  {detectedPerson.alreadyMarked ? 'Already Marked' : 'Face Detected'}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-glass rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Student Name</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {detectedPerson.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-glass rounded-lg p-3">
                    <p className="text-gray-400 text-xs">ID</p>
                    <p className="font-bold text-green-400 mt-1">
                      {detectedPerson.student_id}
                    </p>
                  </div>
                  <div className="bg-glass rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Confidence</p>
                    <p className="font-bold text-cyan-400 mt-1">
                      {(detectedPerson.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="bg-glass rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className={`text-lg font-bold mt-1 ${
                    detectedPerson.alreadyMarked ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {detectedPerson.alreadyMarked 
                      ? `${detectedPerson.name} already marked as present` 
                      : `${detectedPerson.name} marked as present`
                    }
                  </p>
                </div>

                <div className="bg-glass rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Time</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {detectedPerson.timestamp}
                  </p>
                </div>

                <button
                  className="btn-primary w-full"
                  onClick={() => toast.success('Attendance recorded in database')}
                >
                  ✅ Attendance Saved
                </button>
                <button
                  onClick={() => setDetectedPerson(null)}
                  className="btn-secondary w-full"
                >
                  Scan Again
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-6 border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-blue-400" size={24} />
                <h3 className="text-lg font-bold text-white">Ready</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Position your face in the frame and click "Capture & Recognize"
                to start recognition.
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">•</span>
                  <span className="text-gray-300">
                    Ensure adequate lighting
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">•</span>
                  <span className="text-gray-300">
                    Look directly at the camera
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">•</span>
                  <span className="text-gray-300">
                    Keep your face clearly visible
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
