import os
import sys
import logging
from pathlib import Path
import pandas as pd
import requests

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

PRIMARY_DATASET_URL = "https://raw.githubusercontent.com/justmarkham/pycon-2016-tutorial/master/data/sms.tsv"
FALLBACK_DATASET_URL = "https://raw.githubusercontent.com/tatsuya6150/SMS-Spam-Collection-Dataset/master/spam.csv"

def get_project_root() -> Path:
    """Returns absolute path to project root directory."""
    return Path(__file__).resolve().parent.parent

def ensure_directories():
    """Ensure all required project directories exist."""
    root = get_project_root()
    dirs = [
        root / "data" / "raw",
        root / "data" / "processed",
        root / "models",
        root / "assets" / "images",
        root / "screenshots",
        root / "notebooks",
        root / "tests"
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
    return root

def download_dataset() -> pd.DataFrame:
    """
    Downloads UCI SMS Spam Collection dataset automatically if not present locally.
    Returns cleaned raw DataFrame with columns ['label', 'message'].
    """
    root = ensure_directories()
    raw_path = root / "data" / "raw" / "spam_raw.csv"

    if raw_path.exists():
        logger.info(f"Loading raw dataset from local file: {raw_path}")
        return pd.read_csv(raw_path)

    logger.info("Downloading dataset from public repository...")
    try:
        # Try primary TSV dataset
        df = pd.read_csv(PRIMARY_DATASET_URL, sep='\t', header=None, names=['label', 'message'])
        logger.info("Successfully fetched dataset from primary URL.")
    except Exception as e:
        logger.warning(f"Failed primary fetch ({e}), trying fallback dataset...")
        try:
            df_fallback = pd.read_csv(FALLBACK_DATASET_URL, encoding='latin-1')
            df = df_fallback[['v1', 'v2']].rename(columns={'v1': 'label', 'v2': 'message'})
            logger.info("Successfully fetched dataset from fallback URL.")
        except Exception as e2:
            logger.error(f"Fallback download failed ({e2}). Creating sample fallback dataset.")
            # Hardcoded sample data if network is unavailable
            sample_data = {
                'label': ['ham', 'spam', 'ham', 'spam', 'ham'] * 50,
                'message': [
                    'Hey how are you doing today? Let us catch up for coffee.',
                    'WINNER!! You have won $1000 cash prize! Call 08002888 to claim now.',
                    'Can you send me the meeting notes from yesterday?',
                    'URGENT! Your account password has expired. Click http://spam-link.com to reset.',
                    'Happy Birthday! Hope you have a wonderful day ahead.'
                ] * 50
            }
            df = pd.DataFrame(sample_data)

    # Standardize labels and drop nulls
    df['label'] = df['label'].astype(str).str.strip().str.lower()
    df['message'] = df['message'].astype(str).str.strip()
    df = df.dropna(subset=['message', 'label'])

    # Save to data/raw/spam_raw.csv
    df.to_csv(raw_path, index=False)
    logger.info(f"Saved raw dataset to {raw_path}")
    return df

def load_data(processed: bool = True) -> pd.DataFrame:
    """Loads raw or processed dataset."""
    root = get_project_root()
    processed_path = root / "data" / "processed" / "clean_spam_data.csv"

    if processed and processed_path.exists():
        return pd.read_csv(processed_path)
    return download_dataset()
