import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import requests
import os

# ==========================================
API_KEY = "jrxPLH7KQ+YT7n6TUeHUcA==3xBIPi7KqssoqPBF"
MODEL_PATH = "best_food_model3.pth"  # 모델 파일 이름
IMAGE_PATH = "C:\TempProjects\swai\TestImages\chicken2.jpeg"     
# ==========================================

#학습할 때 ImageFolder는 폴더명을 '알파벳 순서'로 정렬하여 클래스를 매핑함
# 따라서 알파벳 순서대로 리스트를 적어야 정확하게 매칭됨
class_names = [
    'bibimbap', 'chicken_wings', 'french_fries', 'fried_rice', 'hamburger',
    'hot_dog', 'ice_cream', 'pizza', 'ramen', 'steak' 
]

#웹이랑 이름 협의
display_name_map = {
    'chicken_wings': 'Fried Chicken',
    'french_fries': 'French Fries',
    'fried_rice': 'Fried Rice',
    'ice_cream': 'Ice Cream',
    'hot_dog': 'Hot Dog'
}


def load_model():
   
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"실행 장치: {device}")

    # 2) 껍데기 모델 생성 (ResNet18)
    model = models.resnet18(pretrained=False) # 구조만 가져옴
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(class_names)) # 출력층 10개로 수정

    # 3) 가중치(학습된 내용) 로드
    # map_location='cpu'가 핵심! GPU에서 학습한 걸 CPU로 불러올 때 필수입니다.
    try:
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        print("모델 로딩 성공")
    except FileNotFoundError:
        print(f"로딩 실패")
        return None
    
    model = model.to(device)
    model.eval() # 평가 
    return model


def predict_food(model, image_path):
    # 이미지 전처리 (학습때와 동일하게)
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    try:
        image = Image.open(image_path)
        image_tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(image_tensor)
            _, preds = torch.max(outputs, 1)
            
        raw_name = class_names[preds[0]]
        
        # 이름 변환
        display_name = display_name_map.get(raw_name, raw_name.replace('_', ' ').title())
        search_query = "fried chicken" if raw_name == "chicken_wings" else raw_name.replace('_', ' ')
        
        return display_name, search_query
        
    except Exception as e:
        print(f"이미지 처리 오류: {e}")
        return None, None


def get_nutrition(query):
    print(f"📡 '{query}' 영양 정보 검색 중...")
    api_url = 'https://api.calorieninjas.com/v1/nutrition?query='
    try:
        response = requests.get(api_url + query, headers={'X-Api-Key': API_KEY})
        if response.status_code == 200:
            data = response.json()
            if data['items']:
                item = data['items'][0]
                return item
            else:
                print("정보 없음")
                return None
        else:
            print(f"API 오류: {response.status_code}")
            return None
    except Exception as e:
        print(f"통신 오류: {e}")
        return None

#main
if __name__ == "__main__":
    # 모델 로드
    model = load_model()
    
    if model:
        # 예측
        disp_name, search_query = predict_food(model, IMAGE_PATH)
        
        if disp_name:
            print(f"\nAI 예측 결과: {disp_name}")
            
            # 영양 정보 가져오기
            info = get_nutrition(search_query)
            
            if info:
                print("\n" + "="*35)
                print(f"    음식명: {info['name']}")
                print(f"    기준 용량: {info['serving_size_g']} g") 
                print("-" * 35)
                print(f"    칼로리: {info['calories']} kcal")
                print(f"    단백질: {info['protein_g']} g")
                print(f"    탄수화물: {info['carbohydrates_total_g']} g")
                print(f"    지방: {info['fat_total_g']} g")
                print("="*35)
