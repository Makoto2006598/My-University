
import React from 'react';
import { GameState } from '../../../types';
import { SaveManager } from '../../../utils/saveManager';
import { formatMoney } from '../../../utils/gameUtils';
import { 
    HardDrive, X, Zap, Save, FileText, Upload, Download 
} from 'lucide-react';

interface SaveLoadModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSlot: number | null;
    gameState: GameState;
    onQuickSave: () => void;
    onSaveToSlot: (slot: number) => void;
    onLoadSlot: (slot: number) => void;
    refreshKey: number; // Used to trigger re-renders when saves change
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
    isOpen,
    onClose,
    currentSlot,
    gameState,
    onQuickSave,
    onSaveToSlot,
    onLoadSlot,
    refreshKey // Passed to ensure the component updates when SaveManager content changes
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                    <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
                        <HardDrive className="w-6 h-6 text-orange-500"/> 存档管理
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-600"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                    {/* Quick Actions */}
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-lg shadow-sm text-orange-500"><Zap className="w-6 h-6"/></div>
                            <div>
                                <div className="font-bold text-stone-800">当前会话</div>
                                <div className="text-xs text-stone-500">存档位: {currentSlot ? `Slot ${currentSlot}` : '临时 (未保存)'} | 天数: {gameState.day}</div>
                            </div>
                        </div>
                        <button 
                            onClick={onQuickSave}
                            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all"
                        >
                            <Save className="w-4 h-4"/> 快速保存
                        </button>
                    </div>

                    {/* Save Slots */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4"/> 存档列表</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {[1, 2, 3].map(slot => {
                                const info = SaveManager.getSlotInfo(slot);
                                const isCurrent = currentSlot === slot;
                                return (
                                    <div key={slot} className={`border rounded-xl p-4 flex items-center justify-between transition-all ${isCurrent ? 'border-orange-300 bg-orange-50/30' : 'border-stone-200 hover:border-stone-300 bg-white'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center font-bold text-stone-400 text-lg">{slot}</div>
                                            {info ? (
                                                <div>
                                                    <div className="font-bold text-stone-800 text-lg flex items-center gap-2">
                                                        {info.name} 
                                                        {isCurrent && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 rounded-full">当前</span>}
                                                    </div>
                                                    <div className="text-xs text-stone-500 flex gap-3 mt-1">
                                                        <span>第 {info.day} 天</span>
                                                        <span className="font-mono text-emerald-600">{formatMoney(info.money)}</span>
                                                        <span>{info.universityLabel}</span>
                                                        <span className="text-stone-300">|</span>
                                                        <span>{new Date(info.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-stone-400 italic">空存档位</div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => onSaveToSlot(slot)} 
                                                className="px-4 py-2 bg-white border border-stone-200 hover:border-orange-300 hover:text-orange-600 text-stone-600 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
                                            >
                                                <Upload className="w-4 h-4"/> 保存
                                            </button>
                                            {info && (
                                                <button 
                                                    onClick={() => onLoadSlot(slot)} 
                                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                                                >
                                                    <Download className="w-4 h-4"/> 读取
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
