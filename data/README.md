# Crop Disease Datasets Directory

This directory contains dataset artifacts, verification fixtures, and curated sample foliage images for the Crop Disease Detection System.

---

## 1. Directory Structure

```
data/
├── fixtures/                  # Smoke-test & regression dataset fixtures (~1.7 MB total)
│   ├── train/                 # 9 classes (Apple, Corn, Potato, Tomato)
│   ├── val/                   # Validation split
│   └── test/                  # Held-out test split for automated evaluation
├── sample_images/             # Curated sample leaf images mounted at /sample_images
│   ├── apple_scab.jpg
│   ├── corn_common_rust.jpg
│   ├── potato_early_blight.jpg
│   ├── tomato_early_blight.jpg
│   └── tomato_healthy.jpg
└── README.md                  # Dataset documentation and source attribution
```

---

## 2. Benchmark Dataset Information & Source Attribution

- **Primary Benchmark Reference**: **PlantVillage Dataset**
- **Authors / Citation**:
  > Hughes, D., & Salathé, M. (2015). *An open access repository of images on plant health to enable the development of mobile disease diagnostics*. arXiv preprint arXiv:1511.08060.
- **Official Repository**: [spMohanty/PlantVillage-Dataset](https://github.com/spMohanty/PlantVillage-Dataset)
- **Dataset Dimensions**: ~54,303 expert-annotated images across 38 class categories and 14 crop species.
- **Storage Caution**: The full raw PlantVillage archive is ~827 MB compressed (~2 GB uncompressed). To prevent repository bloat, the full dataset is **excluded** from Git. Instead, the repository includes compact regression fixtures (`data/fixtures/`) and curated sample leaves (`data/sample_images/`).

---

## 3. Training on Custom or Full Datasets

To incorporate full PlantVillage or custom field data:

1. Download the dataset into `data/plantvillage/` or a custom folder with class subdirectories:
   ```
   data/plantvillage/
     ├── Apple___Apple_scab/
     ├── Apple___healthy/
     ├── Corn_(maize)___Common_rust_/
     └── ...
   ```
2. The dataset loader in `training/dataset.py` will automatically partition flat class folders into reproducible $70\% / 15\% / 15\%$ train/validation/test splits using a fixed random seed.
3. Run training:
   ```powershell
   .\venv\Scripts\python.exe training/train.py --data-dir data/plantvillage --epochs 10 --batch-size 16
   ```
