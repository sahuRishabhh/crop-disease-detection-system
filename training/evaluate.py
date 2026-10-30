import sys
import json
import time
import argparse
from pathlib import Path

# Add backend and root to sys.path
current_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(current_dir.parent))
sys.path.insert(0, str(current_dir.parent / "backend"))

import numpy as np
import torch
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix

from backend.app.ml.model import build_mobilenet_v2, build_resnet18
from training.dataset import create_dataloaders

def plot_confusion_matrix(cm, classes, output_path: str):
    fig, ax = plt.subplots(figsize=(10, 8))
    im = ax.imshow(cm, interpolation="nearest", cmap=plt.cm.Greens)
    ax.figure.colorbar(im, ax=ax)

    # Clean display labels
    display_labels = [c.replace("___", " - ").replace("_", " ") for c in classes]

    ax.set(
        xticks=np.arange(cm.shape[1]),
        yticks=np.arange(cm.shape[0]),
        xticklabels=display_labels,
        yticklabels=display_labels,
        title="Evaluation Confusion Matrix",
        ylabel="Ground Truth Class",
        xlabel="Predicted Class"
    )

    plt.setp(ax.get_xticklabels(), rotation=45, ha="right", rotation_mode="anchor")

    # Annotate numbers
    thresh = cm.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(
                j, i, format(cm[i, j], "d"),
                ha="center", va="center",
                color="white" if cm[i, j] > thresh else "black"
            )

    fig.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches="tight")
    plt.close()

def plot_training_curves(history_path: str, output_path: str):
    if not Path(history_path).exists():
        return
    with open(history_path, "r", encoding="utf-8") as f:
        history = json.load(f)

    epochs = range(1, len(history.get("train_loss", [])) + 1)
    if not epochs:
        return

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Loss curve
    ax1.plot(epochs, history["train_loss"], "o-", color="#15803d", label="Train Loss")
    ax1.plot(epochs, history["val_loss"], "s--", color="#dc2626", label="Val Loss")
    ax1.set_title("Cross-Entropy Loss vs Epochs")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Loss")
    ax1.grid(True, linestyle="--", alpha=0.5)
    ax1.legend()

    # Accuracy curve
    ax2.plot(epochs, [a * 100 for a in history["train_acc"]], "o-", color="#15803d", label="Train Acc (%)")
    ax2.plot(epochs, [a * 100 for a in history["val_acc"]], "s--", color="#2563eb", label="Val Acc (%)")
    ax2.set_title("Classification Accuracy vs Epochs")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Accuracy (%)")
    ax2.grid(True, linestyle="--", alpha=0.5)
    ax2.legend()

    fig.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches="tight")
    plt.close()

def evaluate_model():
    parser = argparse.ArgumentParser(description="Evaluate Trained Crop Disease Model")
    parser.add_argument("--data-dir", type=str, default="data/fixtures", help="Path to evaluation dataset")
    parser.add_argument("--checkpoint", type=str, default="models/mobilenet_v2_crop_disease.pt")
    parser.add_argument("--classes", type=str, default="models/class_labels.json")
    parser.add_argument("--output-dir", type=str, default="outputs")
    args = parser.parse_args()

    checkpoint_path = Path(args.checkpoint)
    classes_path = Path(args.classes)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    if not checkpoint_path.exists() or not classes_path.exists():
        print(f"[Evaluation Error] Checkpoint '{checkpoint_path}' or labels '{classes_path}' not found.")
        sys.exit(1)

    with open(classes_path, "r", encoding="utf-8") as f:
        class_labels = json.load(f)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[Evaluation] Device: {device}, Classes ({len(class_labels)}): {class_labels}")

    # Build and load model
    model = build_mobilenet_v2(num_classes=len(class_labels), pretrained=False)
    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)
    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        model.load_state_dict(checkpoint["state_dict"])
    elif isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    elif isinstance(checkpoint, dict):
        model.load_state_dict(checkpoint)

    model.to(device)
    model.eval()

    # Load test/eval dataloader
    _, _, test_loader, dataset_classes = create_dataloaders(args.data_dir, batch_size=8)

    y_true = []
    y_pred = []
    latencies = []

    print("[Evaluation] Running inference over evaluation set...")
    with torch.no_grad():
        for inputs, targets in test_loader:
            for i in range(inputs.size(0)):
                single_input = inputs[i:i+1].to(device)
                t0 = time.perf_counter()
                out = model(single_input)
                t1 = time.perf_counter()
                latencies.append((t1 - t0) * 1000)

                pred_idx = torch.argmax(out, dim=1).item()
                y_true.append(targets[i].item())
                y_pred.append(pred_idx)

    y_true_np = np.array(y_true)
    y_pred_np = np.array(y_pred)

    # Compute metrics
    report_dict = classification_report(
        y_true_np,
        y_pred_np,
        target_names=class_labels,
        output_dict=True,
        zero_division=0
    )
    cm = confusion_matrix(y_true_np, y_pred_np, labels=list(range(len(class_labels))))

    avg_latency = float(np.mean(latencies))
    metrics_summary = {
        "model_path": str(checkpoint_path),
        "total_test_samples": len(y_true),
        "overall_accuracy": round(float(report_dict.get("accuracy", 0.0)), 4),
        "macro_avg_f1": round(float(report_dict.get("macro avg", {}).get("f1-score", 0.0)), 4),
        "weighted_avg_f1": round(float(report_dict.get("weighted avg", {}).get("f1-score", 0.0)), 4),
        "average_inference_latency_ms": round(avg_latency, 2),
        "classification_report": report_dict,
        "evaluation_timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    # Save metrics JSON
    metrics_file = output_dir / "metrics.json"
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)

    # Plot Confusion Matrix
    cm_path = output_dir / "confusion_matrix.png"
    plot_confusion_matrix(cm, class_labels, str(cm_path))

    # Plot curves
    history_file = output_dir / "training_history.json"
    curves_path = output_dir / "training_curves.png"
    plot_training_curves(str(history_file), str(curves_path))

    print(f"[Evaluation] Metrics saved to {metrics_file}")
    print(f"[Evaluation] Overall Accuracy: {metrics_summary['overall_accuracy']*100:.2f}%")
    print(f"[Evaluation] Average Latency: {avg_latency:.2f} ms")
    print(f"[Evaluation] Confusion Matrix plot: {cm_path}")

if __name__ == "__main__":
    evaluate_model()
