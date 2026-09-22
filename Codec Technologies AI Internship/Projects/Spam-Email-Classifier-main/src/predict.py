import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import time
import logging
import joblib
import numpy as np

from pathlib import Path
from src.utils import get_project_root
from src.preprocessing import clean_text

logger = logging.getLogger(__name__)

class SpamPredictor:
    """
    Spam Email Classifier Inference Engine.
    Loads trained ML model and vectorizer to make predictions on raw text.
    """
    def __init__(self, model_path: Path = None, vectorizer_path: Path = None):
        root = get_project_root()
        if model_path is None:
            model_path = root / "models" / "best_model.pkl"
        if vectorizer_path is None:
            vectorizer_path = root / "models" / "vectorizer.pkl"

        if not model_path.exists() or not vectorizer_path.exists():
            logger.warning("Trained model or vectorizer file missing. Retraining models...")
            from src.train import train_and_evaluate
            train_and_evaluate()

        self.model = joblib.load(model_path)
        self.vectorizer = joblib.load(vectorizer_path)
        
        # Load best model metadata name if available
        meta_path = root / "models" / "evaluation_metadata.pkl"
        if meta_path.exists():
            meta = joblib.load(meta_path)
            self.model_name = meta.get("best_model_name", type(self.model).__name__)
        else:
            self.model_name = type(self.model).__name__

    def predict(self, raw_text: str) -> dict:
        """
        Classifies an email text into Spam or Ham.
        Returns a dict containing prediction label, confidence score, and latency.
        """
        start_time = time.time()

        if not isinstance(raw_text, str) or not raw_text.strip():
            return {
                "text": raw_text,
                "clean_text": "",
                "prediction": "Ham (Not Spam)",
                "is_spam": False,
                "confidence_score": 100.0,
                "spam_probability": 0.0,
                "execution_time_ms": 0.0,
                "model_name": self.model_name
            }

        # Step 1: Preprocess text
        cleaned = clean_text(raw_text)

        # Handle empty preprocessed text fallback
        if not cleaned.strip():
            cleaned = raw_text.lower()

        # Step 2: Vectorize
        vec_text = self.vectorizer.transform([cleaned])

        # Step 3: Predict class
        prediction = self.model.predict(vec_text)[0]
        is_spam = bool(prediction == 1)

        # Step 4: Calculate Probability & Confidence
        if hasattr(self.model, "predict_proba"):
            probabilities = self.model.predict_proba(vec_text)[0]
            spam_prob = float(probabilities[1]) * 100.0
            confidence = float(max(probabilities)) * 100.0
        elif hasattr(self.model, "decision_function"):
            decision = self.model.decision_function(vec_text)[0]
            # Sigmoid scaling
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
            "model_name": self.model_name
        }

if __name__ == "__main__":
    predictor = SpamPredictor()
    sample_spam = "CONGRATULATIONS! You have won a $1,000 Walmart Gift Card. Click here to claim your reward now!"
    sample_ham = "Hi John, can we schedule our weekly sync meeting for tomorrow at 10 AM?"
    
    print("Spam Test:", predictor.predict(sample_spam))
    print("Ham Test:", predictor.predict(sample_ham))
