import os
import sys
import json
import time
import argparse
import random
from pathlib import Path

# Add backend and parent directory to sys.path so ml models can be imported
current_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(current_dir.parent))
sys.path.insert(0, str(current_dir.parent / "backend"))

import numpy as np
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import ReduceLROnPlateau

from backend.app.ml.model import build_mobilenet_v2, build_resnet18
from training.dataset import create_dataloaders, generate_fixture_dataset

def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

def train_epoch(model, dataloader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for inputs, labels in dataloader:
        inputs, labels = inputs.to(device), labels.to(device)
        optimizer.zero_grad()

        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * inputs.size(0)
        _, preds = torch.max(outputs, 1)
        correct += torch.sum(preds == labels.data).item()
        total += labels.size(0)

    epoch_loss = running_loss / max(1, total)
    epoch_acc = correct / max(1, total)
    return epoch_loss, epoch_acc

def evaluate(model, dataloader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

    epoch_loss = running_loss / max(1, total)
    epoch_acc = correct / max(1, total)
    return epoch_loss, epoch_acc

def main():
    parser = argparse.ArgumentParser(description="Train MobileNetV2 Crop Disease Detection Model")
    parser.add_argument("--data-dir", type=str, default="data/fixtures", help="Path to dataset root")
    parser.add_argument("--epochs", type=int, default=5, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=8, help="Batch size for training")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    parser.add_argument("--model-name", type=str, default="mobilenet_v2", choices=["mobilenet_v2", "resnet18"])
    parser.add_argument("--smoke-test", action="store_true", help="Run 1 quick epoch to verify training pipeline")
    parser.add_argument("--generate-fixtures", action="store_true", help="Generate synthetic fixture dataset if missing")
    parser.add_argument("--checkpoint-dir", type=str, default="models", help="Directory to save model weights")
    parser.add_argument("--output-dir", type=str, default="outputs", help="Directory to save training curves & logs")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    args = parser.parse_args()

    set_seed(args.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[Training] Using computing device: {device}")

    data_dir = Path(args.data_dir)
    if args.generate_fixtures or not data_dir.exists() or len(list(data_dir.glob("*"))) == 0:
        print(f"[Training] Generating fixture dataset in '{data_dir}' for pipeline verification...")
        generate_fixture_dataset(str(data_dir), num_samples_per_class=12)

    # Dataloaders
    train_loader, val_loader, test_loader, classes = create_dataloaders(
        str(data_dir),
        batch_size=args.batch_size
    )

    print(f"[Training] Discovered {len(classes)} classes: {classes}")
    print(f"[Training] Training samples: {len(train_loader.dataset)}, Validation samples: {len(val_loader.dataset)}")

    if len(classes) < 2:
        print("[Error] Dataset must contain at least 2 distinct classes.")
        sys.exit(1)

    # Initialize model
    if args.model_name == "resnet18":
        model = build_resnet18(num_classes=len(classes), pretrained=True)
    else:
        model = build_mobilenet_v2(num_classes=len(classes), pretrained=True)

    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=2)

    epochs = 1 if args.smoke_test else args.epochs
    best_val_loss = float("inf")
    best_val_acc = 0.0

    checkpoint_dir = Path(args.checkpoint_dir)
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    best_checkpoint_path = checkpoint_dir / f"{args.model_name}_crop_disease.pt"
    classes_path = checkpoint_dir / "class_labels.json"

    # Save class mapping
    with open(classes_path, "w", encoding="utf-8") as f:
        json.dump(classes, f, indent=2)

    history = {
        "model_name": args.model_name,
        "epochs": epochs,
        "batch_size": args.batch_size,
        "learning_rate": args.lr,
        "device": str(device),
        "smoke_test": args.smoke_test,
        "classes": classes,
        "train_loss": [],
        "train_acc": [],
        "val_loss": [],
        "val_acc": [],
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    start_train_time = time.time()
    print(f"[Training] Starting training run ({epochs} epochs)...")

    for epoch in range(1, epochs + 1):
        ep_start = time.time()
        t_loss, t_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        v_loss, v_acc = evaluate(model, val_loader, criterion, device)
        scheduler.step(v_loss)

        ep_duration = time.time() - ep_start
        history["train_loss"].append(round(t_loss, 4))
        history["train_acc"].append(round(t_acc, 4))
        history["val_loss"].append(round(v_loss, 4))
        history["val_acc"].append(round(v_acc, 4))

        print(
            f"Epoch [{epoch}/{epochs}] ({ep_duration:.1f}s) - "
            f"Train Loss: {t_loss:.4f}, Train Acc: {t_acc*100:.2f}% | "
            f"Val Loss: {v_loss:.4f}, Val Acc: {v_acc*100:.2f}%"
        )

        # Save checkpoint if best validation loss
        if v_loss < best_val_loss or epoch == 1:
            best_val_loss = v_loss
            best_val_acc = v_acc
            torch.save({
                "model_name": args.model_name,
                "num_classes": len(classes),
                "classes": classes,
                "state_dict": model.state_dict(),
                "val_loss": v_loss,
                "val_acc": v_acc,
                "epoch": epoch
            }, best_checkpoint_path)
            print(f"  --> Saved new best checkpoint to {best_checkpoint_path}")

    total_time = time.time() - start_train_time
    history["total_training_time_seconds"] = round(total_time, 2)
    history["best_val_loss"] = round(best_val_loss, 4)
    history["best_val_acc"] = round(best_val_acc, 4)

    # Save history
    history_file = output_dir / "training_history.json"
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    print(f"[Training] Completed in {total_time:.1f}s. History saved to {history_file}")

if __name__ == "__main__":
    main()
