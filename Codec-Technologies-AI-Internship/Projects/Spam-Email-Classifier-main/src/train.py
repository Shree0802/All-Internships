import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import os
import logging
import joblib

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

from src.utils import get_project_root, load_data
from src.preprocessing import preprocess_dataframe
from src.visualization import generate_static_plots

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def train_and_evaluate():
    """
    Trains Naive Bayes, Logistic Regression, and SVM models.
    Evaluates metrics, selects the top model based on F1-Score and Accuracy,
    and saves best_model.pkl, vectorizer.pkl, and comparison metrics.
    """
    root = get_project_root()
    models_dir = root / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    # 1. Load preprocessed data
    logger.info("Loading preprocessed dataset...")
    try:
        df = load_data(processed=True)
        if 'clean_message' not in df.columns or df['clean_message'].isnull().sum() > 0:
            df = preprocess_dataframe(df)
    except Exception as e:
        logger.warning(f"Error loading processed data ({e}), re-preprocessing...")
        df = preprocess_dataframe()

    # Generate static EDA charts
    try:
        generate_static_plots(df)
    except Exception as e:
        logger.warning(f"Static plot generation warning: {e}")

    # Prepare features and labels
    X = df['clean_message'].fillna('').astype(str)
    y = df['target'].values

    # 2. Train / Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    logger.info(f"Dataset split into {len(X_train)} training and {len(X_test)} testing samples.")

    # 3. Vectorization (TF-IDF)
    logger.info("Vectorizing text using TF-IDF...")
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Save vectorizer
    vectorizer_path = models_dir / "vectorizer.pkl"
    joblib.dump(vectorizer, vectorizer_path)
    logger.info(f"Saved vectorizer to {vectorizer_path}")

    # 4. Define Candidate Models
    models = {
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.2),
        "Logistic Regression": LogisticRegression(C=1.0, max_iter=1000, random_state=42),
        "Support Vector Machine (SVM)": SVC(kernel='linear', C=1.0, probability=True, random_state=42)
    }

    results = []
    trained_model_objs = {}
    reports = {}
    cms = {}

    # 5. Train & Evaluate Models
    for name, model in models.items():
        logger.info(f"Training {name}...")
        model.fit(X_train_vec, y_train)
        y_pred = model.predict(X_test_vec)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        cm = confusion_matrix(y_test, y_pred)
        report = classification_report(y_test, y_pred, target_names=['Ham', 'Spam'], output_dict=True)

        results.append({
            "Model": name,
            "Accuracy": round(float(acc), 4),
            "Precision": round(float(prec), 4),
            "Recall": round(float(rec), 4),
            "F1 Score": round(float(f1), 4)
        })

        trained_model_objs[name] = model
        reports[name] = report
        cms[name] = cm.tolist()

        logger.info(f"[{name}] Accuracy: {acc:.4f} | F1 Score: {f1:.4f} | Precision: {prec:.4f} | Recall: {rec:.4f}")

    # Convert results to DataFrame
    results_df = pd.DataFrame(results)
    
    # 6. Automatic Best Model Selection (Highest F1-Score, then Accuracy)
    best_row = results_df.sort_values(by=['F1 Score', 'Accuracy'], ascending=[False, False]).iloc[0]
    best_model_name = best_row['Model']
    best_model = trained_model_objs[best_model_name]

    logger.info(f"⭐ BEST MODEL SELECTED: '{best_model_name}' (F1 Score: {best_row['F1 Score']}, Accuracy: {best_row['Accuracy']})")

    # Save best model
    best_model_path = models_dir / "best_model.pkl"
    joblib.dump(best_model, best_model_path)
    logger.info(f"Saved best model object to {best_model_path}")

    # Save comparison dataframe & evaluation metadata
    results_df.to_csv(models_dir / "model_comparison.csv", index=False)
    
    meta = {
        "best_model_name": best_model_name,
        "results": results,
        "confusion_matrices": cms,
        "reports": reports
    }
    joblib.dump(meta, models_dir / "evaluation_metadata.pkl")

    return best_model_name, results_df

if __name__ == "__main__":
    best_name, df_res = train_and_evaluate()
    print("\nModel Comparison Table:\n", df_res)
