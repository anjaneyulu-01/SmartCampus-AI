import os
import shutil
from pathlib import Path


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def is_probable_name(stem: str) -> bool:
    # consider alphabetic stems as person names (skip pure numeric IDs and dotfiles)
    return stem and not stem.startswith(".") and any(c.isalpha() for c in stem)


def main():
    root = Path(__file__).resolve().parents[1]
    known = root / "known_faces"
    dataset = root / "dataset"
    dataset.mkdir(parents=True, exist_ok=True)

    created = 0
    for p in known.iterdir():
        if not p.is_file():
            continue
        if p.suffix.lower() not in IMAGE_EXTS:
            continue
        stem = p.stem
        if not is_probable_name(stem):
            continue
        person_dir = dataset / stem.capitalize()
        person_dir.mkdir(parents=True, exist_ok=True)
        dst = person_dir / "1.jpg"
        try:
            shutil.copy2(str(p), str(dst))
            created += 1
        except Exception:
            pass

    print(f"Prepared dataset at: {dataset} with {created} person(s)")


if __name__ == "__main__":
    main()
