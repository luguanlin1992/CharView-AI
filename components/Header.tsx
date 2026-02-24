
import React from 'react';
import { BoxSelect, Circle } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-200/60 h-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
            <BoxSelect className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-none">CharView AI</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Character Design Studio</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/50">
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-600 uppercase">Engine Ready</span>
          </div>
          <nav className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-wider text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">Workspace</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Assets</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Help</a>
          </nav>
        </div>
      </div>
    </header>
  );
};
