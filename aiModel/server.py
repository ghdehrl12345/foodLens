"""
FastAPI wrapper around the custom food classification model (swai.py).
- POST /analyze : accepts an image file, returns FoodItem[] JSON
"""

import io
import os
from typing import Dict

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms

from swai import class_names, display_name_map, load_model

# Nutrition map for each raw class_name (approximate example values)
NUTRITION_MAP: Dict[str, Dict[str, float]] = {
    "bibimbap": {"calories": 600, "carbs": 80, "protein": 20, "fat": 15},
    "chicken_wings": {"calories": 420, "carbs": 10, "protein": 35, "fat": 25},
    "french_fries": {"calories": 365, "carbs": 48, "protein": 4, "fat": 18},
    "fried_rice": {"calories": 520, "carbs": 70, "protein": 15, "fat": 15},
    "hamburger": {"calories": 550, "carbs": 45, "protein": 30, "fat": 28},
    "hot_dog": {"calories": 320, "carbs": 30, "protein": 12, "fat": 18},
    "ice_cream": {"calories": 270, "carbs": 32, "protein": 5, "fat": 14},
    "pizza": {"calories": 285, "carbs": 36, "protein": 12, "fat": 10},
    "ramen": {"calories": 430, "carbs": 55, "protein": 12, "fat": 16},
    "steak": {"calories": 679, "carbs": 0, "protein": 62, "fat": 48},
}


app = FastAPI(title="FoodLens Custom Model API")

# Allow local dev; tighten origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL = load_model()

transform = transforms.Compose(
    [
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)


def predict_class(image: Image.Image):
    if MODEL is None:
        raise RuntimeError("모델이 로드되지 않았습니다.")

    image_tensor = transform(image).unsqueeze(0).to(DEVICE)
    MODEL.eval()
    with torch.no_grad():
        outputs = MODEL(image_tensor)
        probs = torch.softmax(outputs, dim=1)
        conf, preds = torch.max(probs, 1)

    idx = preds.item()
    raw_name = class_names[idx]
    display_name = display_name_map.get(raw_name, raw_name.replace("_", " ").title())
    return raw_name, display_name


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    if MODEL is None:
        raise HTTPException(status_code=500, detail="모델 로드에 실패했습니다.")

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="이미지 파일을 열 수 없습니다.")

    try:
        raw_name, display_name = predict_class(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"추론 오류: {e}") from e

    nutrition = NUTRITION_MAP.get(
        raw_name, {"calories": 0, "carbs": 0, "protein": 0, "fat": 0}
    )

    return [
        {
            "name": display_name,
            "calories": nutrition["calories"],
            "carbs": nutrition["carbs"],
            "protein": nutrition["protein"],
            "fat": nutrition["fat"],
        }
    ]


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
