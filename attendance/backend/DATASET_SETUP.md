# Dataset Setup Guide - Multiple Images per Student

## Current Structure

```
dataset/
├── Anjaneyulu/
│   ├── photo1.jpg
│   ├── photo2.jpg
│   └── photo3.jpg (add more!)
├── Rahul/
│   └── image.jpg (add more!)
├── Sai/
│   └── image.jpg (add more!)
├── Santhosh/
│   └── image.jpg (add more!)
└── Venkat/
    └── image.jpg (add more!)
```

## How to Add Multiple Images

### Step 1: Prepare Photos
- Take **5-10 different photos** of each student
- Vary the angles, lighting, and expressions
- Use different devices (phone, camera, webcam)
- Include different distances from camera
- Different facial expressions (neutral, slight smile)

### Step 2: Add Photos to Dataset
For **Anjaneyulu**, add multiple photos:

```
D:\Face-recognition-attendance-system\attendance\backend\dataset\Anjaneyulu\
├── anjaneyulu_01.jpg
├── anjaneyulu_02.jpg
├── anjaneyulu_03.jpg
├── anjaneyulu_04.jpg
├── anjaneyulu_05.jpg
├── anjaneyulu_06.jpg
└── ... (more photos)
```

### Step 3: Supported Image Formats
- ✅ `.jpg` / `.jpeg`
- ✅ `.png`
- ✅ `.bmp`
- ✅ `.gif`

### Step 4: Image Quality Requirements
- **Minimum resolution**: 100x100 pixels
- **Recommended**: 300x300 to 640x480 pixels
- **Face visibility**: Face should be clear and recognizable
- **Lighting**: Natural light preferred, but system handles low-light
- **Distance**: Face should take 50-90% of image

### Step 5: Test Recognition
Once you add images:
1. Refresh the Flask service (it will rebuild the model cache)
2. Go to http://localhost:5173/scan
3. Test face recognition
4. The system will now match against ALL uploaded photos

## Why Multiple Images?

| Images | Recognition Accuracy |
|--------|---------------------|
| 1 image | ~70% | 
| 3-4 images | ~85% |
| 5-10 images | ~95% |
| 10+ images | ~98% |

The system uses **ArcFace** which learns face embeddings. More images = better embeddings = higher accuracy.

## Benefits of Diverse Images

1. **Different angles** - Face recognition works better with multiple angles
2. **Different lighting** - Low-light preprocessing works with more samples
3. **Different expressions** - More natural matching in real scenarios
4. **Different distances** - Captures various scales
5. **Different devices** - Works with different cameras/phones

## How the System Works

When you scan:
1. Your live webcam frame is captured
2. System extracts face embedding (using ArcFace)
3. System compares against ALL images in each student folder
4. Returns the best match (closest embedding distance)
5. Confidence = 1 - distance (0.0 = no match, 1.0 = perfect match)

## Threshold Settings

Current threshold: **0.65 cosine distance**

| Confidence | Match Status |
|-----------|--------------|
| 0.95+ | Very confident match |
| 0.85-0.95 | Confident match |
| 0.75-0.85 | Good match |
| 0.65-0.75 | Borderline match |
| < 0.65 | No match |

## Quick Start - Add Photos Now

1. **For Anjaneyulu**: Add 5-10 different photos to `dataset/Anjaneyulu/`
2. **For Others**: Add 3-5 photos to each folder
3. **Refresh**: Restart Flask (it auto-caches new images)
4. **Test**: Open http://localhost:5173/scan and scan your face

## Troubleshooting

**Still getting "no match"?**
- Add more diverse images
- Ensure face is clearly visible in photos
- Check lighting conditions match your environment
- Verify image files are valid JPG/PNG files

**Getting multiple matches?**
- System will return the BEST match automatically
- Confidence score shows how confident the match is
- Lower threshold = stricter matching (more false negatives)
- Higher threshold = looser matching (more false positives)

## Advanced: Adjust Threshold

To change matching sensitivity, edit `deepface_scan.py`:

```python
COSINE_THRESHOLD = 0.65  # Current
# Lower = stricter (0.50)
# Higher = more lenient (0.75)
```

Then restart Flask.
