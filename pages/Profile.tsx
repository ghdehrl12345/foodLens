
import React, { useState, useEffect } from 'react';
import { UserStats, Gender, ActivityLevel } from '../types';
import { User, Save, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>({
    name: '',
    age: 25,
    gender: Gender.FEMALE,
    height: 165,
    weight: 60,
    activityLevel: ActivityLevel.MODERATE,
    goal: 'MAINTAIN',
  });

  const [dailyCalories, setDailyCalories] = useState<number>(0);

  useEffect(() => {
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  useEffect(() => {
    let bmr = 0;
    // Harris-Benedict Equation
    if (stats.gender === Gender.MALE) {
      bmr = 88.362 + (13.397 * stats.weight) + (4.799 * stats.height) - (5.677 * stats.age);
    } else {
      bmr = 447.593 + (9.247 * stats.weight) + (3.098 * stats.height) - (4.330 * stats.age);
    }

    let multiplier = 1.2;
    switch (stats.activityLevel) {
      case ActivityLevel.SEDENTARY: multiplier = 1.2; break;
      case ActivityLevel.LIGHT: multiplier = 1.375; break;
      case ActivityLevel.MODERATE: multiplier = 1.55; break;
      case ActivityLevel.ACTIVE: multiplier = 1.725; break;
      case ActivityLevel.VERY_ACTIVE: multiplier = 1.9; break;
    }

    let tdee = bmr * multiplier;

    if (stats.goal === 'LOSE') tdee -= 500;
    if (stats.goal === 'GAIN') tdee += 500;

    setDailyCalories(Math.round(tdee));
  }, [stats]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userStats', JSON.stringify(stats));
    // Also save the calculated target calories separately for easy access
    localStorage.setItem('userTargetCalories', String(dailyCalories));
    alert('프로필이 저장되었어요!');
    navigate('/dashboard');
  };

  const handleChange = (field: keyof UserStats, value: any) => {
    setStats(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
        <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5" /> 내 정보와 목표
            </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                <input
                  type="text"
                  required
                  value={stats.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">성별</label>
                  <select
                    value={stats.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 outline-none"
                  >
                    <option value={Gender.MALE}>남성</option>
                    <option value={Gender.FEMALE}>여성</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">나이</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={stats.age}
                    onChange={(e) => handleChange('age', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">키 (cm)</label>
                  <input
                    type="number"
                    value={stats.height}
                    onChange={(e) => handleChange('height', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">몸무게 (kg)</label>
                  <input
                    type="number"
                    value={stats.weight}
                    onChange={(e) => handleChange('weight', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Activity & Goals */}
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">활동량</label>
                  <select
                    value={stats.activityLevel}
                    onChange={(e) => handleChange('activityLevel', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 outline-none"
                  >
                    <option value={ActivityLevel.SEDENTARY}>거의 운동 안 함 (사무직)</option>
                    <option value={ActivityLevel.LIGHT}>가벼운 운동 (주 1-3회)</option>
                    <option value={ActivityLevel.MODERATE}>보통 운동 (주 3-5회)</option>
                    <option value={ActivityLevel.ACTIVE}>자주 운동 (거의 매일)</option>
                    <option value={ActivityLevel.VERY_ACTIVE}>매우 활동적 (육체노동/강도 높은 운동)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">목표</label>
                  <div className="flex gap-2">
                    {['LOSE', 'MAINTAIN', 'GAIN'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleChange('goal', g)}
                        className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors ${
                          stats.goal === g
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {g === 'LOSE' ? '체중 감량' : g === 'GAIN' ? '근육 증가' : '체중 유지'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Result */}
                <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-emerald-800 font-semibold mb-1 flex items-center gap-2">
                      <Calculator size={16}/> 하루 권장 칼로리
                    </h3>
                    <p className="text-emerald-600 text-xs">입력한 정보 기준</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-emerald-700">{dailyCalories}</span>
                    <span className="text-sm text-emerald-600 font-medium">kcal</span>
                  </div>
                </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Save size={20} />
              저장 후 대시보드로
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
