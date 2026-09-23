from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

from src.predict import SpamPredictor

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="Spam Email Classifier API",
    description="FastAPI deployment of the Spam Email Classifier ML project.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = SpamPredictor()


class EmailInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=20000)


@app.get("/", response_class=HTMLResponse)
def home():
    return (BASE_DIR / "web" / "index.html").read_text(encoding="utf-8")


@app.get("/health")
def health():
    return {"status": "ok", "service": "spam-email-classifier"}


@app.post("/predict")
def predict_email(data: EmailInput):
    try:
        return predictor.predict(data.text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Classification failed: {exc}") from exc
