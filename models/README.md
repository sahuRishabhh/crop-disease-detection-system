# Deep Learning Model Weights & Architecture Reference

This directory houses trained PyTorch model checkpoints and the categorical class label dictionary for the Crop Disease Detection System.

---

## 1. Directory Files

| File | Size | Format | Description |
| :--- | :--- | :--- | :--- |
| `mobilenet_v2_crop_disease.pt` | ~8.76 MB | PyTorch checkpoint (`torch.save`) | Trained MobileNetV2 state dict, model metadata, and class indices |
| `class_labels.json` | ~242 B | JSON array | Ordered list of 9 indexed target class strings |

---

## 2. Model Architecture Specifications

- **Base Architecture**: MobileNetV2 (Sandler et al., 2018)
- **Transfer Learning Backbone**: Pre-trained on ImageNet-1k (`MobileNet_V2_Weights.DEFAULT`)
- **Input Dimensions**: $3 \times 224 \times 224$ (RGB)
- **Input Normalization**:
  - Channel Means: $\mu = [0.485, 0.456, 0.406]$
  - Channel Std Dev: $\sigma = [0.229, 0.224, 0.225]$
- **Modified Classification Head**:
  ```python
  Sequential(
    (0): Dropout(p=0.2, inplace=False)
    (1): Linear(in_features=1280, out_features=9, bias=True)
  )
  ```
- **Visual Explainability (Grad-CAM)**:
  - Target Feature Layer: `model.features[-1]` (Conv2dNormActivation output: $1280 \times 7 \times 7$)
  - Activation mapping: Positive gradient weighting with ReLU rectification and spatial bilinear interpolation.

---

## 3. Supported Foliar Pathology Classes (9 Classes)

The model is indexed against 9 foliar conditions across 4 major economic host crops:

1. `Apple___Apple_scab` (*Venturia inaequalis*)
2. `Apple___healthy` (Healthy foliage)
3. `Corn_(maize)___Common_rust_` (*Puccinia sorghi*)
4. `Corn_(maize)___healthy` (Healthy foliage)
5. `Potato___Early_blight` (*Alternaria solani*)
6. `Potato___healthy` (Healthy foliage)
7. `Tomato___Early_blight` (*Alternaria solani*)
8. `Tomato___Late_blight` (*Phytophthora infestans*)
9. `Tomato___healthy` (Healthy foliage)

---

## 4. Model Training & Placement Instructions

### To Train a New Model Checkpoint
To train from scratch or fine-tune with custom data:

```powershell
# Quick baseline training (3 epochs on fixtures)
.\venv\Scripts\python.exe training/train.py --epochs 3 --batch-size 8 --lr 0.001

# Train on custom PlantVillage dataset
.\venv\Scripts\python.exe training/train.py --data-dir data/plantvillage --epochs 10 --batch-size 16 --lr 0.001
```

The training script automatically saves the resulting checkpoint to:
`models/mobilenet_v2_crop_disease.pt` and exports the label map to `models/class_labels.json`.

### Manual Checkpoint Placement
If importing an external or pre-computed weight checkpoint:
1. Ensure the checkpoint was trained on compatible class labels.
2. Place the `.pt` file at `models/mobilenet_v2_crop_disease.pt`.
3. Verify that `models/class_labels.json` lists each class matching the model's output dimension.
4. Run automated tests to verify load integrity:
   ```powershell
   .\venv\Scripts\pytest backend/tests/test_predict.py -v
   ```
