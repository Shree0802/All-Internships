from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

from src.predict import TemperaturePredictor

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="Weather Temperature Prediction API",
    description="FastAPI deployment of the Weather Temperature Prediction ML project.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = TemperaturePredictor()


class WeatherInput(BaseModel):
    humidity: float = Field(..., ge=0, le=100)
    pressure: float = Field(..., ge=850, le=1100)
    wind_speed: float = Field(..., ge=0, le=200)
    rainfall: float = Field(..., ge=0, le=1000)
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    weather_condition: str = Field(..., min_length=1, max_length=50)
    year: int = Field(default=2026, ge=2000, le=2100)


class ForecastInput(BaseModel):
    days: int = Field(default=14, ge=1, le=30)


@app.get("/", response_class=HTMLResponse)
def home():
    return (BASE_DIR / "web" / "index.html").read_text(encoding="utf-8")


@app.get("/health")
def health():
    return {"status": "ok", "service": "weather-temperature-prediction"}


@app.post("/predict")
def predict_temperature(data: WeatherInput):
    try:
        return predictor.predict(
            humidity=data.humidity,
            pressure=data.pressure,
            wind_speed=data.wind_speed,
            rainfall=data.rainfall,
            month=data.month,
            day=data.day,
            weather_condition=data.weather_condition,
            year=data.year,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@app.post("/forecast")
def forecast_temperature(data: ForecastInput):
    try:
        forecast = predictor.predict_future_trend(data.days)
        records = forecast.copy()
        if "Date" in records.columns:
            records["Date"] = records["Date"].astype(str)
        return records.to_dict(orient="records")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Forecast failed: {exc}") from exc
