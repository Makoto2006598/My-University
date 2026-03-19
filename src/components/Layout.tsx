
import React from 'react';
import { MusicPlayer } from './MusicPlayer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen bg-orange-50 text-stone-800 overflow-hidden relative">
      {/* Main Content */}
      <main className="h-full w-full overflow-hidden flex flex-col relative">
        {children}
      </main>

      {/* Music Player Overlay */}
      <MusicPlayer />
    </div>
  );
};
