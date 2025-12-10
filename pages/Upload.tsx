
import React, { useState } from 'react';
import { Upload as UploadIcon, Camera, Loader2, Plus, Check } from 'lucide-react';
import { analyzeImageWithCustomModel } from '../services/customModelClient';
import { FoodItem, Meal } from '../types';
import { useNavigate } from 'react-router-dom';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodItem[] | null>(null);
  const [mealType, setMealType] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('LUNCH');
  const mealTypeLabels: Record<Meal['type'], string> = {
    BREAKFAST: '아침',
    LUNCH: '점심',
    DINNER: '저녁',
    SNACK: '간식',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeImageWithCustomModel(selectedFile);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed', error);
      alert('분석에 실패했어요. 모델 서버가 켜져 있는지 확인해 주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMeal = () => {
    if (!analysisResult) return;

    const totalCalories = analysisResult.reduce((sum, item) => sum + item.calories, 0);

    const newMeal: Meal = {
      id: Date.now().toString(),
      type: mealType,
      timestamp: Date.now(),
      imageUrl: previewUrl || undefined,
      foods: analysisResult,
      totalCalories,
    };

    // Save to local storage
    const today = new Date().toISOString().split('T')[0];
    const storedLogs = localStorage.getItem('dailyLogs');
    const logs = storedLogs ? JSON.parse(storedLogs) : {};
    
    if (!logs[today]) {
      logs[today] = [];
    }
    logs[today].push(newMeal);

    localStorage.setItem('dailyLogs', JSON.stringify(logs));
    
    // Cleanup preview URL to avoid memory leaks (though handled by browser eventually)
    // URL.revokeObjectURL(previewUrl!);
    
    navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-3">
          <Camera size={16} /> 사진 AI 분석
        </div>
        <h1 className="text-3xl font-bold text-slate-900">식사를 기록하고 분석해요</h1>
        <p className="mt-2 text-slate-600">사진 한 장으로 칼로리와 영양소를 자동 계산합니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-amber-50 overflow-hidden">
        {/* Upload Area */}
        <div className="p-8">
          {!previewUrl ? (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative cursor-pointer group">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera size={32} />
              </div>
              <p className="text-lg font-medium text-slate-700">클릭하거나 끌어다 놓아 사진을 올리세요</p>
              <p className="text-sm text-slate-400 mt-1">JPG, PNG 지원</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-slate-100">
              <img src={previewUrl} alt="식사 미리보기" className="w-full h-64 object-cover" />
              <button 
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setAnalysisResult(null);
                }}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md text-slate-600 hover:text-red-500"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
          )}
        </div>

        {/* Controls & Analysis */}
        {previewUrl && (
          <div className="px-8 pb-8 space-y-6">
            {!analysisResult ? (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" /> 분석 중...
                  </>
                ) : (
                  <>
                    <UploadIcon size={20} /> 음식 분석하기
                  </>
                )}
              </button>
            ) : (
              <div className="animate-fade-in">
                <div className="bg-emerald-50 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <Check size={20} /> 분석 결과
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.map((food, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-emerald-100">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-800 text-lg">{food.name}</span>
                          <span className="font-bold text-emerald-600">{food.calories} kcal</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                          <div className="bg-slate-50 p-2 rounded text-center">
                            <span className="block font-semibold text-slate-700">{food.carbs}g</span>
                            탄수화물
                          </div>
                          <div className="bg-slate-50 p-2 rounded text-center">
                            <span className="block font-semibold text-slate-700">{food.protein}g</span>
                            단백질
                          </div>
                          <div className="bg-slate-50 p-2 rounded text-center">
                            <span className="block font-semibold text-slate-700">{food.fat}g</span>
                            지방
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">식사 종류</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setMealType(type as any)}
                                    className={`py-2 text-xs sm:text-sm font-medium rounded-lg border ${
                                        mealType === type 
                                        ? 'bg-emerald-600 text-white border-emerald-600' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {mealTypeLabels[type as typeof mealType]}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <button
                        onClick={handleSaveMeal}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg"
                    >
                        기록으로 저장
                    </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
