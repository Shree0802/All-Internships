# 🛡️ Spam Email Classifier using Machine Learning

[![Python Version](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Framework](https://img.shields.io/badge/FastAPI-1.28+-FF4B4B?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.io/)
[![Machine Learning](https://img.shields.io/badge/Scikit--Learn-1.3+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen?style=for-the-badge&logo=pytest)](tests/)

An **end-to-end, production-ready Machine Learning web application** built to classify emails into **Spam** or **Safe (Ham)** using Natural Language Processing (NLP) and Scikit-Learn.

---

## 🌐 Live Web Application


Click the link above to test the real-time email spam classifier live in your web browser!

---

## 📌 Problem Statement

Unsolicited spam emails and phishing attempts pose severe security, productivity, and privacy risks. Automated classification using NLP and supervised Machine Learning provides an efficient mechanism to filter malicious content before it reaches a user's primary inbox.

---

## 🎯 Project Objectives

- **Automated NLP Pipeline**: Lowercasing, URL/email stripping, tokenization, stopword removal, stemming, and lemmatization.
- **Model Benchmarking**: Compare **Multinomial Naive Bayes**, **Logistic Regression**, and **Support Vector Machine (SVM)**.
- **Automated Model Selection**: Automatically evaluate candidates and select the best model based on **Accuracy** and **F1-Score**.
- **Interactive Web UI**: Responsive multi-page FastAPI application with custom dark glassmorphism aesthetic.
- **Internship & Production Ready**: Follows PEP8, modular design, full unit test coverage, and deployment configurations.

---

## 💻 Tech Stack

- **Core**: Python 3.13
- **Machine Learning & NLP**: Scikit-Learn, NLTK, Joblib
- **Data Engineering**: Pandas, NumPy
- **Visualizations**: Plotly, Matplotlib, Seaborn, WordCloud
- **Web UI**: FastAPI

---

## 📊 Model Performance Leaderboard

| Classifier Model | Accuracy | Precision | Recall | F1-Score | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Support Vector Machine (SVM)** 🏆 | **98.25%** | **97.41%** | **88.28%** | **0.9262** | **Selected Best Model** |
| **Multinomial Naive Bayes** | 98.06% | 97.37% | 86.72% | 0.9174 | Evaluated |
| **Logistic Regression** | 96.31% | 95.92% | 73.44% | 0.8319 | Evaluated |

> *Model objects automatically saved to `models/best_model.pkl` and `models/vectorizer.pkl`.*

---

## 🔄 Machine Learning & NLP Pipeline

```
┌─────────────────┐
│ Raw Email Text  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     (Lowercasing, remove URLs, emails, punctuation, numbers)
│ Text Cleaning   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     (NLTK Tokenizer, Stopwords Removal, Stemming & Lemmatization)
│ Token & Stem    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     (TF-IDF N-gram Range (1, 2), Max Features=5000)
│ Vectorization   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     (Support Vector Machine / Naive Bayes Classifier)
│ Model Inference │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     (Spam vs Safe, Confidence %, Latency ms)
│ Prediction UI   │
└─────────────────┘
```

---

## 📁 Folder Structure

```
Spam-Email-Classifier/
├── app.py                      # Multi-page FastAPI Web Application
├── requirements.txt            # Project dependencies
├── README.md                   # Project documentation
├── LICENSE                     # MIT License
├── .gitignore                  # Git untracked rules
├── CHANGELOG.md                # Version release log
├── CONTRIBUTING.md             # Contribution guidelines
├── CODE_OF_CONDUCT.md          # Code of conduct
├── SECURITY.md                 # Security policy
├── INSTALLATION.md             # Setup guide
├── PROJECT_STRUCTURE.md        # File & directory documentation
│
├── data/
│   ├── raw/                    # Downloaded UCI SMS Spam dataset
│   └── processed/              # Cleaned & feature-engineered dataset
│
├── models/
│   ├── best_model.pkl          # Optimal classifier object
│   ├── vectorizer.pkl          # Fitted TF-IDF Vectorizer
│   └── model_comparison.csv    # Benchmark leaderboard table
│
├── notebooks/
│   └── spam_classifier_pipeline.ipynb # Jupyter notebook demonstration
│
├── src/
│   ├── preprocessing.py        # NLP cleaning pipeline
│   ├── train.py                # Model training & auto-selection script
│   ├── predict.py              # SpamPredictor inference engine
│   ├── visualization.py        # Static PNG & Plotly interactive plots
│   └── utils.py                # Data loading & directory helpers
│
├── assets/
│   └── images/                 # Exported charts (Word clouds, distributions, CM)
│
├── screenshots/                # Application UI screenshots
│
└── tests/
    └── test_pipeline.py        # Pytest unit tests
```

---

## 🚀 How to Run Locally

### 1. Clone & Setup
```bash
git clone https://github.com/your-username/Spam-Email-Classifier.git
cd Spam-Email-Classifier
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Train Models & Generate Assets
```bash
python src/train.py
```

### 3. Run Unit Tests
```bash
pytest tests/
```

### 4. Launch Web App
```bash
```

---

## 🔮 Future Scope

- 🌐 Add multi-lingual spam classification support.
- 📬 Integrate Gmail / Outlook OAuth API for live inbox scanning.
- 🧠 Experiment with Deep Learning models (LSTM, BERT, Transformer-based classifiers).

---

## 📄 License & Author

- **License**: [MIT License](LICENSE)
- **Author**: Machine Learning Engineer & Data Scientist

### 🏷️ GitHub Topics
`machine-learning` `spam-classifier` `nlp` `python` `fastapi` `naive-bayes` `email-classification` `scikit-learn` `artificial-intelligence` `text-classification` `student-project`
