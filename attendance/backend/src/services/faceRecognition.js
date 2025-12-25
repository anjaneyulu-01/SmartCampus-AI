import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KNOWN_FACES_DIR = path.join(path.dirname(__dirname), '..', 'known_faces');
const USE_PYTHON_FACE = process.env.USE_PYTHON_FACE === '1';
const PY_FACE_URL = process.env.PY_FACE_URL || 'http://127.0.0.1:7000/match';

// Lazy load face-api.js to avoid errors if not available
let faceapi = null;
let Canvas = null;
let Image = null;
let ImageData = null;
let tf = null;

let modelsLoaded = false;
let knownEncodings = [];
let knownNames = [];

async function postJsonDetailed(urlStr, bodyObj) {
  const payload = JSON.stringify(bodyObj ?? {});

  // Prefer native fetch when available.
  if (typeof fetch === 'function') {
    const res = await fetch(urlStr, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    const raw = await res.text();
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    let data = raw;
    if (ct.includes('application/json')) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
    }
    return { ok: res.ok, status: res.status, data, raw };
  }

  // Fallback for older Node versions without global fetch.
  const url = new URL(urlStr);
  const lib = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          const ok = res.statusCode >= 200 && res.statusCode < 300;
          let data = raw;
          try {
            data = JSON.parse(raw);
          } catch {
            data = raw;
          }
          resolve({ ok, status: res.statusCode || 0, data, raw });
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function callPythonRecognition(framesBytes) {
  try {
    const images = framesBytes.map((b) => b.toString('base64'));
    const resp = await postJsonDetailed(PY_FACE_URL, { images });

    // Python returns structured JSON even on non-2xx; preserve it.
    if (resp && typeof resp.data === 'object' && resp.data) {
      return resp.data;
    }

    if (!resp.ok) {
      return { status: 'error', message: `python http ${resp.status}`, raw: resp.raw };
    }

    return resp.data;
  } catch (err) {
    console.error('[ERROR] Python face service:', err);
    return { status: 'error', message: err.message || 'python service failed' };
  }
}

// Explicit Python recognition (used by the standalone biometric scan endpoint).
export async function recognizeWithPython(framesBytes) {
  return callPythonRecognition(framesBytes);
}

// Ask the Python service to reload encodings from DB (and bootstrap from known_faces if needed).
export async function reloadPythonFaces() {
  try {
    const base = new URL(PY_FACE_URL);
    base.pathname = '/reload';
    base.search = '';
    return await postJson(base.toString(), {});
  } catch (err) {
    console.error('[WARN] Python face reload failed:', err);
    return { status: 'error', message: err?.message || 'reload failed' };
  }
}

/**
 * Load face-api.js models (lazy load)
 */
async function loadModels() {
  if (modelsLoaded) return;
  
  try {
    // Try to load face-api.js dynamically
    try {
      faceapi = await import('face-api.js');
      const canvasModule = await import('canvas');
      Canvas = canvasModule.default?.Canvas || canvasModule.Canvas;
      Image = canvasModule.default?.Image || canvasModule.Image;
      ImageData = canvasModule.default?.ImageData || canvasModule.ImageData;
      
      // Patch face-api.js to use node-canvas
      if (faceapi.default) {
        faceapi.default.env.monkeyPatch({ Canvas, Image, ImageData });
      } else {
        faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
      }
    } catch (importError) {
      console.log('[WARN] face-api.js or canvas not available. Face recognition will be limited.');
      console.log('[INFO] Install: npm install face-api.js canvas');
      modelsLoaded = false; // keep false so loaders below short-circuit
      return;
    }
    
    const modelsPath = path.join(__dirname, '..', 'models');
    
    // Check if models exist
    if (!fs.existsSync(modelsPath)) {
      console.log('[WARN] Face-api models not found. Face recognition will be limited.');
      console.log('[INFO] Download models from: https://github.com/justadudewhohacks/face-api.js-models');
      modelsLoaded = false; // keep false so we skip loading faces
      return;
    }
    
    const api = faceapi.default || faceapi;
    await api.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
    await api.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    await api.nets.faceRecognitionNet.loadFromDisk(modelsPath);
    
    modelsLoaded = true;
    console.log('[INFO] Face-api models loaded');
  } catch (error) {
    console.error('[ERROR] Failed to load face-api models:', error);
    console.log('[INFO] Face recognition will use fallback method');
    modelsLoaded = true;
  }
}

/**
 * Load known faces from directory
 */
export async function loadKnownFaces() {
  try {
    await loadModels();
    
    knownEncodings = [];
    knownNames = [];
    
    if (!fs.existsSync(KNOWN_FACES_DIR)) {
      fs.mkdirSync(KNOWN_FACES_DIR, { recursive: true });
      console.log('[INFO] Created known_faces directory');
      return;
    }
    
    const files = fs.readdirSync(KNOWN_FACES_DIR);
    const imageFiles = files.filter(f => 
      /\.(jpg|jpeg|png)$/i.test(f)
    );
    
    // If optional deps are missing, skip silently to avoid noisy errors
    if (!modelsLoaded || !faceapi || !Canvas || !Image) {
      console.log('[INFO] Face recognition models not available, skipping face loading');
      return;
    }
    
    if (imageFiles.length === 0) {
      console.log('[INFO] No known faces to load');
      return;
    }
    
    const api = faceapi.default || faceapi;
    
    for (const file of imageFiles) {
      try {
        const studentId = path.basename(file, path.extname(file));
        const imagePath = path.join(KNOWN_FACES_DIR, file);
        
        const image = await api.bufferToImage(fs.readFileSync(imagePath));
        const detection = await api
          .detectSingleFace(image)
          .withFaceLandmarks()
          .withFaceDescriptor();
        
        if (detection) {
          knownEncodings.push(detection.descriptor);
          knownNames.push(studentId);
          console.log(`[INFO] Loaded face: ${studentId}`);
        } else {
          console.log(`[WARN] No face found in ${file}`);
        }
      } catch (error) {
        console.error(`[ERROR] Loading face ${file}:`, error);
      }
    }
    
    console.log(`[INFO] Loaded ${knownNames.length} known faces`);
  } catch (error) {
    console.error('[ERROR] loadKnownFaces:', error);
  }
}

/**
 * Get face encoding from image buffer
 */
async function encodingFromBytes(buffer) {
  try {
    if (!modelsLoaded || !faceapi) {
      return null;
    }
    
    const api = faceapi.default || faceapi;
    const image = await api.bufferToImage(buffer);
    const detection = await api
      .detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    return detection ? detection.descriptor : null;
  } catch (error) {
    console.error('[ERROR] encodingFromBytes:', error);
    return null;
  }
}

/**
 * Calculate face distance (Euclidean distance)
 */
function faceDistance(encoding1, encoding2) {
  if (!encoding1 || !encoding2) return Infinity;
  
  let sum = 0;
  for (let i = 0; i < encoding1.length; i++) {
    const diff = encoding1[i] - encoding2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Basic liveness check (simplified - can be enhanced)
 */
function basicLivenessFrame(buffer) {
  // Simplified liveness check
  // In production, use a proper anti-spoofing model
  return false; // Assume real for now
}

/**
 * Process multiple frames with consensus
 */
export async function processFramesConsensus(framesBytes, minFramesRequired = 2, distanceThreshold = 0.5) {
  try {
    if (!framesBytes || framesBytes.length === 0) {
      return { status: 'error', message: 'No frames provided' };
    }

    if (USE_PYTHON_FACE) {
      const pyResult = await callPythonRecognition(framesBytes);
      if (pyResult?.status === 'success' && pyResult.student_id) {
        return {
          status: 'success',
          student_id: pyResult.student_id,
          confidence: pyResult.confidence ?? 1,
          is_suspicious: !!pyResult.is_suspicious
        };
      }
      return { status: 'error', message: pyResult?.message || 'Face recognition not available (python)' };
    }
    
    if (!modelsLoaded || knownEncodings.length === 0) {
      return { status: 'error', message: 'Face recognition not available or no known faces loaded' };
    }
    
    const matchCounts = {};
    const confidences = {};
    let totalProcessed = 0;
    let suspiciousFlag = false;
    
    for (const frameBuffer of framesBytes) {
      const encoding = await encodingFromBytes(frameBuffer);
      if (!encoding) continue;
      
      totalProcessed++;
      
      // Find best match
      let bestDistance = Infinity;
      let bestIndex = -1;
      
      for (let i = 0; i < knownEncodings.length; i++) {
        const distance = faceDistance(encoding, knownEncodings[i]);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = i;
        }
      }
      
      if (bestIndex >= 0 && bestDistance <= distanceThreshold) {
        const name = knownNames[bestIndex];
        if (!matchCounts[name]) {
          matchCounts[name] = 0;
          confidences[name] = [];
        }
        matchCounts[name]++;
        const confidence = Math.max(0, 1 - bestDistance);
        confidences[name].push(confidence);
      }
      
      // Check liveness
      if (basicLivenessFrame(frameBuffer)) {
        suspiciousFlag = true;
      }
    }
    
    if (totalProcessed === 0) {
      return { status: 'error', message: 'No faces detected in frames' };
    }
    
    if (Object.keys(matchCounts).length === 0) {
      return { status: 'error', message: 'Unknown person detected. Please register first.' };
    }
    
    // Find best match
    const bestName = Object.keys(matchCounts).reduce((a, b) => 
      matchCounts[a] > matchCounts[b] ? a : b
    );
    const count = matchCounts[bestName];
    const avgConf = confidences[bestName].reduce((a, b) => a + b, 0) / confidences[bestName].length;
    
    if (count >= minFramesRequired || count >= Math.floor(totalProcessed / 2) + 1) {
      return {
        status: 'success',
        student_id: bestName,
        confidence: avgConf,
        is_suspicious: suspiciousFlag
      };
    } else {
      return { status: 'error', message: 'Could not confidently match the face. Try again.' };
    }
  } catch (error) {
    console.error('[ERROR] processFramesConsensus:', error);
    return { status: 'error', message: 'Face recognition processing failed' };
  }
}

// Initialize models on import
loadModels().catch(console.error);

