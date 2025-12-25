import os
import cv2
import numpy as np


def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def make_card(w: int, h: int, bg: tuple, fg: tuple, text: str) -> np.ndarray:
    img = np.full((h, w, 3), bg, dtype=np.uint8)
    cv2.rectangle(img, (10, 10), (w - 10, h - 10), fg, 3)
    cv2.putText(img, text, (20, h // 2), cv2.FONT_HERSHEY_SIMPLEX, 1.0, fg, 2, cv2.LINE_AA)
    return img


def main():
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset"))
    alice_dir = os.path.join(base, "Alice")
    bob_dir = os.path.join(base, "Bob")
    ensure_dir(alice_dir)
    ensure_dir(bob_dir)

    a1 = make_card(320, 240, (240, 240, 240), (20, 120, 220), "Alice 1")
    a2 = make_card(320, 240, (235, 235, 235), (20, 120, 220), "Alice 2")
    b1 = make_card(320, 240, (240, 240, 240), (20, 200, 120), "Bob 1")

    cv2.imwrite(os.path.join(alice_dir, "1.jpg"), a1)
    cv2.imwrite(os.path.join(alice_dir, "2.jpg"), a2)
    cv2.imwrite(os.path.join(bob_dir, "1.jpg"), b1)

    print(f"Dataset created under: {base}")


if __name__ == "__main__":
    main()
