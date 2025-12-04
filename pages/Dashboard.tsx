
import React, { useEffect, useState } from 'react';
import { Meal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Utensils, Zap, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#10b981', '#f1f5f9']; // Emerald-500, Slate-100
const MACRO_COLORS = ['#3b82f6', '#ef4444', '#eab308']; // Blue, Red, Yellow

const Dashboard: React.FC = () => {
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [macros, setMacros] = useState({ carbs: 0, protein: 0, fat: 0 });
  const [userName, setUserName] = useState('게스트');

  const mealTypeLabelMap: Record<Meal['type'], string> = {
    BREAKFAST: '아침',
    LUNCH: '점심',
    DINNER: '저녁',
    SNACK: '간식',
  };

  useEffect(() => {
    // 1. Load User Info
    const statsStr = localStorage.getItem('userStats');
    if (statsStr) {
      const stats = JSON.parse(statsStr);
      setUserName(stats.name || '게스트');
      
      const savedTarget = localStorage.getItem('userTargetCalories');
      if (savedTarget) {
        setTargetCalories(Number(savedTarget));
      }
    }

    // 2. Load Meals
    const logsStr = localStorage.getItem('dailyLogs');
    if (logsStr) {
      const logs = JSON.parse(logsStr);
      const today = new Date().toISOString().split('T')[0];
      const todayData = logs[today] || [];
      setTodaysMeals(todayData);

      // Calculate totals
      let cal = 0;
      let c = 0, p = 0, f = 0;
      
      todayData.forEach((meal: Meal) => {
        cal += meal.totalCalories;
        meal.foods.forEach(food => {
          c += food.carbs;
          p += food.protein;
          f += food.fat;
        });
      });

      setTotalCalories(cal);
      setMacros({ carbs: c, protein: p, fat: f });
    }
  }, []);

  const remainingCalories = targetCalories - totalCalories;
  const percentage = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  const pieData = [
    { name: '섭취', value: totalCalories },
    { name: '남은 칼로리', value: Math.max(0, remainingCalories) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">안녕하세요, {userName}님! 👋</h1>
            <p className="text-slate-500">오늘 먹은 것들을 한눈에 확인해 보세요.</p>
        </div>
        <Link 
            to="/upload" 
            className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
            <Zap size={18} className="mr-2" /> 식사 기록하기
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-800 mb-6">오늘의 칼로리</h2>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
                {/* Circular Progress */}
                <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-slate-800">{totalCalories}</span>
                        <span className="text-xs text-slate-400">/ {targetCalories} kcal</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="flex-1 w-full sm:w-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 p-4 rounded-xl">
                            <span className="block text-sm text-emerald-600 font-medium mb-1">남은 칼로리</span>
                            <span className="text-2xl font-bold text-emerald-800">{remainingCalories}</span>
                            <span className="text-xs text-emerald-600 ml-1">kcal</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl">
                            <span className="block text-sm text-slate-500 font-medium mb-1">달성률</span>
                            <span className="text-2xl font-bold text-slate-700">{percentage}%</span>
                        </div>
                    </div>
                    
                    {/* Macro Bars */}
                    <div className="mt-6 space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-slate-600">탄수화물</span>
                                <span className="text-slate-400">{macros.carbs}g</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, macros.carbs / 3)}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-slate-600">단백질</span>
                                <span className="text-slate-400">{macros.protein}g</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.min(100, macros.protein / 2)}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-slate-600">지방</span>
                                <span className="text-slate-400">{macros.fat}g</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min(100, macros.fat / 1)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Recent Meals */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Utensils size={18} /> 오늘의 식사
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {todaysMeals.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                        <AlertCircle size={40} className="mb-2 opacity-50" />
                        <p>아직 기록이 없어요. 한 끼를 찍어보세요.</p>
                    </div>
                ) : (
                    todaysMeals.map((meal) => (
                        <div key={meal.id} className="flex gap-3 items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                             <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                                {meal.imageUrl ? (
                                    <img src={meal.imageUrl} alt="Meal" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <Utensils size={20} />
                                    </div>
                                )}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">{mealTypeLabelMap[meal.type]}</span>
                                    <span className="text-sm font-bold text-slate-800">{meal.totalCalories} kcal</span>
                                </div>
                                <h4 className="text-sm font-medium text-slate-700 truncate mt-0.5">
                                    {meal.foods.map(f => f.name).join(', ')}
                                </h4>
                                <div className="text-xs text-slate-400 mt-1">
                                    {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                             </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
