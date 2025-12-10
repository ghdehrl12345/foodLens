"""
FastAPI server wrapping the custom food classification model located in swai.py.

POST /analyze
  - Accepts image file upload
  - Returns [{ name, calories, carbs, protein, fat }]
"""

import io
import os
from typing import Dict

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import models, transforms
import requests

# Model / API configuration
MODEL_PATH = os.getenv("MODEL_PATH", "best_food_model4.pth")
CALORIE_NINJAS_API_KEY = os.getenv(
    "CALORIE_NINJAS_API_KEY", "jrxPLH7KQ+YT7n6TUeHUcA==3xBIPi7KqssoqPBF"
)

# Ensure class order matches training (alphabetical)
CLASS_NAMES = [
    "bibimbap",
    "chicken_wings",
    "chocolate_cake",
    "french_fries",
    "fried_rice",
    "hamburger",
    "pizza",
    "ramen",
    "steak",
    "sushi",
]

# Fallback nutrition map if API fails
NUTRITION_FALLBACK: Dict[str, Dict[str, float]] = {
    "bibimbap": {"calories": 600, "carbs": 85, "protein": 20, "fat": 16},
    "chicken_wings": {"calories": 420, "carbs": 10, "protein": 35, "fat": 25},
    "chocolate_cake": {"calories": 350, "carbs": 45, "protein": 5, "fat": 15},
    "french_fries": {"calories": 365, "carbs": 48, "protein": 4, "fat": 18},
    "fried_rice": {"calories": 520, "carbs": 70, "protein": 15, "fat": 15},
    "hamburger": {"calories": 550, "carbs": 45, "protein": 30, "fat": 28},
    "pizza": {"calories": 285, "carbs": 36, "protein": 12, "fat": 10},
    "ramen": {"calories": 430, "carbs": 55, "protein": 12, "fat": 16},
    "steak": {"calories": 679, "carbs": 0, "protein": 62, "fat": 48},
    "sushi": {"calories": 300, "carbs": 65, "protein": 12, "fat": 3},
}


def load_model():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = models.resnet18(pretrained=False)
    num_ftrs = model.fc.in_features
    model.fc = torch.nn.Linear(num_ftrs, len(CLASS_NAMES))

    state = torch.load(MODEL_PATH, map_location=device)
    model.load_state_dict(state)
    model = model.to(device)
    model.eval()
    return model, device


app = FastAPI(title="FoodLens Custom Model API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    MODEL, DEVICE = load_model()
except Exception as exc:
    MODEL = None
    DEVICE = torch.device("cpu")
    print(f"[server] Failed to load model: {exc}")

transform = transforms.Compose(
    [
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)


def fetch_nutrition(food_name: str):
    try:
        query = food_name.replace("_", " ")
        url = f"https://api.calorieninjas.com/v1/nutrition?query={query}"
        headers = {"X-Api-Key": CALORIE_NINJAS_API_KEY}
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("items"):
                item = data["items"][0]
                return {
                    "name": item.get("name", query),
                    "calories": item.get("calories", 0),
                    "carbs": item.get("carbohydrates_total_g", 0),
                    "protein": item.get("protein_g", 0),
                    "fat": item.get("fat_total_g", 0),
                }
    except Exception as exc:
        print(f"[server] Nutrition API failed: {exc}")

    fallback = NUTRITION_FALLBACK.get(
        food_name, {"calories": 0, "carbs": 0, "protein": 0, "fat": 0}
    )
    return {"name": food_name.replace("_", " ").title(), **fallback}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    if MODEL is None:
        raise HTTPException(
            status_code=500,
            detail=f"모델을 로드하지 못했습니다. MODEL_PATH={MODEL_PATH}",
        )

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="이미지 파일을 열 수 없습니다.")

    image_tensor = transform(image).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        outputs = MODEL(image_tensor)
        _, preds = torch.max(outputs, 1)

    class_name = CLASS_NAMES[preds.item()]
    nutrition = fetch_nutrition(class_name)

    return [
        {
            "name": nutrition["name"],
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
