const LOCAL_DEFAULT = 'http://localhost:8000';

// 배포 환경에서는 반드시 VITE_MODEL_API를 설정하도록 하고,
// 개발 환경에서는 로컬 기본값을 사용한다.
const API_BASE =
  import.meta.env.VITE_MODEL_API ??
  (import.meta.env.DEV ? LOCAL_DEFAULT : undefined);

export interface CustomModelFoodItem {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export async function analyzeImageWithCustomModel(file: File): Promise<CustomModelFoodItem[]> {
  if (!API_BASE) {
    throw new Error('모델 서버 주소가 설정되지 않았어요. VITE_MODEL_API를 확인해 주세요.');
  }

  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(`모델 서버 오류: ${res.status}`);
  }

  const data = await res.json();

  // 간단한 형태 검증
  if (!Array.isArray(data)) {
    throw new Error('응답 형식이 올바르지 않아요.');
  }

  return data as CustomModelFoodItem[];
}
