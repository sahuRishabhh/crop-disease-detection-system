# Dataset & Preprocessing Specification

## 1. Directory Structure
The training and inference engine expects class-separated directory layouts:
```
data/
  train/
    <Crop>___<Disease>/
    <Crop>___healthy/
  val/
    <Crop>___<Disease>/
    <Crop>___healthy/
  test/
    <Crop>___<Disease>/
    <Crop>___healthy/
```
Alternatively, a flat directory of class folders will be partitioned into a reproducible $70\% / 15\% / 15\%$ train/val/test split using fixed random seeds.

## 2. Integrity Verification
During dataset scanning:
- Every image file is validated with PIL `.verify()` to detect truncated or corrupted files.
- Non-standard image extensions or zero-byte files are filtered out automatically.

## 3. Data Augmentation
To combat overfitting in foliar pathology:
- `RandomResizedCrop(224, scale=(0.8, 1.0))`
- `RandomHorizontalFlip(p=0.5)`
- `RandomVerticalFlip(p=0.2)`
- `RandomRotation(degrees=15)`
- `ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1)`

Evaluation and testing use deterministic transforms:
- `Resize(256)`
- `CenterCrop(224)`
- `ToTensor()`
- `Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])`
