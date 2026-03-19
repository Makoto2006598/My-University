
import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, Upload, X, Minimize2, ListMusic, Link, Globe, Radio } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  url: string;
  source: 'local' | 'url';
}

type PlayerTab = 'local' | 'url' | 'platform';

interface PlatformEmbed {
  type: 'netease' | 'qqmusic';
  embedId: string;
}

export const MusicPlayer: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<PlayerTab>('local');
  const [urlInput, setUrlInput] = useState('');
  const [urlNameInput, setUrlNameInput] = useState('');
  const [platformEmbed, setPlatformEmbed] = useState<PlatformEmbed | null>(null);
  const [platformInput, setPlatformInput] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      tracks.filter(t => t.source === 'local').forEach(t => URL.revokeObjectURL(t.url));
    };
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
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: URL.createObjectURL(file),
        source: 'local' as const
      }));

      setTracks(prev => [...prev, ...newTracks]);

      if (currentTrackIndex === -1) {
        setCurrentTrackIndex(0);
        setIsPlaying(true);
      }
    }
    e.target.value = '';
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const name = urlNameInput.trim() || urlInput.split('/').pop()?.split('?')[0] || '在线音乐';
    const newTrack: Track = {
      id: crypto.randomUUID(),
      name,
      url: urlInput.trim(),
      source: 'url'
    };
    setTracks(prev => [...prev, newTrack]);
    if (currentTrackIndex === -1) {
      setCurrentTrackIndex(0);
      setIsPlaying(true);
    }
    setUrlInput('');
    setUrlNameInput('');
  };

  const handlePlatformEmbed = () => {
    const input = platformInput.trim();
    if (!input) return;

    // Parse NetEase Cloud Music links
    // Formats: https://music.163.com/#/playlist?id=123456 or just the ID
    const neteasePlaylistMatch = input.match(/playlist\?id=(\d+)/);
    const neteaseSongMatch = input.match(/song\?id=(\d+)/);
    const neteaseIdMatch = input.match(/^(\d+)$/);

    // Parse QQ Music links
    const qqMusicMatch = input.match(/y\.qq\.com\/n\/ryqq\/playlist\/(\d+)/);

    if (neteasePlaylistMatch) {
      setPlatformEmbed({ type: 'netease', embedId: neteasePlaylistMatch[1] });
    } else if (neteaseSongMatch) {
      setPlatformEmbed({ type: 'netease', embedId: neteaseSongMatch[1] });
    } else if (neteaseIdMatch) {
      setPlatformEmbed({ type: 'netease', embedId: neteaseIdMatch[1] });
    } else if (qqMusicMatch) {
      setPlatformEmbed({ type: 'qqmusic', embedId: qqMusicMatch[1] });
    } else {
      // Try as NetEase song ID by default
      setPlatformEmbed({ type: 'netease', embedId: input });
    }
    setPlatformInput('');
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
    if (trackToRemove.source === 'local') {
      URL.revokeObjectURL(trackToRemove.url);
    }

    setTracks(prev => prev.filter((_, i) => i !== index));

    if (index === currentTrackIndex) {
      if (tracks.length > 1) {
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

  const getEmbedUrl = () => {
    if (!platformEmbed) return '';
    if (platformEmbed.type === 'netease') {
      return `https://music.163.com/outchain/player?type=2&id=${platformEmbed.embedId}&auto=0&height=66`;
    }
    return '';
  };

  const tabClass = (tab: PlayerTab) =>
    `flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
      activeTab === tab
        ? 'bg-indigo-500 text-white shadow'
        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
    }`;

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
        <div className="bg-white/95 border border-stone-200 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-md flex flex-col h-[36rem] animate-in slide-in-from-bottom-5 duration-300">
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

          {/* Tab Switcher */}
          <div className="flex gap-1 p-2 bg-stone-50 border-b border-stone-100">
            <button onClick={() => setActiveTab('local')} className={tabClass('local')}>
              <Upload className="w-3 h-3 inline mr-1" />本地
            </button>
            <button onClick={() => setActiveTab('url')} className={tabClass('url')}>
              <Link className="w-3 h-3 inline mr-1" />URL
            </button>
            <button onClick={() => setActiveTab('platform')} className={tabClass('platform')}>
              <Globe className="w-3 h-3 inline mr-1" />平台
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Local & URL tracks tab - show track list */}
            {(activeTab === 'local' || activeTab === 'url') && (
              <div className="p-2 space-y-1">
                {activeTab === 'url' && (
                  <div className="p-3 bg-indigo-50 rounded-lg space-y-2 mb-2">
                    <input
                      type="text"
                      placeholder="音乐名称（可选）"
                      value={urlNameInput}
                      onChange={e => setUrlNameInput(e.target.value)}
                      className="w-full text-xs bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="粘贴音频 URL..."
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
                        className="flex-1 text-xs bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
                      />
                      <button
                        onClick={handleAddUrl}
                        className="px-3 py-2 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-400 transition-colors shrink-0"
                      >
                        添加
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-400">支持 mp3、ogg、wav 等直链地址</p>
                  </div>
                )}

                {tracks.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-stone-400 gap-3 p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                      <ListMusic className="w-6 h-6 opacity-50" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-stone-500">播放列表为空</p>
                      <p className="text-xs">导入本地文件或添加在线URL</p>
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
                        {track.source === 'url' && (
                          <span className="text-[8px] bg-blue-100 text-blue-500 px-1 rounded font-bold shrink-0">URL</span>
                        )}
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
            )}

            {/* Platform embed tab */}
            {activeTab === 'platform' && (
              <div className="p-3 space-y-3">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="粘贴网易云音乐链接或歌曲ID..."
                      value={platformInput}
                      onChange={e => setPlatformInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePlatformEmbed()}
                      className="flex-1 text-xs bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
                    />
                    <button
                      onClick={handlePlatformEmbed}
                      className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-400 transition-colors shrink-0"
                    >
                      加载
                    </button>
                  </div>
                  <div className="text-[10px] text-stone-400 space-y-1">
                    <p>支持格式：</p>
                    <p>- 网易云音乐歌曲链接或ID</p>
                    <p>- 如: music.163.com/#/song?id=xxxxx</p>
                  </div>
                </div>

                {platformEmbed && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                        <Radio className="w-3 h-3 text-red-500" />
                        {platformEmbed.type === 'netease' ? '网易云音乐' : 'QQ音乐'}
                      </span>
                      <button
                        onClick={() => setPlatformEmbed(null)}
                        className="text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                      <iframe
                        src={getEmbedUrl()}
                        width="100%"
                        height="86"
                        frameBorder="0"
                        allow="autoplay"
                        className="border-0"
                        title="Music Platform Player"
                      />
                    </div>
                  </div>
                )}

                {!platformEmbed && (
                  <div className="flex flex-col items-center justify-center py-8 text-stone-400 gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-50 to-indigo-50 flex items-center justify-center">
                      <Globe className="w-8 h-8 opacity-40" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-stone-500">外部平台播放</p>
                      <p className="text-[10px]">粘贴音乐链接即可嵌入播放器</p>
                    </div>
                  </div>
                )}
              </div>
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
          <div className="p-4 border-t border-stone-200 bg-white/80 space-y-3">
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

            {activeTab === 'local' && (
              <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-200 rounded-xl cursor-pointer transition-all text-xs text-stone-600 font-bold shadow-sm group">
                <Upload className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span>导入本地音乐 (支持多选)</span>
                <input type="file" accept="audio/*" multiple className="hidden" onChange={handleFileUpload} />
              </label>
            )}
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
