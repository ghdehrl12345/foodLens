export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY', // Little or no exercise
  LIGHT = 'LIGHT', // Light exercise 1-3 days/week
  MODERATE = 'MODERATE', // Moderate exercise 3-5 days/week
  ACTIVE = 'ACTIVE', // Hard exercise 6-7 days/week
  VERY_ACTIVE = 'VERY_ACTIVE', // Very hard exercise & physical job
}

export interface UserStats {
  name: string;
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  goal: 'LOSE' | 'MAINTAIN' | 'GAIN';
}

export interface FoodItem {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface Meal {
  id: string;
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  timestamp: number;
  imageUrl?: string;
  foods: FoodItem[];
  totalCalories: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: Meal[];
}