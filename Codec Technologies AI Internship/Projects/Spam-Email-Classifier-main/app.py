import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import time
import joblib
import pandas as pd
import numpy as np
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from PIL import Image

from src.utils import get_project_root, load_data
from src.predict import SpamPredictor
from src.visualization import (
    plot_plotly_class_distribution,
    plot_plotly_message_length,
    plot_plotly_top_words,
    plot_plotly_confusion_matrix,
    get_images_dir
)

# Page Configuration
st.set_page_config(
    page_title="Spam Email Classifier",
    page_icon="📧",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Inject Custom CSS for dark glassmorphism styling
st.markdown("""
<style>
    /* Global Styles */
    .stApp {
        background-color: #0F172A;
        color: #F8FAFC;
        font-family: 'Inter', sans-serif;
    }
    
    /* Card Component */
    .metric-card {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        backdrop-filter: blur(10px);
        margin-bottom: 10px;
    }
    .metric-val {
        font-size: 2.2rem;
        font-weight: 700;
        color: #6C5CE7;
        margin-top: 5px;
    }
    .metric-label {
        font-size: 0.95rem;
        color: #94A3B8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    /* Status Banners */
    .spam-banner {
        background-color: rgba(239, 68, 68, 0.2);
        border: 1px solid #EF4444;
        border-radius: 12px;
        padding: 20px;
        color: #F87171;
        margin-top: 15px;
    }
    .ham-banner {
        background-color: rgba(34, 197, 94, 0.2);
        border: 1px solid #22C55E;
        border-radius: 12px;
        padding: 20px;
        color: #4ADE80;
        margin-top: 15px;
    }

    /* Buttons */
    .stButton>button {
        background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 24px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
    }
</style>
""", unsafe_allow_html=True)

@st.cache_data
def get_cached_data():
    return load_data(processed=True)

@st.cache_resource
def get_predictor():
    return SpamPredictor()

df_data = get_cached_data()
predictor = get_predictor()

# Sidebar Navigation
st.sidebar.image("https://img.icons8.com/isometric-headers/100/security-checked.png", width=70)
st.sidebar.title("Navigation")
page = st.sidebar.radio(
    "Select Page",
    ["Home", "Dashboard", "EDA", "Spam Prediction", "Model Performance", "About"],
    index=0
)

st.sidebar.markdown("---")
st.sidebar.info("💡 **Spam Email Classifier**\nProduction-ready NLP ML application built with Scikit-Learn & Streamlit.")

# ==========================================
# PAGE 1: HOME
# ==========================================
if page == "Home":
    st.markdown("""
    <div style="text-align: center; padding: 20px 0;">
        <h1 style="font-size: 3rem; background: linear-gradient(90deg, #A855F7, #6366F1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            🛡️ Spam Email Classifier
        </h1>
        <p style="font-size: 1.2rem; color: #94A3B8; max-width: 800px; margin: 0 auto;">
            Detect and filter unsolicited spam emails instantaneously using advanced Natural Language Processing (NLP) and Machine Learning techniques.
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("---")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("🎯 Project Objectives")
        st.markdown("""
        - ✅ **Accurate Spam Detection**: Classify incoming emails as Spam or Safe (Ham) with over 98% accuracy.
        - ✅ **NLP Text Processing**: Automated lowercasing, stopword removal, stemming, and lemmatization.
        - ✅ **Model Benchmarking**: Automated comparison between Naive Bayes, Logistic Regression, and Support Vector Machines (SVM).
        - ✅ **Real-Time Classification**: Instant prediction response with confidence probability and latency metrics.
        - ✅ **Production & Internship Ready**: Built following modular PEP8 standards, automated tests, and deployment files.
        """)

    with col2:
        st.subheader("💻 Technology Stack")
        st.markdown("""
        - 🐍 **Python 3.13**: Core programming language.
        - 🤖 **Scikit-Learn**: Model building (MultinomialNB, Logistic Regression, Linear SVC).
        - 🔤 **NLTK**: Tokenization, Stopwords, Stemming & Lemmatization.
        - 📊 **Pandas & NumPy**: High-performance data manipulation.
        - 🎨 **Streamlit & Plotly**: Interactive web interface and dynamic visual charts.
        - 📦 **Joblib**: Model serialization (`best_model.pkl`, `vectorizer.pkl`).
        """)

    st.markdown("---")
    st.subheader("🚀 Features Overview")

    f1, f2, f3 = st.columns(3)
    with f1:
        st.markdown("""
        <div class="metric-card">
            <h3>📊 Interactive EDA</h3>
            <p>Explore datasets, class distributions, word clouds, and top word frequencies.</p>
        </div>
        """, unsafe_allow_html=True)
    with f2:
        st.markdown("""
        <div class="metric-card">
            <h3>⚡ Live Prediction</h3>
            <p>Paste any email message to get instant classification with probability scores.</p>
        </div>
        """, unsafe_allow_html=True)
    with f3:
        st.markdown("""
        <div class="metric-card">
            <h3>📈 Model Benchmark</h3>
            <p>Compare Precision, Recall, Accuracy, and F1-Scores across algorithms.</p>
        </div>
        """, unsafe_allow_html=True)

# ==========================================
# PAGE 2: DASHBOARD
# ==========================================
elif page == "Dashboard":
    st.title("📊 Project Executive Dashboard")
    st.markdown("High-level key performance indicators and dataset overview.")

    total_emails = len(df_data)
    spam_count = int((df_data['target'] == 1).sum())
    ham_count = int((df_data['target'] == 0).sum())
    spam_pct = round((spam_count / total_emails) * 100, 2)
    ham_pct = round((ham_count / total_emails) * 100, 2)

    c1, c2, c3, c4, c5 = st.columns(5)
    with c1:
        st.markdown(f'<div class="metric-card"><div class="metric-label">Total Emails</div><div class="metric-val">{total_emails}</div></div>', unsafe_allow_html=True)
    with c2:
        st.markdown(f'<div class="metric-card"><div class="metric-label">Spam Count</div><div class="metric-val" style="color: #EF4444;">{spam_count}</div></div>', unsafe_allow_html=True)
    with c3:
        st.markdown(f'<div class="metric-card"><div class="metric-label">Ham Count</div><div class="metric-val" style="color: #22C55E;">{ham_count}</div></div>', unsafe_allow_html=True)
    with c4:
        st.markdown(f'<div class="metric-card"><div class="metric-label">Spam %</div><div class="metric-val" style="color: #F87171;">{spam_pct}%</div></div>', unsafe_allow_html=True)
    with c5:
        st.markdown(f'<div class="metric-card"><div class="metric-label">Ham %</div><div class="metric-val" style="color: #4ADE80;">{ham_pct}%</div></div>', unsafe_allow_html=True)

    st.markdown("---")
    col1, col2 = st.columns(2)
    with col1:
        st.plotly_chart(plot_plotly_class_distribution(df_data), use_container_width=True)
    with col2:
        st.plotly_chart(plot_plotly_message_length(df_data), use_container_width=True)

# ==========================================
# PAGE 3: EDA
# ==========================================
elif page == "EDA":
    st.title("🔍 Exploratory Data Analysis")
    st.markdown("Deep dive into email text structures, length distributions, and key terms.")

    tab1, tab2, tab3 = st.columns([1, 1, 1])

    st.subheader("📋 Dataset Explorer")
    
    # Search and Filter
    c_search, c_filter = st.columns([3, 1])
    with c_search:
        search_query = st.text_input("🔍 Search Messages by Keyword:", "")
    with c_filter:
        filter_label = st.selectbox("Filter Class:", ["All", "spam", "ham"])

    filtered_df = df_data.copy()
    if filter_label != "All":
        filtered_df = filtered_df[filtered_df['label'] == filter_label]
    if search_query.strip():
        filtered_df = filtered_df[filtered_df['message'].astype(str).str.contains(search_query, case=False, na=False)]

    st.dataframe(filtered_df[['label', 'message', 'char_count', 'word_count']], use_container_width=True, height=250)

    st.download_button(
        label="📥 Download Clean Dataset (CSV)",
        data=filtered_df.to_csv(index=False),
        file_name="clean_spam_dataset.csv",
        mime="text/csv"
    )

    st.markdown("---")
    st.subheader("🎨 Text Word Clouds & Term Frequencies")

    col_w1, col_w2 = st.columns(2)
    with col_w1:
        st.plotly_chart(plot_plotly_top_words(df_data, is_spam=True), use_container_width=True)
    with col_w2:
        st.plotly_chart(plot_plotly_top_words(df_data, is_spam=False), use_container_width=True)

    img_dir = get_images_dir()
    if (img_dir / "wordcloud_spam.png").exists() and (img_dir / "wordcloud_ham.png").exists():
        st.markdown("### ☁️ Static Word Clouds")
        wc_col1, wc_col2 = st.columns(2)
        with wc_col1:
            st.image(str(img_dir / "wordcloud_spam.png"), caption="Spam Word Cloud", use_container_width=True)
        with wc_col2:
            st.image(str(img_dir / "wordcloud_ham.png"), caption="Ham Word Cloud", use_container_width=True)

# ==========================================
# PAGE 4: SPAM PREDICTION
# ==========================================
elif page == "Spam Prediction":
    st.title("⚡ Real-Time Email Spam Classifier")
    st.markdown("Paste any suspicious email content below to evaluate whether it is **Spam** or **Safe (Ham)**.")

    email_input = st.text_area(
        "✉️ Email Content:",
        height=180,
        placeholder="e.g. Congratulations! You have won a $1,000 cash prize. Click here to claim your reward immediately!"
    )

    c_btn1, c_btn2, _ = st.columns([1, 1, 4])
    with c_btn1:
        predict_clicked = st.button("🚀 Predict Email", use_container_width=True)
    with c_btn2:
        example_spam = st.button("⚡ Fill Sample Spam", use_container_width=True)

    if example_spam:
        email_input = "URGENT! Your mobile number has been selected as the $5,000 grand winner. Reply CALL to 88010 now to claim!"
        st.rerun()

    if predict_clicked:
        if not email_input.strip():
            st.warning("⚠️ Please enter or paste some email text first.")
        else:
            with st.spinner("Analyzing text with NLP pipeline..."):
                res = predictor.predict(email_input)

            st.markdown("---")
            st.subheader("🎯 Classification Results")

            if res["is_spam"]:
                st.markdown(f"""
                <div class="spam-banner">
                    <h2>🚨 SPAM DETECTED</h2>
                    <p style="font-size: 1.1rem; color: #FCA5A5;">
                        Warning: This email contains suspicious phrases, promotional spam keywords, or phishing patterns.
                    </p>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class="ham-banner">
                    <h2>✅ SAFE EMAIL (HAM)</h2>
                    <p style="font-size: 1.1rem; color: #86EFAC;">
                        This email appears legitimate and shows no indication of spam.
                    </p>
                </div>
                """, unsafe_allow_html=True)

            st.markdown("<br>", unsafe_allow_html=True)
            res_c1, res_c2, res_c3, res_c4 = st.columns(4)
            with res_c1:
                st.metric("Spam Probability", f"{res['spam_probability']}%")
            with res_c2:
                st.metric("Confidence Score", f"{res['confidence_score']}%")
            with res_c3:
                st.metric("Prediction Latency", f"{res['execution_time_ms']} ms")
            with res_c4:
                st.metric("Active Model", res['model_name'])

            with st.expander("🔍 View NLP Preprocessed Text Details"):
                st.write("**Original Text:**", res["text"])
                st.write("**Cleaned & Stemmed Text:**", f"`{res['clean_text']}`")

# ==========================================
# PAGE 5: MODEL PERFORMANCE
# ==========================================
elif page == "Model Performance":
    st.title("📈 Model Evaluation & Leaderboard")
    st.markdown("Detailed breakdown of model metrics and benchmark comparison.")

    root = get_project_root()
    meta_path = root / "models" / "evaluation_metadata.pkl"

    if meta_path.exists():
        meta = joblib.load(meta_path)
        best_name = meta.get("best_model_name", "Support Vector Machine (SVM)")
        results = meta.get("results", [])
        reports = meta.get("reports", {})
        cms = meta.get("confusion_matrices", {})

        st.success(f"🏆 **Best Performing Model**: `{best_name}` automatically chosen based on highest F1-Score & Accuracy.")

        df_res = pd.DataFrame(results)
        st.subheader("📊 Model Comparison Table")
        st.dataframe(df_res.style.highlight_max(subset=["Accuracy", "F1 Score"], color="#4C1D95"), use_container_width=True)

        st.markdown("---")
        st.subheader("🧱 Confusion Matrix & Classification Report")
        selected_model = st.selectbox("Select Model to Inspect:", df_res["Model"].tolist(), index=0)

        if selected_model in cms:
            cm = np.array(cms[selected_model])
            col_m1, col_m2 = st.columns(2)
            with col_m1:
                st.plotly_chart(plot_plotly_confusion_matrix(cm), use_container_width=True)
            with col_m2:
                st.write(f"**Classification Report for {selected_model}:**")
                rep_df = pd.DataFrame(reports[selected_model]).transpose()
                st.dataframe(rep_df, use_container_width=True)
    else:
        st.warning("Model metadata file missing. Run `python src/train.py` to train models.")

# ==========================================
# PAGE 6: ABOUT
# ==========================================
elif page == "About":
    st.title("ℹ️ About the Project")

    st.markdown("""
    ### 🛡️ Spam Email Classifier using Machine Learning
    This project is an end-to-end Machine Learning web application designed to automatically identify and filter spam emails.

    #### 🔄 Machine Learning & NLP Architecture Workflow
    ```
    Raw Email Input ➔ Lowercasing ➔ Remove Punctuation & Digits ➔ Tokenization ➔ Stopword Removal ➔ Stemming/Lemmatization ➔ TF-IDF Vectorization ➔ Best ML Classifier ➔ Prediction & Confidence Output
    ```

    #### 🧪 Machine Learning Models Benchmarked
    1. **Multinomial Naive Bayes**: Fast, highly effective text classifier based on Bayes' Theorem with feature independence assumption.
    2. **Logistic Regression**: Linear binary classifier optimizing log-loss function.
    3. **Support Vector Machine (SVM)**: Maximum-margin classifier projecting features into high-dimensional space.

    #### 👨‍💻 Developer & GitHub Repository
    - **Author**: Machine Learning Engineer & Data Scientist
    - **License**: MIT Open Source License
    - **Topics**: `machine-learning`, `spam-classifier`, `nlp`, `python`, `streamlit`, `naive-bayes`, `scikit-learn`
    """)
