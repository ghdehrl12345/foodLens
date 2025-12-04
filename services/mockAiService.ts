import { FoodItem } from '../types';

// This service mimics the AI behavior. 
// In the future, this will be replaced with Gemini API calls.

const MOCK_FOOD_DATABASE: FoodItem[] = [
  { name: '닭가슴살 샐러드', calories: 350, carbs: 12, protein: 45, fat: 10 },
  { name: '김치찌개', calories: 450, carbs: 30, protein: 25, fat: 20 },
  { name: '비빔밥', calories: 600, carbs: 80, protein: 20, fat: 15 },
  { name: '아보카도 토스트', calories: 320, carbs: 35, protein: 8, fat: 18 },
  { name: '프로틴 쉐이크', calories: 150, carbs: 5, protein: 25, fat: 2 },
  { name: '떡볶이', calories: 800, carbs: 120, protein: 12, fat: 18 },
];

export const analyzeImageMock = async (file: File): Promise<FoodItem[]> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Return a random food item from the mock DB to simulate AI recognition
      const randomFood = MOCK_FOOD_DATABASE[Math.floor(Math.random() * MOCK_FOOD_DATABASE.length)];
      resolve([randomFood]);
    }, 2000);
  });
};
