import io
import json
import time
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import torch
from torchvision import transforms
from PIL import Image

from .model import build_mobilenet_v2
from .gradcam import GradCAM, create_gradcam_overlay
from ..core.config import settings
from ..knowledge_base.service import kb_service

class ModelNotReadyError(Exception):
    """Raised when inference is requested but no valid model checkpoint is loaded."""
    pass

class InvalidImageError(Exception):
    """Raised when an uploaded file cannot be parsed as a valid image."""
    pass

class ModelManager:
    _instance: Optional["ModelManager"] = None

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model: Optional[torch.nn.Module] = None
        self.class_labels: List[str] = []
        self.gradcam: Optional[GradCAM] = None
        self.model_name = "MobileNetV2"
        self.is_loaded = False
        self.load_error: Optional[str] = None
        
        # Standard ImageNet normalization matching training pipeline
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        self.load_model()

    @classmethod
    def get_instance(cls) -> "ModelManager":
        if cls._instance is None:
            cls._instance = ModelManager()
        return cls._instance

    def load_model(self, model_path: Optional[str] = None, classes_path: Optional[str] = None):
        """Loads trained weights and class labels if present."""
        m_path = Path(model_path or settings.MODEL_PATH)
        c_path = Path(classes_path or settings.CLASSES_PATH)

        if not m_path.exists() or not c_path.exists():
            self.is_loaded = False
            self.load_error = f"Checkpoint or labels missing. Expected at '{m_path}' and '{c_path}'."
            return

        try:
            with open(c_path, "r", encoding="utf-8") as f:
                self.class_labels = json.load(f)

            num_classes = len(self.class_labels)
            model = build_mobilenet_v2(num_classes=num_classes, pretrained=False)
            
            # Load checkpoint
            checkpoint = torch.load(m_path, map_location=self.device, weights_only=False)
            if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
                model.load_state_dict(checkpoint["state_dict"])
            elif isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
                model.load_state_dict(checkpoint["model_state_dict"])
            elif isinstance(checkpoint, dict):
                model.load_state_dict(checkpoint)
            else:
                model = checkpoint

            model.to(self.device)
            model.eval()
            self.model = model

            # Attach Grad-CAM to MobileNetV2's final feature conv layer
            target_layer = self.model.features[-1]
            self.gradcam = GradCAM(self.model, target_layer)

            self.is_loaded = True
            self.load_error = None
        except Exception as e:
            self.is_loaded = False
            self.load_error = f"Failed to load model checkpoint: {str(e)}"

    @property
    def is_ready(self) -> bool:
        return self.is_loaded and self.model is not None and len(self.class_labels) > 0

    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Runs real inference on an input image buffer.
        """
        if not self.is_ready:
            raise ModelNotReadyError(
                self.load_error or "Trained model checkpoint is not loaded. Train a model or place checkpoint in models/ directory."
            )

        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            pil_img = pil_img.convert("RGB")
        except Exception:
            raise InvalidImageError("Uploaded file cannot be decoded as an image. Supported formats: JPEG, PNG, WEBP.")

        # Preprocess tensor
        input_tensor = self.transform(pil_img).unsqueeze(0).to(self.device)

        start_time = time.perf_counter()
        with torch.no_grad():
            logits = self.model(input_tensor)
            probabilities = torch.softmax(logits, dim=1)[0]
        inference_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Top prediction
        conf_val, pred_idx = torch.max(probabilities, dim=0)
        conf = float(conf_val.item())
        pred_class = self.class_labels[pred_idx.item()]

        # Top-5 predictions
        k = min(5, len(self.class_labels))
        top_k_probs, top_k_indices = torch.topk(probabilities, k=k)
        top_predictions = []
        for p, idx in zip(top_k_probs, top_k_indices):
            c_name = self.class_labels[idx.item()]
            info = kb_service.get_info(c_name)
            top_predictions.append({
                "class_name": c_name,
                "crop_name": info["crop_name"],
                "disease_name": info["disease_name"],
                "confidence": round(float(p.item()), 4)
            })

        # Explainability: Grad-CAM heatmap
        gradcam_overlay_b64 = None
        if self.gradcam:
            try:
                # Require grad for Grad-CAM
                input_tensor_grad = input_tensor.clone().requires_grad_(True)
                cam = self.gradcam.generate_heatmap(input_tensor_grad, pred_idx.item())
                gradcam_overlay_b64 = create_gradcam_overlay(cam, pil_img, alpha=0.45)
            except Exception:
                gradcam_overlay_b64 = None

        # Warning when confidence is below threshold
        warning = None
        if conf < settings.CONFIDENCE_THRESHOLD:
            warning = (
                f"Prediction confidence ({conf*100:.1f}%) is below the recommended threshold "
                f"({settings.CONFIDENCE_THRESHOLD*100:.0f}%). The leaf symptoms may be ambiguous or outside the training distribution. "
                "Consult a certified agronomy extension specialist for confirmation."
            )

        # Knowledge Base guidance
        kb_info = kb_service.get_info(pred_class)

        return {
            "predicted_class": pred_class,
            "crop_name": kb_info["crop_name"],
            "disease_name": kb_info["disease_name"],
            "is_healthy": kb_info["is_healthy"],
            "confidence": round(conf, 4),
            "model_name": self.model_name,
            "inference_time_ms": inference_time_ms,
            "warning": warning,
            "top_predictions": top_predictions,
            "guidance": {
                "pathogen": kb_info.get("pathogen"),
                "symptoms": kb_info.get("symptoms", []),
                "prevention": kb_info.get("prevention", []),
                "management": kb_info.get("management", []),
                "limitations": kb_info.get("limitations"),
                "references": kb_info.get("references", []),
                "verified": kb_info.get("verified", False)
            },
            "gradcam_base64": gradcam_overlay_b64
        }

model_manager = ModelManager.get_instance()
