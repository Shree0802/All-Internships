# Vercel Deployment

This project is prepared as a FastAPI application for Vercel. Streamlit is not required.

## Vercel settings
- Root Directory: this project folder
- Framework: FastAPI / Python auto-detection
- Build command: leave default
- Output directory: leave default

The Vercel entry point is `app.py` and it exposes `app = FastAPI(...)`.

## Local run
```bash
pip install -r requirements.txt
uvicorn app:app --reload
```

Open `http://127.0.0.1:8000` for the web UI or `/docs` for the API documentation.

## Endpoints
- `GET /`
- `GET /health`
- `POST /predict`

The trained model artifacts are included at `models/best_model.pkl` and `models/vectorizer.pkl`.
