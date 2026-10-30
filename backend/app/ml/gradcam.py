import io
import base64
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
import matplotlib as mpl
import matplotlib.cm as cm

class GradCAM:
    """
    Grad-CAM implementation for MobileNetV2 features layer.
    Extracts class activation maps to visualize spatial regions influencing the prediction.
    """
    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output

        def backward_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0]

        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)

    def generate_heatmap(self, input_tensor: torch.Tensor, class_idx: int) -> np.ndarray:
        self.model.eval()
        self.model.zero_grad()
        
        output = self.model(input_tensor)
        score = output[0, class_idx]
        score.backward()

        # Global average pooling of gradients
        gradients = self.gradients[0] # (C, H, W)
        activations = self.activations[0] # (C, H, W)
        weights = torch.mean(gradients, dim=(1, 2), keepdim=True) # (C, 1, 1)

        cam = torch.sum(weights * activations, dim=0).detach().cpu().numpy()
        cam = np.maximum(cam, 0) # ReLU
        
        # Normalize between 0 and 1
        cam_max = np.max(cam)
        if cam_max > 0:
            cam = cam / cam_max
        else:
            cam = np.zeros_like(cam)
            
        return cam

def create_gradcam_overlay(
    cam: np.ndarray,
    original_img: Image.Image,
    alpha: float = 0.5,
    colormap_name: str = "jet"
) -> str:
    """
    Overlays Grad-CAM heatmap on original leaf image and returns base64 PNG data URL.
    """
    # Resize CAM to original image size
    w, h = original_img.size
    cam_pil = Image.fromarray((cam * 255).astype(np.uint8)).resize((w, h), resample=Image.Resampling.BILINEAR)
    cam_resized = np.array(cam_pil) / 255.0

    # Apply colormap
    try:
        cmap = mpl.colormaps[colormap_name]
    except Exception:
        cmap = cm.get_cmap(colormap_name)
    heatmap_colored = cmap(cam_resized)[:, :, :3] # discard alpha, shape (H, W, 3) in [0, 1]
    heatmap_uint8 = (heatmap_colored * 255).astype(np.uint8)

    # Blend original with heatmap
    original_np = np.array(original_img.convert("RGB"))
    blended = (alpha * heatmap_uint8 + (1 - alpha) * original_np).astype(np.uint8)
    blended_img = Image.fromarray(blended)

    # Encode to base64
    buf = io.BytesIO()
    blended_img.save(buf, format="JPEG", quality=85)
    b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64_str}"
