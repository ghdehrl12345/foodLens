
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.08),transparent_30%)]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} 푸드렌즈. 건강한 한 끼를 응원해요.
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
