import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import pytest
import pandas as pd
from src.preprocessing import clean_text, preprocess_dataframe
from src.predict import SpamPredictor
from src.utils import load_data, get_project_root

def test_clean_text_basic():
    raw = "WINNER!! You have won $10,000 cash prize! Claim NOW at http://win-cash.com!"
    cleaned = clean_text(raw)
    assert isinstance(cleaned, str)
    assert "http" not in cleaned
    assert "10000" not in cleaned
    assert "winner" in cleaned


def test_clean_text_empty():
    assert clean_text("") == ""
    assert clean_text(None) == ""

def test_dataset_loading():
    df = load_data(processed=True)
    assert isinstance(df, pd.DataFrame)
    assert len(df) > 0
    assert "clean_message" in df.columns
    assert "target" in df.columns

def test_predictor_spam():
    predictor = SpamPredictor()
    spam_sample = "Urgent! Call 09066362231 to claim your £1000 prize card!"
    res = predictor.predict(spam_sample)
    assert res["is_spam"] is True
    assert res["prediction"] == "Spam"
    assert res["spam_probability"] > 50.0

def test_predictor_ham():
    predictor = SpamPredictor()
    ham_sample = "Hey mom, I will be home for dinner at 7 PM."
    res = predictor.predict(ham_sample)
    assert res["is_spam"] is False
    assert res["prediction"] == "Not Spam (Ham)"
    assert res["spam_probability"] < 50.0
