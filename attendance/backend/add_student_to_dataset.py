"""
Quick script to add a student to the face recognition dataset.

Usage:
    python add_student_to_dataset.py <student_name> <image_path>
    
Example:
    python add_student_to_dataset.py "John" "path/to/john.jpg"
    python add_student_to_dataset.py "Jane" "path/to/jane1.jpg" "path/to/jane2.jpg"
"""

import os
import sys
import shutil
from pathlib import Path

# Get the script directory
SCRIPT_DIR = Path(__file__).parent
DATASET_DIR = SCRIPT_DIR / "dataset"

def add_student_images(student_name, image_paths):
    """Add images for a student to the dataset."""
    
    # Create student directory if it doesn't exist
    student_dir = DATASET_DIR / student_name
    student_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 Student directory: {student_dir}")
    
    # Copy each image to the student directory
    copied = 0
    for idx, img_path in enumerate(image_paths, start=1):
        img_file = Path(img_path)
        
        if not img_file.exists():
            print(f"⚠️  Image not found: {img_path}")
            continue
        
        # Get file extension
        ext = img_file.suffix or '.jpg'
        
        # Copy to student directory with numbered filename
        dest_path = student_dir / f"{idx}{ext}"
        shutil.copy2(img_file, dest_path)
        
        print(f"✅ Copied: {img_file.name} → {dest_path.name}")
        copied += 1
    
    if copied > 0:
        print(f"\n✅ Successfully added {copied} image(s) for {student_name}")
        print(f"📍 Location: {student_dir}")
        print("\n⚠️  IMPORTANT: Restart the deepface_scan.py server to rebuild the face database!")
        print("   Run: python deepface_scan.py")
    else:
        print(f"\n❌ No images were added for {student_name}")
    
    return copied > 0


def main():
    if len(sys.argv) < 3:
        print("❌ Error: Not enough arguments")
        print("\nUsage:")
        print("  python add_student_to_dataset.py <student_name> <image_path1> [image_path2] ...")
        print("\nExample:")
        print('  python add_student_to_dataset.py "NewStudent" "photo1.jpg" "photo2.jpg"')
        sys.exit(1)
    
    student_name = sys.argv[1]
    image_paths = sys.argv[2:]
    
    print(f"\n🎓 Adding student: {student_name}")
    print(f"📸 Images to add: {len(image_paths)}")
    print("-" * 50)
    
    success = add_student_images(student_name, image_paths)
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
