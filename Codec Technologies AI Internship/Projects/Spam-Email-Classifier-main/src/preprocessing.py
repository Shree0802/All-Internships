import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import re
import string
import logging
import nltk
import pandas as pd

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer, WordNetLemmatizer
from src.utils import get_project_root, download_dataset

logger = logging.getLogger(__name__)

# Download necessary NLTK datasets silently
def download_nltk_resources():
    resources = ['stopwords', 'punkt', 'wordnet', 'omw-1.4', 'punkt_tab']
    for res in resources:
        try:
            nltk.download(res, quiet=True)
        except Exception as e:
            logger.warning(f"Could not download NLTK resource {res}: {e}")

download_nltk_resources()

# Initialize stemmer and lemmatizer
stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

try:
    stop_words = set(stopwords.words('english'))
except Exception:
    stop_words = {'a', 'an', 'the', 'is', 'it', 'in', 'on', 'of', 'to', 'for', 'with', 'and', 'or', 'you', 'your', 'i', 'me', 'my'}

def clean_text(text: str, apply_stemming: bool = True, apply_lemmatization: bool = True) -> str:
    """
    Full NLP cleaning pipeline:
    1. Lowercasing
    2. URL, HTML tag, and Email removal
    3. Removal of punctuation & numbers
    4. Tokenization
    5. Stopwords removal
    6. Stemming & Lemmatization
    7. Clean whitespace joining
    """
    if not isinstance(text, str) or not text.strip():
        return ""

    # 1. Lowercase
    text = text.lower()

    # 2. Remove HTML tags, URLs, and emails
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'http\S+|www\.\S+', ' ', text)
    text = re.sub(r'\S+@\S+', ' ', text)

    # 3. Remove punctuation and numbers
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\d+', ' ', text)

    # 4. Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    # 5. Tokenize
    try:
        tokens = word_tokenize(text)
    except Exception:
        tokens = text.split()

    # 6. Stopword removal & Stemming/Lemmatization
    cleaned_tokens = []
    for token in tokens:
        if token not in stop_words and len(token) > 1:
            word = token
            if apply_lemmatization:
                word = lemmatizer.lemmatize(word)
            if apply_stemming:
                word = stemmer.stem(word)
            cleaned_tokens.append(word)

    return " ".join(cleaned_tokens)

def preprocess_dataframe(df: pd.DataFrame = None) -> pd.DataFrame:
    """
    Preprocesses the raw dataset, adds analytical columns, removes duplicates/nulls,
    and saves to data/processed/clean_spam_data.csv.
    """
    if df is None:
        df = download_dataset()

    df = df.copy()

    # Handle missing values & remove duplicate messages
    df = df.dropna(subset=['message', 'label'])
    initial_count = len(df)
    df = df.drop_duplicates(subset=['message'])
    logger.info(f"Removed {initial_count - len(df)} duplicate messages.")

    # Convert binary label mapping: ham -> 0, spam -> 1
    df['target'] = df['label'].apply(lambda x: 1 if str(x).lower().strip() == 'spam' else 0)

    # Feature engineering for EDA
    df['char_count'] = df['message'].astype(str).apply(len)
    df['word_count'] = df['message'].astype(str).apply(lambda x: len(x.split()))
    df['num_sentences'] = df['message'].astype(str).apply(lambda x: len(re.split(r'[.!?]+', x)))

    # Apply text cleaning
    logger.info("Applying NLP text cleaning pipeline...")
    df['clean_message'] = df['message'].apply(clean_text)

    # Filter out empty clean messages if any
    df = df[df['clean_message'].astype(str).str.len() > 0]

    # Save processed dataframe
    root = get_project_root()
    processed_path = root / "data" / "processed" / "clean_spam_data.csv"
    processed_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(processed_path, index=False)
    logger.info(f"Saved processed dataset ({len(df)} rows) to {processed_path}")

    return df

if __name__ == "__main__":
    df = preprocess_dataframe()
    print(df.head())
