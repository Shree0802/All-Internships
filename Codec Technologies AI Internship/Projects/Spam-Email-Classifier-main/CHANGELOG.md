# Changelog

All notable changes to the **Spam Email Classifier** project will be documented in this file.

## [1.0.0] - 2026-08-04

### Added
- Automated dataset downloader for UCI SMS Spam Collection dataset.
- NLP preprocessor pipeline (`clean_text` & `preprocess_dataframe`) with tokenization, stopword removal, stemming, and lemmatization.
- Candidate ML models: **Multinomial Naive Bayes**, **Logistic Regression**, and **Support Vector Machine (SVM)**.
- Automated selection engine selecting the best model based on F1-Score and Accuracy (`best_model.pkl`, `vectorizer.pkl`).
- High-resolution static chart export to `assets/images/` (Word clouds, Class distributions, Top 20 words, Length distributions).
- Interactive 6-page Streamlit web app (`app.py`) featuring Home, Dashboard, EDA, Real-time Spam Prediction, Model Performance, and About pages.
- Pytest unit test suite in `tests/test_pipeline.py`.
- Comprehensive GitHub open-source documentation (`README.md`, `INSTALLATION.md`, `PROJECT_STRUCTURE.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `LICENSE`).
