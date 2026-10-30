import torch
import torch.nn as nn
from torchvision import models
from typing import Optional

def build_mobilenet_v2(num_classes: int, pretrained: bool = True) -> nn.Module:
    """
    Builds a MobileNetV2 model adapted for crop disease classification.
    """
    if pretrained:
        try:
            weights = models.MobileNet_V2_Weights.DEFAULT
            model = models.mobilenet_v2(weights=weights)
        except Exception:
            model = models.mobilenet_v2(weights=None)
    else:
        model = models.mobilenet_v2(weights=None)

    # In MobileNetV2, classifier is a Sequential: Dropout(0.2), Linear(1280, num_classes)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(in_features, num_classes)
    )
    return model

def build_resnet18(num_classes: int, pretrained: bool = True) -> nn.Module:
    """
    Builds a ResNet18 model adapted for crop disease classification.
    """
    if pretrained:
        try:
            weights = models.ResNet18_Weights.DEFAULT
            model = models.resnet18(weights=weights)
        except Exception:
            model = models.resnet18(weights=None)
    else:
        model = models.resnet18(weights=None)

    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    return model
