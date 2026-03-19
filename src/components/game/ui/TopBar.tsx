
import React from 'react';
import { GameState, GameSettings } from '../../../types';
import { formatMoney } from '../../../utils/gameUtils';
import { 
    Edit3, DollarSign, Smile, Users, Briefcase, 
    Pause, Play, FastForward, Zap, Save, Settings 
} from 'lucide-react';

interface TopBarProps {
    gameState: GameState;
    currentStats: any;
    gameDate: any;
    gameSpeed: number;
    appSettings: GameSettings;
    onRenameUniversity: () => void;
    onSpeedChange: (speed: number) => void;
    onOpenSave: () => void;
    onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    gameState,
    currentStats,
    gameDate,
    gameSpeed,
    appSettings,
    onRenameUniversity,
    onSpeedChange,
    onOpenSave,
    onOpenSettings
}) => {
    return (
        <div className="h-16 bg-white/80 backdrop-blur border-b border-orange-100 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-6">
                <div className="flex flex-col group relative">
                    <span className="text-lg font-bold text-stone-800 leading-none flex items-center gap-2 cursor-pointer hover:text-orange-600 transition-colors" onClick={onRenameUniversity}>
                        {gameState.universityName} <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"/>
                    </span>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider">{gameState.universityLabel} | {gameState.rank}</span>
                </div>
                <div className="h-8 w-px bg-stone-200"></div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-amber-600" title="资金">
                        <div className="bg-amber-100 p-1 rounded-md"><DollarSign className="w-4 h-4"/></div>
                        <span className="font-mono font-bold text-lg">{formatMoney(gameState.money)}</span>
                    </div>
                    <div className={`text-[10px] font-mono pl-1 ${currentStats.netIncome >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {currentStats.netIncome >= 0 ? '+' : ''}{formatMoney(currentStats.netIncome)} / 日
                    </div>
                </div>
                <div className="flex gap-4 ml-2">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold"><Smile className="w-3 h-3"/> {Math.round(gameState.happiness)}</div>
                        <div className="text-[9px] text-stone-400">综合满意度</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-blue-600 text-xs font-bold"><Users className="w-3 h-3"/> {Math.round(currentStats.studentSatisfaction)}</div>
                        <div className="text-[9px] text-stone-400">学生满意度</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-indigo-600 text-xs font-bold"><Briefcase className="w-3 h-3"/> {Math.round(currentStats.facultySatisfaction)}</div>
                        <div className="text-[9px] text-stone-400">教工满意度</div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex bg-stone-100 rounded-lg p-1 border border-stone-200">
                    {[0, 1, 5, 10].map(s => <button key={s} onClick={() => onSpeedChange(s)} className={`p-1.5 rounded ${gameSpeed === s ? 'bg-orange-500 text-white shadow' : 'text-stone-400 hover:text-stone-600'}`}>{s === 0 ? <Pause className="w-4 h-4"/> : s === 1 ? <Play className="w-4 h-4"/> : s === 5 ? <FastForward className="w-4 h-4"/> : <Zap className="w-4 h-4"/>}</button>)}
                </div>
                <div className="text-right">
                    <div className="text-xs text-orange-500 font-bold">{currentStats.isPrepPeriod ? '建校筹备期' : gameDate.semesterString}</div>
                    <div className="text-sm font-bold text-stone-700 font-mono flex items-center justify-end gap-1"><gameDate.SeasonIcon className="w-3 h-3"/> {gameDate.dateString}</div>
                </div>
                <button onClick={onOpenSave} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600"><Save className="w-5 h-5"/></button>
                <button onClick={onOpenSettings} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-600"><Settings className="w-5 h-5"/></button>
            </div>
        </div>
    );
};
