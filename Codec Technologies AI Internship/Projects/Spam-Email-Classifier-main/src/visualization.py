import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import os
import logging
from collections import Counter

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from wordcloud import WordCloud
import plotly.express as px
import plotly.graph_objects as go
from src.utils import get_project_root

logger = logging.getLogger(__name__)

# Set global aesthetics for Matplotlib & Seaborn
plt.style.use('dark_background')
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#334155'
plt.rcParams['axes.linewidth'] = 1.2

SPAM_COLOR = '#FF5252'
HAM_COLOR = '#4CAF50'
PALETTE = [HAM_COLOR, SPAM_COLOR]

def get_images_dir():
    root = get_project_root()
    img_dir = root / "assets" / "images"
    img_dir.mkdir(parents=True, exist_ok=True)
    return img_dir

def generate_static_plots(df: pd.DataFrame):
    """Generates all static high-resolution PNG charts and saves them to assets/images/."""
    img_dir = get_images_dir()
    logger.info("Generating static visualization charts for assets/images/...")

    # 1. Class Distribution (Pie + Bar)
    fig, axes = plt.subplots(1, 2, figsize=(14, 6), facecolor='#0F172A')
    
    counts = df['label'].value_counts()
    axes[0].pie(
        counts, 
        labels=counts.index.str.upper(), 
        autopct='%1.1f%%', 
        colors=[HAM_COLOR, SPAM_COLOR],
        explode=[0.05, 0.05],
        startangle=140,
        textprops={'color': 'white', 'fontsize': 12, 'weight': 'bold'}
    )
    axes[0].set_title("Class Distribution (Pie)", color='white', fontsize=14, pad=15)

    sns.barplot(x=counts.index.str.upper(), y=counts.values, ax=axes[1], palette=[HAM_COLOR, SPAM_COLOR])
    axes[1].set_title("Class Count (Bar)", color='white', fontsize=14, pad=15)
    axes[1].set_ylabel("Count", color='white')
    axes[1].tick_params(colors='white')

    plt.tight_layout()
    plt.savefig(img_dir / "class_distribution.png", dpi=300, bbox_inches='tight', facecolor='#0F172A')
    plt.close()

    # 2. Word Clouds (Spam & Ham)
    spam_words = " ".join(df[df['target'] == 1]['clean_message'].astype(str))
    ham_words = " ".join(df[df['target'] == 0]['clean_message'].astype(str))

    wc_spam = WordCloud(width=800, height=400, background_color='#0F172A', colormap='Reds').generate(spam_words)
    plt.figure(figsize=(10, 5), facecolor='#0F172A')
    plt.imshow(wc_spam, interpolation='bilinear')
    plt.axis('off')
    plt.title("Word Cloud - Spam Messages", color='white', fontsize=16, pad=15)
    plt.savefig(img_dir / "wordcloud_spam.png", dpi=300, bbox_inches='tight', facecolor='#0F172A')
    plt.close()

    wc_ham = WordCloud(width=800, height=400, background_color='#0F172A', colormap='Greens').generate(ham_words)
    plt.figure(figsize=(10, 5), facecolor='#0F172A')
    plt.imshow(wc_ham, interpolation='bilinear')
    plt.axis('off')
    plt.title("Word Cloud - Ham Messages", color='white', fontsize=16, pad=15)
    plt.savefig(img_dir / "wordcloud_ham.png", dpi=300, bbox_inches='tight', facecolor='#0F172A')
    plt.close()

    # 3. Top 20 Words (Spam & Ham)
    def plot_top_words(words_str, title, filename, color):
        words_list = [w for w in words_str.split() if len(w) > 2]
        most_common = Counter(words_list).most_common(20)
        words_df = pd.DataFrame(most_common, columns=['word', 'count'])

        plt.figure(figsize=(12, 6), facecolor='#0F172A')
        sns.barplot(data=words_df, x='count', y='word', color=color)
        plt.title(title, color='white', fontsize=16, pad=15)
        plt.xlabel("Frequency", color='white')
        plt.ylabel("Word", color='white')
        plt.tick_params(colors='white')
        plt.tight_layout()
        plt.savefig(img_dir / filename, dpi=300, bbox_inches='tight', facecolor='#0F172A')
        plt.close()

    plot_top_words(spam_words, "Top 20 Frequent Words in Spam", "top20_spam_words.png", SPAM_COLOR)
    plot_top_words(ham_words, "Top 20 Frequent Words in Ham", "top20_ham_words.png", HAM_COLOR)

    # 4. Message Length Distribution
    fig, axes = plt.subplots(1, 2, figsize=(14, 6), facecolor='#0F172A')
    
    sns.histplot(data=df, x='char_count', hue='label', kde=True, ax=axes[0], palette={'ham': HAM_COLOR, 'spam': SPAM_COLOR})
    axes[0].set_title("Character Count Distribution", color='white', fontsize=14)
    axes[0].set_xlim(0, 300)

    sns.histplot(data=df, x='word_count', hue='label', kde=True, ax=axes[1], palette={'ham': HAM_COLOR, 'spam': SPAM_COLOR})
    axes[1].set_title("Word Count Distribution", color='white', fontsize=14)
    axes[1].set_xlim(0, 60)

    plt.tight_layout()
    plt.savefig(img_dir / "message_length_distribution.png", dpi=300, bbox_inches='tight', facecolor='#0F172A')
    plt.close()

    logger.info("Successfully saved static visualization figures.")

# Interactive Plotly chart builders for Streamlit
def plot_plotly_class_distribution(df: pd.DataFrame):
    counts = df['label'].value_counts().reset_index()
    counts.columns = ['label', 'count']
    fig = px.pie(
        counts, 
        values='count', 
        names='label', 
        title='Spam vs Ham Class Ratio',
        color='label',
        color_discrete_map={'ham': HAM_COLOR, 'spam': SPAM_COLOR},
        hole=0.4
    )
    fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color='white')
    return fig

def plot_plotly_message_length(df: pd.DataFrame):
    fig = px.histogram(
        df, 
        x='char_count', 
        color='label', 
        barmode='overlay',
        title='Message Character Length Distribution',
        color_discrete_map={'ham': HAM_COLOR, 'spam': SPAM_COLOR},
        nbins=50
    )
    fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color='white', xaxis_range=[0, 300])
    return fig

def plot_plotly_top_words(df: pd.DataFrame, is_spam: bool = True):
    target_val = 1 if is_spam else 0
    words = " ".join(df[df['target'] == target_val]['clean_message'].astype(str)).split()
    most_common = Counter(words).most_common(20)
    words_df = pd.DataFrame(most_common, columns=['word', 'count'])
    
    color = SPAM_COLOR if is_spam else HAM_COLOR
    title = "Top 20 Spam Words" if is_spam else "Top 20 Ham Words"
    
    fig = px.bar(
        words_df, 
        x='count', 
        y='word', 
        orientation='h', 
        title=title,
        color_discrete_sequence=[color]
    )
    fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color='white', yaxis={'categoryorder':'total ascending'})
    return fig

def plot_plotly_confusion_matrix(cm, labels=['Ham', 'Spam']):
    fig = px.imshow(
        cm,
        x=labels,
        y=labels,
        text_auto=True,
        color_continuous_scale='Purples',
        labels=dict(x="Predicted Label", y="Actual Label", color="Count"),
        title="Confusion Matrix Heatmap"
    )
    fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color='white')
    return fig
