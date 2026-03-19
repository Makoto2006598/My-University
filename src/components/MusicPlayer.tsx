
import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, Upload, X, Minimize2, ListMusic } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  url: string;
}

export const MusicPlayer: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
      // Cleanup object URLs when component unmounts
      return () => {
          tracks.forEach(t => URL.revokeObjectURL(t.url));
      }
  }, []);

  useEffect(() => {
      if (currentTrackIndex >= 0 && currentTrackIndex < tracks.length) {
          if (audioRef.current) {
              audioRef.current.src = tracks[currentTrackIndex].url;
              if (isPlaying) {
                  audioRef.current.play().catch(e => {
                      console.error("Playback failed", e);
                      setIsPlaying(false);
                  });
              }
          }
      }
  }, [currentTrackIndex]);

  useEffect(() => {
      if (audioRef.current) {
          if (isPlaying) {
              if (audioRef.current.src) {
                 audioRef.current.play().catch(e => {
                     console.error("Playback failed", e);
                     setIsPlaying(false);
                 });
              }
          } else {
              audioRef.current.pause();
          }
      }
  }, [isPlaying]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newTracks: Track[] = Array.from(e.target.files).map((file: File) => ({
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^/.]+$/, ""), // remove extension for display
        url: URL.createObjectURL(file)
      }));
      
      setTracks(prev => [...prev, ...newTracks]);

      if (currentTrackIndex === -1) {
          setCurrentTrackIndex(0);
          setIsPlaying(true);
      }
    }
    // Reset input
    e.target.value = '';
  };

  const togglePlay = () => {
      if (tracks.length === 0) return;
      setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
      if (tracks.length === 0) return;
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
      setIsPlaying(true);
  };

  const prevTrack = () => {
      if (tracks.length === 0) return;
      setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
      setIsPlaying(true);
  };

  const removeTrack = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      const trackToRemove = tracks[index];
      URL.revokeObjectURL(trackToRemove.url); // Cleanup

      setTracks(prev => prev.filter((_, i) => i !== index));
      
      if (index === currentTrackIndex) {
          if (tracks.length > 1) {
             // If removing current, play next (or wrap to 0)
             const nextIdx = index >= tracks.length - 1 ? 0 : index;
             setIsPlaying(false);
             setCurrentTrackIndex(nextIdx);
             setTimeout(() => setIsPlaying(true), 100); 
          } else {
              setIsPlaying(false);
              setCurrentTrackIndex(-1);
          }
      } else if (index < currentTrackIndex) {
          setCurrentTrackIndex(prev => prev - 1);
      }
  };

  const handleEnded = () => {
      nextTrack();
  };

  return (
    <div className={`fixed bottom-4 right-4 z-[100] transition-all duration-300 ${isExpanded ? 'w-80' : 'w-auto'}`}>
      
      {/* Minimized View */}
      {!isExpanded && (
        <button 
            onClick={() => setIsExpanded(true)}
            className="w-12 h-12 bg-white/90 border border-stone-200 rounded-full flex items-center justify-center hover:bg-orange-50 text-indigo-500 shadow-2xl relative group overflow-hidden backdrop-blur-sm"
            title="打开音乐播放器"
        >
            <div className={`absolute inset-0 bg-indigo-500/20 rounded-full ${isPlaying ? 'animate-ping opacity-75' : 'hidden'}`}></div>
            <Music className={`w-5 h-5 relative z-10 ${isPlaying ? 'animate-bounce' : ''}`} />
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-white/95 border border-stone-200 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-md flex flex-col h-[32rem] animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-white/50">
                <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
                    <Music className="w-4 h-4 text-indigo-500" />
                    <span>My Music</span>
                </div>
                <button onClick={() => setIsExpanded(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                    <Minimize2 className="w-4 h-4" />
                </button>
            </div>

            {/* Track List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-stone-50/50">
                {tracks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-3 p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                            <ListMusic className="w-6 h-6 opacity-50" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-stone-500">播放列表为空</p>
                            <p className="text-xs">导入本地音频文件开始播放</p>
                        </div>
                    </div>
                ) : (
                    tracks.map((track, idx) => (
                        <div 
                            key={track.id}
                            onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }}
                            className={`p-3 rounded-lg flex items-center justify-between cursor-pointer group transition-all text-xs
                                ${currentTrackIndex === idx 
                                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                                    : 'hover:bg-stone-100 text-stone-500 hover:text-stone-700'
                                }`}
                        >
                            <div className="truncate flex-1 pr-2 flex items-center gap-2">
                                {currentTrackIndex === idx ? (
                                    <div className="flex items-end gap-[2px] h-3">
                                        <span className="w-[2px] h-full bg-indigo-400 animate-music-bar" style={{ animationDelay: '0s' }}></span>
                                        <span className="w-[2px] h-full bg-indigo-400 animate-music-bar" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-[2px] h-full bg-indigo-400 animate-music-bar" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-mono opacity-50 w-4 text-center">{idx + 1}</span>
                                )}
                                <span className="truncate">{track.name}</span>
                            </div>
                            <button 
                                onClick={(e) => removeTrack(e, idx)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded transition-all"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Now Playing Info */}
            {currentTrackIndex >= 0 && tracks[currentTrackIndex] && (
                 <div className="px-4 py-2 bg-indigo-50 border-t border-stone-100">
                     <div className="text-xs text-indigo-600 truncate font-medium">
                         正在播放: {tracks[currentTrackIndex].name}
                     </div>
                 </div>
            )}

            {/* Controls */}
            <div className="p-4 border-t border-stone-200 bg-white/80 space-y-4">
                <div className="flex items-center justify-center gap-6">
                    <button onClick={prevTrack} className="text-stone-400 hover:text-stone-600 transition-colors hover:scale-110 active:scale-95"><SkipBack className="w-5 h-5" /></button>
                    <button 
                        onClick={togglePlay} 
                        className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95 border border-indigo-400/20"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <button onClick={nextTrack} className="text-stone-400 hover:text-stone-600 transition-colors hover:scale-110 active:scale-95"><SkipForward className="w-5 h-5" /></button>
                </div>

                <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-stone-400 shrink-0" />
                    <div className="relative w-full h-1 bg-stone-200 rounded-full group">
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={volume} 
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div 
                            className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${volume * 100}%` }}
                        ></div>
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border border-stone-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ left: `${volume * 100}%`, transform: `translate(-50%, -50%)` }}
                        ></div>
                    </div>
                </div>

                <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-200 rounded-xl cursor-pointer transition-all text-xs text-stone-600 font-bold shadow-sm group">
                    <Upload className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span>导入音乐 (支持多选)</span>
                    <input type="file" accept="audio/*" multiple className="hidden" onChange={handleFileUpload} />
                </label>
            </div>
            
            <audio 
                ref={audioRef} 
                onEnded={handleEnded} 
                className="hidden" 
            />
        </div>
      )}
    </div>
  );
};
