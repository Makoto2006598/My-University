
import React from 'react';
import { ViewMode } from '../types';
import { LayoutDashboard, MessageSquareText, Settings } from 'lucide-react';
import { MusicPlayer } from './MusicPlayer';

interface LayoutProps {
  currentMode: ViewMode;
  setMode: (mode: ViewMode) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentMode, setMode, children }) => {
  return (
    <div className="flex h-screen w-screen bg-orange-50 text-stone-800 overflow-hidden relative">
      {/* Sidebar */}
      <div className="w-20 lg:w-64 bg-white border-r border-orange-100 flex flex-col items-center lg:items-stretch shadow-sm z-50">
        <div className="p-4 flex items-center justify-center lg:justify-start gap-3 border-b border-orange-100 h-16">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-orange-200">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="hidden lg:block font-bold text-lg tracking-tight text-stone-800">My University</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setMode(ViewMode.PROTOTYPE)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              currentMode === ViewMode.PROTOTYPE
                ? 'bg-orange-100 text-orange-700 shadow-sm'
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
            }`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="hidden lg:block font-medium">游戏 (Game)</span>
          </button>

          <button
            onClick={() => setMode(ViewMode.CONSULTANT)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              currentMode === ViewMode.CONSULTANT
                ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
            }`}
          >
            <MessageSquareText className="w-6 h-6" />
            <span className="hidden lg:block font-medium">技术顾问 (AI)</span>
          </button>
        </nav>

        <div className="p-4 border-t border-orange-100">
            <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100 text-xs text-stone-500">
                <p className="hidden lg:block mb-1 font-semibold text-stone-700">开发状态</p>
                <p className="hidden lg:block">Build: v0.2.1-warm</p>
                <Settings className="w-5 h-5 mx-auto lg:hidden" />
            </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-orange-50">
        {children}
      </main>

      {/* Music Player Overlay */}
      <MusicPlayer />
    </div>
  );
};
