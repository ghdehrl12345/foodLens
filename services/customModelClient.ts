const API_BASE = import.meta.env.VITE_MODEL_API || 'http://localhost:8000';

export interface CustomModelFoodItem {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export async function analyzeImageWithCustomModel(file: File): Promise<CustomModelFoodItem[]> {
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
