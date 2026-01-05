"""
Production-ready Face Scanning and Recognition using DeepFace + ArcFace + RetinaFace

Features:
- Live webcam input via OpenCV
- Low-light preprocessing (histogram equalization, CLAHE)
- RetinaFace detector (robust face detection)
- ArcFace model (high-accuracy recognition)
- Cosine distance matching
- Flask REST API endpoint
- Modular and clean code
"""
from __future__ import annotations

import base64
import os
import logging
import gc
from typing import Optional, Tuple, Dict, Any
from concurrent.futures import ThreadPoolExecutor
import threading

# MongoDB Atlas connection
from mongo_connect import get_mongo_db

import cv2  # type: ignore
import numpy as np
from flask import Flask, jsonify, request
from deepface import DeepFace  # type: ignore

# ============================================================================
# LOGGING SETUP
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

# Initialize MongoDB connection (optional: use in endpoints as needed)
mongo_db = get_mongo_db()

# Thread pool for async processing
executor = ThreadPoolExecutor(max_workers=4)
processing_lock = threading.Lock()

# Paths and directories
# Use module-relative dataset path by default to avoid cwd issues
MODULE_DIR = os.path.abspath(os.path.dirname(__file__))
DEFAULT_DB_PATH = os.path.join(MODULE_DIR, "dataset")
DB_PATH = os.getenv("DF_DB_PATH", DEFAULT_DB_PATH)
CAMERA_INDEX = int(os.getenv("DF_CAMERA", "0"))

# Face detection and recognition parameters
MODEL_NAME = os.getenv("DF_MODEL", "ArcFace")
DETECTOR_BACKEND = os.getenv("DF_DETECTOR", "opencv")  # opencv is much faster than retinaface
DISTANCE_METRIC = os.getenv("DF_DISTANCE", "cosine")
# Threshold for face matching
COSINE_THRESHOLD = float(os.getenv("DF_COSINE_THRESHOLD", "0.68"))

# Processing parameters
FRAME_WIDTH = 320
FRAME_HEIGHT = 240
TIMEOUT_SEC = 8
# PREPROCESSING FUNCTIONS
# ============================================================================

def preprocess_frame_for_recognition(frame_bgr: np.ndarray) -> np.ndarray:
    """
    Preprocess frame for low-light conditions:
    1. Convert BGR to grayscale
    2. Apply histogram equalization
    3. Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    4. Convert back to BGR for DeepFace compatibility
    """
    if frame_bgr is None or frame_bgr.size == 0:
        return frame_bgr
    
    # Convert to grayscale
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    
    # Apply histogram equalization
    equalized = cv2.equalizeHist(gray)
    
    # Apply CLAHE for better low-light enhancement
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(equalized)
    
    # Convert back to BGR
    bgr_enhanced = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)
    
    return bgr_enhanced


def resize_frame(frame: np.ndarray, width: int = FRAME_WIDTH, height: int = FRAME_HEIGHT) -> np.ndarray:
    """Resize frame for faster processing (INTER_AREA is better for downscaling)."""
    if frame is None or frame.size == 0:
        return frame
    return cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA)


def decode_base64_image(base64_str: str) -> Optional[np.ndarray]:
    """Decode base64 string to OpenCV image (BGR)."""
    try:
        # Handle data URI format
        if base64_str.startswith('data:'):
            base64_str = base64_str.split(',', 1)[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_str, validate=True)
        
        # Convert to numpy array
        nparr = np.frombuffer(image_data, dtype=np.uint8)
        
        # Decode image
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None or frame.size == 0:
            logger.warning("Failed to decode image: empty or invalid")
            return None
        
        return frame
    except Exception as e:
        logger.error(f"Base64 decoding failed: {e}")
        return None


# ============================================================================
# FACE RECOGNITION FUNCTIONS
# ============================================================================

def recognize_face_in_frame(
    frame_bgr: np.ndarray,
    db_path: str,
    cosine_threshold: float = COSINE_THRESHOLD
) -> Tuple[Optional[str], Optional[float]]:
    """
    Recognize a face in a single frame using DeepFace + RetinaFace + ArcFace.
    
    Returns:
        Tuple of (person_name, confidence_score) or (None, None) if no match
    """
    if frame_bgr is None or frame_bgr.size == 0:
        return None, None
    
    if not os.path.exists(db_path):
        logger.error(f"Database path not found: {db_path}")
        return None, None
    
    # Thread lock to prevent concurrent DeepFace calls (not thread-safe)
    with processing_lock:
        try:
            # Preprocess for low-light conditions
            preprocessed = preprocess_frame_for_recognition(frame_bgr)
            
            # Convert BGR to RGB for DeepFace
            rgb_frame = cv2.cvtColor(preprocessed, cv2.COLOR_BGR2RGB)
            
            # Run face recognition with opencv + ArcFace
            # Build face representations once to avoid TensorFlow graph issues
            results = DeepFace.find(
                img_path=rgb_frame,
                db_path=db_path,
                model_name=MODEL_NAME,
                distance_metric=DISTANCE_METRIC,
                detector_backend=DETECTOR_BACKEND,
                enforce_detection=False,
                silent=True,
                refresh_database=False  # Don't rebuild representations on every call
            )
            
            # Normalize results to list
            results_list = results if isinstance(results, list) else [results]
            
            best_name = None
            best_distance = float('inf')
            second_best_distance = float('inf')  # Track second-best for confidence gap
            
            # Find best and second-best matches
            for df in results_list:
                if df is None or len(df) == 0:
                    continue
                
                # Sort by distance (ascending)
                df_sorted = df.sort_values(by=['distance'], ascending=True)
                
                for idx, (_, row) in enumerate(df_sorted.iterrows()):
                    distance = float(row['distance'])
                    
                    # Check if below threshold
                    if distance > cosine_threshold:
                        continue
                    
                    # Extract person name from identity path
                    identity_path = str(row['identity'])
                    person_name = os.path.basename(os.path.dirname(identity_path))
                    
                    # Track best and second-best
                    if distance < best_distance:
                        second_best_distance = best_distance
                        best_distance = distance
                        best_name = person_name
                    elif distance < second_best_distance:
                        second_best_distance = distance
            
            if best_name and best_distance < float('inf'):
                # Convert distance to confidence (0-1 scale)
                confidence = max(0.0, 1.0 - best_distance)
                logger.info(f"Match found: {best_name} (distance: {best_distance:.4f}, confidence: {confidence:.4f}, threshold: {cosine_threshold:.4f})")
                return best_name, confidence
            
            logger.info(f"No matching face found (best distance would be {best_distance:.4f}, threshold: {cosine_threshold:.4f})")
            return None, None
            
        except Exception as e:
            logger.error(f"Face recognition failed: {e}")
            return None, None


def recognize_multiple_frames(
    frames_bgr: list,
    db_path: str
) -> Tuple[Optional[str], Optional[float]]:
    """
    Recognize faces across multiple frames and return best match.
    """
    if not frames_bgr or all(f is None for f in frames_bgr):
        return None, None
    
    matches = []
    
    for frame in frames_bgr:
        if frame is None or frame.size == 0:
            continue
        
        name, confidence = recognize_face_in_frame(frame, db_path)
        if name and confidence:
            matches.append((name, confidence))
    
    if not matches:
        return None, None
    
    # Group by person and average confidence
    person_scores = {}
    for name, confidence in matches:
        if name not in person_scores:
            person_scores[name] = []
        person_scores[name].append(confidence)
    
    # Find person with highest average confidence
    best_person = max(person_scores.items(), key=lambda x: np.mean(x[1]))
    avg_confidence = float(np.mean(best_person[1]))
    
    logger.info(f"Best match: {best_person[0]} (avg confidence: {avg_confidence:.4f})")
    return best_person[0], avg_confidence


# ============================================================================
# FLASK ENDPOINTS
# ============================================================================

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max


def list_representation_files(db_path: str) -> list[str]:
    try:
        return [f for f in os.listdir(db_path) if f.lower().endswith('.pkl')]
    except Exception:
        return []


def rebuild_representations(db_path: str) -> Dict[str, Any]:
    """Force DeepFace to rebuild representation cache for the dataset."""
    try:
        logger.info(f"Rebuilding DeepFace representations for: {db_path}")
        # Use a tiny black image to trigger index building
        dummy = np.zeros((224, 224, 3), dtype=np.uint8)
        DeepFace.find(
            img_path=dummy,
            db_path=db_path,
            model_name=MODEL_NAME,
            distance_metric=DISTANCE_METRIC,
            detector_backend=DETECTOR_BACKEND,
            enforce_detection=False,
            silent=True,
            refresh_database=True
        )
        files = list_representation_files(db_path)
        logger.info(f"Representation files present: {files}")
        return {"success": True, "files": files}
    except Exception as e:
        logger.error(f"Failed to rebuild representations: {e}")
        return {"success": False, "error": str(e)}


@app.route('/match', methods=['POST'])
def match_faces():
    """
    Match faces from base64 encoded images against the dataset.
    
    Request JSON:
    {
        "images": ["base64_string_1", "base64_string_2", ...],
        "db_path": "/path/to/dataset",  # optional
        "threshold": 0.55  # optional (lower = stricter matching)
    }
    """
    try:
        data = request.get_json() or {}
        images_b64 = data.get('images', [])
        db_path = data.get('db_path', DB_PATH)
        # Fallback to module-relative dataset if provided path does not exist
        if not os.path.exists(db_path):
            logger.warning(f"Provided db_path does not exist: {db_path}. Falling back to default: {DEFAULT_DB_PATH}")
            db_path = DEFAULT_DB_PATH
        threshold = float(data.get('threshold', COSINE_THRESHOLD))
        logger.info(f"/match db_path={db_path}, detector={DETECTOR_BACKEND}, model={MODEL_NAME}, threshold={threshold:.4f}")
        logger.info(f"Existing representation files: {list_representation_files(db_path)}")
        
        if not images_b64:
            return jsonify({
                'success': False,
                'message': 'No images provided',
                'status': 'error'
            }), 400
        
        # Use only the first frame to speed up processing
        # Multiple frames cause timeouts and don't significantly improve accuracy
        first_frame_b64 = images_b64[0] if images_b64 else None
        if not first_frame_b64:
            return jsonify({
                'success': False,
                'message': 'No valid images provided',
                'status': 'error'
            }), 400
        
        frame = decode_base64_image(first_frame_b64)
        if frame is None:
            return jsonify({
                'success': False,
                'message': 'Failed to decode image',
                'status': 'error'
            }), 400
        
        # Resize for faster processing
        frame = resize_frame(frame)
        
        # Recognize face with error recovery
        try:
            name, confidence = recognize_face_in_frame(frame, db_path, threshold)
        except Exception as recog_err:
            logger.error(f"Recognition error: {recog_err}")
            return jsonify({
                'success': False,
                'message': 'Recognition processing failed',
                'status': 'error'
            }), 200
        
        if name and confidence:
            return jsonify({
                'success': True,
                'status': 'success',
                'name': name,
                'student_id': name,
                'confidence': float(confidence),
                'message': f'Match found: {name}'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'No match found',
                'status': 'no_match'
            }), 200
            
    except Exception as e:
        logger.error(f"Error in /match endpoint: {e}")
        return jsonify({
            'success': False,
            'message': str(e),
            'status': 'error'
        }), 500
    finally:
        # Force garbage collection to free memory
        gc.collect()


@app.route('/scan-face', methods=['POST'])
def scan_face_endpoint():
    """Scan and recognize a face from webcam."""
    try:
        data = request.get_json() or {}
        db_path = data.get('db_path', DB_PATH)
        
        if not os.path.exists(db_path):
            return jsonify({
                'success': False,
                'message': f'Database path not found: {db_path}'
            }), 400
        
        return jsonify({
            'success': True,
            'message': 'Use /match endpoint for base64 image recognition'
        }), 200
        
    except Exception as e:
        logger.error(f"Error in /scan-face endpoint: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'db_path': DB_PATH,
        'db_exists': os.path.exists(DB_PATH),
        'representations': list_representation_files(DB_PATH)
    }), 200


@app.route('/reload', methods=['POST'])
def reload_endpoint():
    data = request.get_json() or {}
    db_path = data.get('db_path', DB_PATH)
    result = rebuild_representations(db_path)
    status_code = 200 if result.get('success') else 500
    return jsonify(result), status_code


@app.errorhandler(404)
def not_found(e):
    """404 error handler."""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(e):
    """500 error handler."""
    logger.error(f"Internal server error: {e}")
    return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    logger.info("Starting Face Scanning and Recognition Service")
    logger.info(f"Database path: {DB_PATH}")
    logger.info(f"Model: {MODEL_NAME}, Detector: {DETECTOR_BACKEND}, Threshold: {COSINE_THRESHOLD}")
    logger.info(f"Listening on http://127.0.0.1:5000")
    # Don't kick off background rebuild - it causes threading issues
    # try:
    #     threading.Thread(target=rebuild_representations, args=(DB_PATH,), daemon=True).start()
    # except Exception as e:
    #     logger.warning(f"Failed to start background rebuild: {e}")
    
    # Use waitress for production (better handling of long requests)
    try:
        from waitress import serve
        serve(app, host='127.0.0.1', port=5000, threads=4, channel_timeout=120)
    except ImportError:
        logger.warning("Waitress not available, falling back to Flask development server")
        # Fallback to Flask development server
        app.run(
            host='127.0.0.1',
            port=5000,
            debug=False,
            threaded=True,
            use_reloader=False
        )
