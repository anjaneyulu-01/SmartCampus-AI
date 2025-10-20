"""Editor-only stub for src.generate_patches.CropImage
Provides a crop(img, bbox, scale, out_w, out_h, crop=True) method compatible with main.py usage.
"""
import cv2
import numpy as np

class CropImage:
    def crop(self, org_img, bbox, scale, out_w, out_h, crop=True):
        # Minimal behavior: if crop requested, try to slice bbox region; otherwise resize whole image
        try:
            if not crop:
                return cv2.resize(org_img, (out_w, out_h))
            x, y, w, h = bbox
            h_img, w_img = org_img.shape[0], org_img.shape[1]
            x2 = min(w_img-1, x + w)
            y2 = min(h_img-1, y + h)
            patch = org_img[y:y2, x:x2]
            if patch is None or patch.size == 0:
                return cv2.resize(org_img, (out_w, out_h))
            return cv2.resize(patch, (out_w, out_h))
        except Exception:
            return cv2.resize(org_img, (out_w, out_h))
