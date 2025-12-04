const LOCAL_DEFAULT = 'http://localhost:8000';
const STORAGE_KEY = 'foodlens_model_api';

// Runtime에서 우선순위로 API 주소를 결정:
// 1) URL 쿼리 ?api=... (존재 시 로컬스토리지에 저장)
// 2) 로컬스토리지에 저장된 값
// 3) VITE_MODEL_API (배포용)
// 4) 개발 모드일 때만 로컬 기본값
function resolveApiBase(): string | undefined {
  let base: string | null | undefined;

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const apiParam = params.get('api');
    if (apiParam) {
      localStorage.setItem(STORAGE_KEY, apiParam);
      base = apiParam;
    }

    if (!base) {
      base = localStorage.getItem(STORAGE_KEY) || undefined;
    }
  }

  if (!base && import.meta.env.VITE_MODEL_API) {
    base = import.meta.env.VITE_MODEL_API;
  }

  if (!base && import.meta.env.DEV) {
    base = LOCAL_DEFAULT;
  }

  return base || undefined;
}

const API_BASE = resolveApiBase();

export function getApiBase() {
  return API_BASE;
}

export interface CustomModelFoodItem {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export async function analyzeImageWithCustomModel(file: File): Promise<CustomModelFoodItem[]> {
  if (!API_BASE) {
    throw new Error('모델 서버 주소가 설정되지 않았어요. ?api=주소 파라미터 또는 VITE_MODEL_API를 확인해 주세요.');
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
