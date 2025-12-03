import React from 'react';
import { BoxSelect } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-900">
          <div className="bg-slate-900 p-2 rounded-lg">
            <BoxSelect className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">CharView AI</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-slate-900 transition-colors">图库</a>
          <a href="#" className="hover:text-slate-900 transition-colors">文档</a>
          <a href="#" className="hover:text-slate-900 transition-colors">定价</a>
        </nav>
      </div>
    </header>
  );
};