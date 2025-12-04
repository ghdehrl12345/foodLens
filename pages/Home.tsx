import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, CheckCircle, ArrowRight, Activity } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-amber-400 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1920&q=80" 
            alt="따뜻한 한식 상차림" 
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-emerald-900/10 to-amber-900/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-semibold uppercase tracking-wider">
            한국인 맞춤 AI 칼로리 트래커
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            사진 한 장으로 끝내는 <br/>
            <span className="text-amber-100">한식 식단 관리</span>
          </h1>
          <p className="text-xl md:text-2xl text-emerald-50/90 max-w-3xl">
            김치찌개도, 샐러드도 한 번에. 푸드렌즈가 사진만으로 칼로리와 영양소를 계산하고 오늘의 목표까지 챙겨줍니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/upload" 
              className="px-8 py-4 bg-white text-emerald-600 rounded-full font-bold text-lg shadow-lg hover:bg-emerald-50 transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Camera size={24} />
              지금 기록하기
            </Link>
            <Link 
              to="/profile" 
              className="px-8 py-4 bg-emerald-700 text-white border-2 border-emerald-500 rounded-full font-bold text-lg hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
            >
              <Activity size={24} />
              목표 세우기
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">푸드렌즈가 필요한 이유</h2>
            <p className="mt-4 text-xl text-slate-500">한국식 식단 패턴에 맞춰 번거로운 칼로리 계산을 자동화했어요.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Camera size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">한식도 정확한 AI 인식</h3>
              <p className="text-slate-600">
                사진만 찍으면 김치찌개, 비빔밥처럼 섞여 있는 음식도 알아보고 양까지 추정해요.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Activity size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">나에게 맞춘 목표</h3>
              <p className="text-slate-600">
                다이어트든 벌크업이든, 내 신체 정보와 활동량을 기반으로 일일 권장 칼로리를 계산해 줍니다.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">한눈에 확인</h3>
              <p className="text-slate-600">
                남은 칼로리와 영양소를 시각적으로 보여줘서 루틴을 지키고 동기부여 받기 쉬워요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div className="py-20 bg-amber-50/60">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row items-center gap-12">
             <div className="flex-1">
               <h2 className="text-3xl font-bold text-slate-900 mb-6">이런 분께 더 좋아요</h2>
               <ul className="space-y-4">
                 <li className="flex items-start gap-3">
                   <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                   <span className="text-lg text-slate-700"><strong>다이어터</strong> 섭취량을 정확히 관리하고 싶은 분</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                   <span className="text-lg text-slate-700"><strong>바쁜 직장인·학생</strong> 일일이 적기 번거로운 분</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
                   <span className="text-lg text-slate-700"><strong>건강 관리</strong> 혈당·혈압을 위해 식단을 기록해야 하는 분</span>
                 </li>
               </ul>
               <div className="mt-8">
                <Link to="/upload" className="text-emerald-600 font-bold flex items-center hover:underline">
                  데모 체험하기 <ArrowRight size={20} className="ml-2" />
                </Link>
               </div>
             </div>
             <div className="flex-1">
               <img src="https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=80" alt="밥상 위에 놓인 건강한 한식" className="rounded-2xl shadow-xl ring-4 ring-white/60" />
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export default Home;
