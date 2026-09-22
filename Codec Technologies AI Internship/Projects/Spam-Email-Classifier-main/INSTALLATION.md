# Detailed Installation Guide

Follow these step-by-step instructions to install, configure, and run the **Spam Email Classifier** on your local environment or Streamlit Cloud.

---

## 📋 Prerequisites

- **Python**: Version 3.9 or higher (Python 3.13 recommended).
- **Git**: Installed on your system.

---

## 🛠️ Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/Spam-Email-Classifier.git
cd Spam-Email-Classifier
```

---

## 🐍 Step 2: Create a Virtual Environment (Recommended)

### On Windows (PowerShell / Command Prompt):
```bash
python -m venv venv
.\venv\Scripts\activate
```

### On macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 📦 Step 3: Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## ⚙️ Step 4: Download Dataset & Train Models

Run the automated data downloader, NLP preprocessor, and model trainer:

```bash
python src/train.py
```

*This script will:*
1. Automatically fetch the UCI SMS Spam dataset.
2. Clean, tokenize, stem, and lemmatize text messages.
3. Train Naive Bayes, Logistic Regression, and Linear SVM models.
4. Export static EDA visualizations to `assets/images/`.
5. Save `models/best_model.pkl` and `models/vectorizer.pkl`.

---

## 🧪 Step 5: Run Unit Tests

Verify everything functions as expected:

```bash
pytest tests/
```

---

## 🚀 Step 6: Launch Streamlit Web Application

```bash
streamlit run app.py
```

Open your browser at `http://localhost:8501`.
