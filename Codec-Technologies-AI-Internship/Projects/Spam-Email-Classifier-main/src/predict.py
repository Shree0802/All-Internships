import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import time
import logging
import joblib
import numpy as np

from src.utils import get_project_root
from src.preprocessing import clean_text

logger = logging.getLogger(__name__)


class SpamPredictor:
    """Load the trained spam model and vectorizer for inference."""

    def __init__(self, model_path: Path = None, vectorizer_path: Path = None):
        root = get_project_root()
        model_path = model_path or root / "models" / "best_model.pkl"
        vectorizer_path = vectorizer_path or root / "models" / "vectorizer.pkl"

        if not model_path.exists() or not vectorizer_path.exists():
            raise FileNotFoundError(
                "ML model files are missing. Include models/best_model.pkl and models/vectorizer.pkl."
            )

        self.model = joblib.load(model_path)
        self.vectorizer = joblib.load(vectorizer_path)

        meta_path = root / "models" / "evaluation_metadata.pkl"
        if meta_path.exists():
            meta = joblib.load(meta_path)
            self.model_name = meta.get("best_model_name", type(self.model).__name__)
        else:
            self.model_name = type(self.model).__name__

    def predict(self, raw_text: str) -> dict:
        start_time = time.time()
        cleaned = clean_text(raw_text)
        if not cleaned.strip():
            cleaned = raw_text.lower()

        vec_text = self.vectorizer.transform([cleaned])
        prediction = self.model.predict(vec_text)[0]
        is_spam = bool(prediction == 1)

        if hasattr(self.model, "predict_proba"):
            probabilities = self.model.predict_proba(vec_text)[0]
            classes = list(getattr(self.model, "classes_", [0, 1]))
            spam_index = classes.index(1) if 1 in classes else len(probabilities) - 1
            spam_prob = float(probabilities[spam_index]) * 100.0
            confidence = float(max(probabilities)) * 100.0
        elif hasattr(self.model, "decision_function"):
            decision = float(self.model.decision_function(vec_text)[0])
            spam_prob = float(1 / (1 + np.exp(-decision))) * 100.0
            confidence = max(spam_prob, 100.0 - spam_prob)
        else:
            spam_prob = 100.0 if is_spam else 0.0
            confidence = 100.0

        elapsed_ms = (time.time() - start_time) * 1000.0
        label_str = "Spam" if is_spam else "Not Spam (Ham)"

        return {
            "text": raw_text,
            "clean_text": cleaned,
            "prediction": label_str,
            "is_spam": is_spam,
            "confidence_score": round(confidence, 2),
            "spam_probability": round(spam_prob, 2),
            "execution_time_ms": round(elapsed_ms, 2),
            "model_name": self.model_name,
        }
