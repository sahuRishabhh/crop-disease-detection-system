"""Knowledge base service providing verified crop disease details, symptoms, prevention, and management."""

import json
from pathlib import Path
from typing import Dict, Any, Optional

KB_PATH = Path(__file__).resolve().parent / "diseases.json"

class DiseaseKnowledgeBase:
    _instance: Optional["DiseaseKnowledgeBase"] = None
    _data: Dict[str, Any] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DiseaseKnowledgeBase, cls).__new__(cls)
            cls._instance._load()
        return cls._instance

    def _load(self):
        if KB_PATH.exists():
            with open(KB_PATH, "r", encoding="utf-8") as f:
                self._data = json.load(f)
        else:
            self._data = {}

    def get_info(self, class_name: str) -> Dict[str, Any]:
        """Look up verified details for a class label, or synthesize safe general info."""
        if class_name in self._data:
            info = self._data[class_name]
            return {
                "class_id": class_name,
                "crop_name": info.get("crop_name", self.extract_crop_name(class_name)),
                "disease_name": info.get("disease_name", self.extract_disease_name(class_name)),
                "is_healthy": info.get("is_healthy", "healthy" in class_name.lower()),
                "pathogen": info.get("pathogen", "N/A"),
                "symptoms": info.get("symptoms", []),
                "prevention": info.get("prevention", []),
                "management": info.get("management", []),
                "limitations": info.get("limitations", "Diagnostic predictions are preliminary. Confirm with an agricultural professional."),
                "references": info.get("references", []),
                "verified": True
            }

        # Safe fallback for unindexed class names
        crop = self.extract_crop_name(class_name)
        disease = self.extract_disease_name(class_name)
        is_healthy = "healthy" in class_name.lower()

        return {
            "class_id": class_name,
            "crop_name": crop,
            "disease_name": disease,
            "is_healthy": is_healthy,
            "pathogen": "Consult regional agricultural diagnostic lab",
            "symptoms": [
                "Detailed knowledge base profile not yet indexed for this exact pathogen variant.",
                "Observe leaf surfaces for chlorosis, necrosis, stunting, or fungal sporulation."
            ],
            "prevention": [
                "Practice standard crop rotation and sanitary pruning.",
                "Ensure balanced soil moisture and avoid wetting foliage during irrigation."
            ],
            "management": [
                "Isolate affected plants if symptoms spread rapidly.",
                "Consult your local agricultural extension service for definitive identification and approved treatment."
            ],
            "limitations": "Specific agronomic guidance is not available for this label. Do not apply chemical treatments without professional verification.",
            "references": ["Local Agricultural Extension Service"],
            "verified": False
        }

    @staticmethod
    def extract_crop_name(class_name: str) -> str:
        parts = class_name.split("___")
        if len(parts) >= 2:
            return parts[0].replace("_", " ").title()
        return class_name.replace("_", " ").title()

    @staticmethod
    def extract_disease_name(class_name: str) -> str:
        parts = class_name.split("___")
        if len(parts) >= 2:
            name = parts[1].replace("_", " ").title().strip()
            if "Healthy" in name:
                return "Healthy Foliage"
            return name
        return "Unknown Condition"

    def list_all(self) -> Dict[str, Any]:
        return self._data

kb_service = DiseaseKnowledgeBase()
