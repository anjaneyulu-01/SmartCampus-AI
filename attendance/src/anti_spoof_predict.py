"""Editor-only stub for src.anti_spoof_predict
This provides a minimal signature so static checkers stop reporting unresolved imports.
Runtime will use the actual implementation from the external repo when present.
"""
from typing import Any, Optional

class AntiSpoofPredict:
    def __init__(self, device_id: int = 0):
        pass

    def predict(self, img: Any, model_path: str) -> Optional[float]:
        """Stub predict: real repo returns softmax array; this stub returns None."""
        return None


class Detection(AntiSpoofPredict):
    def get_bbox(self, img) -> list:
        return [0, 0, img.shape[1]-1 if hasattr(img, 'shape') else 0, img.shape[0]-1 if hasattr(img, 'shape') else 0]
