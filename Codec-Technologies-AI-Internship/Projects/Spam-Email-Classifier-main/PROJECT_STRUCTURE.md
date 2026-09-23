# Project Structure Explanation

```
Spam-Email-Classifier/
│
├── app.py                      # Main Streamlit web application with multi-page navigation
├── requirements.txt            # Python package dependencies
├── README.md                   # Primary project documentation
├── LICENSE                     # MIT License
├── .gitignore                  # Git untracked file rules
├── CHANGELOG.md                # Project version history
├── CONTRIBUTING.md             # Contribution guidelines
├── CODE_OF_CONDUCT.md          # Code of conduct standards
├── SECURITY.md                 # Security vulnerability reporting policy
├── INSTALLATION.md             # Step-by-step setup guide
├── PROJECT_STRUCTURE.md        # File and folder breakdown
│
├── data/
│   ├── raw/                    # Stores original downloaded spam dataset (spam_raw.csv)
│   └── processed/              # Stores cleaned & feature-engineered dataset (clean_spam_data.csv)
│
├── models/
│   ├── best_model.pkl          # Optimal trained Machine Learning classifier (SVM / Naive Bayes)
│   ├── vectorizer.pkl          # Trained TF-IDF Vectorizer object
│   ├── model_comparison.csv    # Leaderboard metrics table
│   └── evaluation_metadata.pkl # Detailed classification reports & confusion matrices
│
├── notebooks/
│   └── spam_classifier_pipeline.ipynb # Jupyter notebook demonstration of full workflow
│
├── src/
│   ├── __init__.py             # Package marker
│   ├── preprocessing.py        # NLP cleaning pipeline (lowercasing, stopword removal, stemming/lemmatization)
│   ├── train.py                # Model training, benchmarking, automatic selection, artifact saving
│   ├── predict.py              # Inference class (SpamPredictor) for live predictions
│   ├── visualization.py        # Static matplotlib/seaborn plot generator & Plotly chart builders
│   └── utils.py                # Directory setup, automated dataset downloader & data loaders
│
├── assets/
│   └── images/                 # High-resolution static PNG charts (Word clouds, distributions, CM)
│
├── screenshots/                # Application UI screenshots
│
└── tests/
    └── test_pipeline.py        # Pytest test suite for preprocessing, vectorization, and inference
```

## Module Breakdown

- **`src/preprocessing.py`**: Contains `clean_text` which executes text lowercasing, HTML/URL stripping, punctuation/number stripping, tokenization, NLTK stopword removal, stemming (PorterStemmer), and lemmatization (WordNetLemmatizer).
- **`src/train.py`**: Evaluates candidates (**Multinomial Naive Bayes**, **Logistic Regression**, **Support Vector Machine (SVM)**) and automatically exports the top model based on F1-Score & Accuracy to `models/best_model.pkl`.
- **`src/predict.py`**: Exposes `SpamPredictor` class used directly by `app.py` for real-time inference with probability & confidence metrics.
- **`app.py`**: Streamlit application providing 6 pages: Home, Executive Dashboard, Exploratory Data Analysis, Real-time Spam Prediction, Model Performance, and About.
