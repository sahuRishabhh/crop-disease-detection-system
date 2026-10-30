# Model Training & Evaluation Guide

## 1. Quick Verification (Smoke-Test Mode)
To verify that the dataset loader, GPU/CPU allocator, PyTorch model head, and optimizer operate correctly without running an extensive training cycle:
```powershell
.\venv\Scripts\python.exe training/train.py --smoke-test --batch-size 8
```

## 2. Full Training Run
To train a model on custom or benchmark data:
```powershell
.\venv\Scripts\python.exe training/train.py --data-dir data/fixtures --epochs 5 --batch-size 8 --lr 0.001 --model-name mobilenet_v2
```

Command-Line Flags:
- `--data-dir`: Path to dataset directory (defaults to `data/fixtures`)
- `--epochs`: Total training iterations
- `--batch-size`: Batch size (e.g. 8 for CPU, 32 or 64 for GPU)
- `--lr`: Learning rate (defaults to 0.001)
- `--model-name`: Architecture (`mobilenet_v2` or `resnet18`)
- `--seed`: Pseudo-random seed for reproducibility (defaults to 42)

## 3. Evaluation Pipeline
Evaluate the trained checkpoint against the held-out test split:
```powershell
.\venv\Scripts\python.exe training/evaluate.py --data-dir data/fixtures --checkpoint models/mobilenet_v2_crop_disease.pt
```
Outputs produced under `outputs/`:
- `metrics.json`: Overall accuracy, macro F1, weighted F1, per-class metrics, and inference latency.
- `confusion_matrix.png`: High-resolution annotated confusion matrix plot.
- `training_curves.png`: Training vs. validation loss and accuracy curves over epochs.
