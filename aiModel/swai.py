import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import requests
import os

# ==========================================
# 1. 설정 (API 키와 파일 경로)
# ==========================================
API_KEY = "jrxPLH7KQ+YT7n6TUeHUcA==3xBIPi7KqssoqPBF"
MODEL_PATH = "best_food_model4.pth"  # 학습된 모델 파일명
IMAGE_PATH = "C:\TempProjects\swai\TestImages\pizza1.jpeg"       # 테스트할 사진 파일명

# ★ 중요: PyTorch ImageFolder는 폴더명을 '알파벳 순서'로 정렬하여 0, 1, 2... 라벨을 붙입니다.
# 따라서 데이터셋의 target_classes를 알파벳 순으로 정렬해서 적어야 정확히 매칭됩니다.
# (chocolate_cake 포함됨)
class_names = [
    'bibimbap', 
    'chicken_wings', 
    'chocolate_cake', 
    'french_fries', 
    'fried_rice', 
    'hamburger', 
    'pizza', 
    'ramen', 
    'steak', 
    'sushi'
]

# ==========================================
# 2. 모델 불러오기 (ResNet18 기준)
# ==========================================
def load_model():
    # 로컬은 CPU 사용 (GPU 없어도 돌아가게 설정)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"실행 장치: {device}")

    try:
        # 모델 껍데기 생성 (ResNet18)
        model = models.resnet18(pretrained=False)
        num_ftrs = model.fc.in_features
        model.fc = nn.Linear(num_ftrs, len(class_names)) # 클래스 개수 10개

        # 저장된 가중치 불러오기 (map_location 필수)
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model = model.to(device)
        model.eval()
        print("모델 로딩 성공!")
        return model
    except FileNotFoundError:
        print(f"오류: '{MODEL_PATH}' 파일을 찾을 수 없습니다.")
        return None
    except Exception as e:
        print(f"모델 로딩 오류: {e}")
        return None


def predict_and_search(model, image_path):
    # 이미지 전처리 (학습때와 동일한 규격)
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    try:
        # 1. 이미지 예측
        image = Image.open(image_path)
        image_tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(image_tensor)
            _, preds = torch.max(outputs, 1)
            
        # 예측된 이름 (데이터셋 폴더명 그대로 사용)
        predicted_name = class_names[preds[0]]
        print(f"\n 인식된 음식: {predicted_name}")

        # 2. 영양 정보 검색
        # 검색 정확도를 위해 언더바(_)만 공백으로 바꿔서 요청 (API 문법상 필요)
        query = predicted_name.replace('_', ' ') 
        
        print(f"'{query}' 정보 검색 중...")
        api_url = 'https://api.calorieninjas.com/v1/nutrition?query='
        
        response = requests.get(api_url + query, headers={'X-Api-Key': API_KEY})
        
        if response.status_code == 200:
            data = response.json()
            if data['items']:
                item = data['items'][0]
                print("\n" + "="*30)
                print(f"  이름: {item['name']}")
                print(f"  기준 용량 : {item['serving_size_g']} g")
                print("-" * 30)
                print(f"  칼로리: {item['calories']} kcal")
                print(f"  단백질: {item['protein_g']} g")
                print(f"  탄수화물: {item['carbohydrates_total_g']} g")
                print(f"  지방: {item['fat_total_g']} g")
                print("="*30)
            else:
                print("API 결과 없음")
        else:
            print(f"API 연결 실패: {response.status_code}")

    except Exception as e:
        print(f"실행 중 오류 발생: {e}")

# ==========================================
# 4. 실행
# ==========================================
if __name__ == "__main__":
    # 모델 로드
    model = load_model()
    
    # 모델이 정상적으로 로드되었을 때만 실행
    if model:
        if os.path.exists(IMAGE_PATH):
            predict_and_search(model, IMAGE_PATH)
        else:
            print(f"'{IMAGE_PATH}' 사진이 없습니다. 경로를 확인해주세요.")