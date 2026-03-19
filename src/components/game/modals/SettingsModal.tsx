
import React from 'react';
import { GameSettings } from '../../../types';
import { 
    Settings, X, Volume2, MousePointer2, LogOut, 
    Zap, FastForward, Medal 
} from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    appSettings: GameSettings;
    setAppSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
    onReturnToMain: () => void;
    onDevTimeJump: (e: React.MouseEvent) => void;
    onDevMaxRank: (e: React.MouseEvent) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    appSettings,
    setAppSettings,
    onReturnToMain,
    onDevTimeJump,
    onDevMaxRank
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white border border-stone-200 p-8 rounded-2xl shadow-2xl w-full max-w-md relative max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col gap-6">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1"><X className="w-5 h-5"/></button>
                <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2 border-b border-stone-100 pb-4">
                    <Settings className="w-6 h-6 text-orange-500" /> 设置
                </h2>
                
                {/* Audio Settings */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2"><Volume2 className="w-4 h-4"/> 音频设置</h3>
                    <div>
                        <label className="text-xs font-bold text-stone-600 block mb-1">背景音乐音量</label>
                        <input 
                            type="range" min="0" max="1" step="0.1" 
                            value={appSettings.musicVolume} 
                            onChange={e => setAppSettings({...appSettings, musicVolume: parseFloat(e.target.value)})}
                            className="w-full accent-orange-500 h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer" 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-stone-600 block mb-1">音效音量</label>
                        <input 
                            type="range" min="0" max="1" step="0.1" 
                            value={appSettings.sfxVolume} 
                            onChange={e => setAppSettings({...appSettings, sfxVolume: parseFloat(e.target.value)})}
                            className="w-full accent-orange-500 h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer" 
                        />
                    </div>
                </div>

                {/* Interaction Settings */}
                <div className="space-y-4 pt-2 border-t border-stone-100">
                    <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2"><MousePointer2 className="w-4 h-4"/> 交互灵敏度</h3>
                    <div>
                        <label className="text-xs font-bold text-stone-600 block mb-1">镜头平移速度</label>
                        <input 
                            type="range" min="0.5" max="3" step="0.1" 
                            value={appSettings.cameraPanSensitivity} 
                            onChange={e => setAppSettings({...appSettings, cameraPanSensitivity: parseFloat(e.target.value)})}
                            className="w-full accent-orange-500 h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer" 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-stone-600 block mb-1">镜头缩放速度</label>
                        <input 
                            type="range" min="0.5" max="3" step="0.1" 
                            value={appSettings.cameraZoomSensitivity} 
                            onChange={e => setAppSettings({...appSettings, cameraZoomSensitivity: parseFloat(e.target.value)})}
                            className="w-full accent-orange-500 h-1.5 bg-stone-200 rounded-full appearance-none cursor-pointer" 
                        />
                    </div>
                </div>

                {/* System Actions */}
                <div className="pt-4 border-t border-stone-100">
                    <button 
                        onClick={onReturnToMain}
                        className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4"/> 返回主菜单
                    </button>
                </div>

                {/* Developer Cheats */}
                <div className="mt-2 p-4 border-2 border-dashed border-red-200 bg-red-50/50 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-2"><Zap className="w-3 h-3"/> 开发者选项 (Cheats)</h3>
                    <button 
                        onClick={onDevTimeJump}
                        className="w-full py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <FastForward className="w-3 h-3"/> 跳转至 2027.6.30 (招生季)
                    </button>
                    <button 
                        onClick={onDevMaxRank}
                        className="w-full py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Medal className="w-3 h-3"/> 一键满级 (985/Mega)
                    </button>
                </div>

                <button onClick={onClose} className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg">
                    完成
                </button>
            </div>
        </div>
    );
};
