import { analyzeImageMock } from './mockAiService';
import { CustomModelFoodItem } from './customModelClient';

// 브라우저에서만 동작하는 간단한 대체 추론기.
// 현재는 학습 모델 없이 mock 데이터에서 무작위로 선택합니다.
export async function analyzeImageInBrowser(file: File): Promise<CustomModelFoodItem[]> {
  return analyzeImageMock(file);
}
