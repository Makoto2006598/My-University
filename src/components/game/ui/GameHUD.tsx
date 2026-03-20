
import React from 'react';
import { SidebarTab, BuildingType } from '../../../types';
import { BUILDINGS, VARIANTS } from '../../../data/gameData';
import { formatMoney } from '../../../utils/gameUtils';
import {
    LayoutDashboard, Hammer, GraduationCap, Briefcase, Megaphone, UserPlus, PieChart as PieChartIcon,
    ChevronDown, ChevronUp, Landmark, RotateCw
} from 'lucide-react';

interface GameHUDProps {
    activeSidebarTab: SidebarTab;
    setActiveSidebarTab: (tab: SidebarTab) => void;
    isMenuExpanded: boolean;
    setIsMenuExpanded: (expanded: boolean) => void;
    selectedTool: BuildingType;
    setSelectedTool: (tool: BuildingType) => void;
    selectedVariantIndex: number;
    setSelectedVariantIndex: (index: number) => void;
    is2DMode: boolean;
    onToggle2D: () => void;
    isRotated?: boolean;
    onToggleRotate?: () => void;
}

const TAB_MAP: Record<string, string> = {
    'OVERVIEW': '概况', 'BUILD': '建设', 'ACADEMIC': '教务处', 'HR': '人事处',
    'PUBLICITY': '宣传处', 'ADMISSIONS': '招生处', 'FINANCE': '财务处', 'LIAISON': '联络处'
};

// Building categories for organized selector
const BUILDING_CATEGORIES: { label: string; types: BuildingType[] }[] = [
    { label: '教学', types: [BuildingType.LECTURE_HALL, BuildingType.LABORATORY, BuildingType.LIBRARY] },
    { label: '生活', types: [BuildingType.DORMITORY, BuildingType.CAFETERIA] },
    { label: '设施', types: [BuildingType.SCHOOL_GATE, BuildingType.PARK, BuildingType.FENCE] },
];

export const GameHUD: React.FC<GameHUDProps> = ({
    activeSidebarTab, setActiveSidebarTab,
    isMenuExpanded, setIsMenuExpanded,
    selectedTool, setSelectedTool,
    selectedVariantIndex, setSelectedVariantIndex,
    is2DMode, onToggle2D,
    isRotated, onToggleRotate
}) => {
    const getSelectedCost = (type: BuildingType, variantIdx: number) => {
        const variants = VARIANTS[type];
        if (variants && variants.length > 0) {
            const v = variants[variantIdx] || variants[0];
            return v.cost;
        }
        return BUILDINGS[type].cost;
    };

    return (
        <>
            {/* Building Selector (Floats above Dock when 'BUILD' is active) */}
            {activeSidebarTab === 'BUILD' && isMenuExpanded && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-white/90 backdrop-blur-md border border-orange-200 rounded-2xl p-3 shadow-2xl max-w-[90vw] custom-scrollbar">
                        <div className="flex items-center gap-2 overflow-x-auto">
                            {BUILDING_CATEGORIES.map((cat, catIdx) => (
                                <React.Fragment key={cat.label}>
                                    {catIdx > 0 && <div className="w-px h-12 bg-stone-200 mx-1 shrink-0"></div>}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider writing-mode-vertical rotate-180 mr-0.5" style={{ writingMode: 'vertical-rl' }}>{cat.label}</span>
                                        {cat.types.filter(t => BUILDINGS[t]).map(t => {
                                            const b = BUILDINGS[t];
                                            return (
                                                <div key={t} className="relative group">
                                                    <button
                                                        onClick={() => { setSelectedTool(t); setSelectedVariantIndex(0); }}
                                                        className={`flex flex-col items-center justify-center p-2 min-w-[4.5rem] sm:min-w-[5rem] h-[4rem] sm:h-[4.5rem] rounded-xl border transition-all active:scale-95 ${
                                                            selectedTool === t
                                                                ? 'bg-orange-500 border-orange-400 text-white shadow-lg'
                                                                : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
                                                        }`}
                                                    >
                                                        <div className="text-xl mb-0.5">{b.icon}</div>
                                                        <div className="text-[10px] font-bold leading-none">{b.name}</div>
                                                        <div className={`text-[9px] mt-0.5 font-mono ${selectedTool === t ? 'text-orange-100' : 'text-amber-500'}`}>
                                                            {formatMoney(getSelectedCost(t, selectedTool === t ? selectedVariantIndex : 0))}
                                                        </div>
                                                    </button>
                                                    {/* Variant Selector Popup */}
                                                    {selectedTool === t && VARIANTS[t] && (VARIANTS[t]?.length || 0) > 1 && (
                                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-stone-200 rounded-lg p-1.5 flex flex-col gap-1 shadow-xl min-w-[10rem]">
                                                            {VARIANTS[t]?.map((v, idx) => (
                                                                <button key={v.id} onClick={() => setSelectedVariantIndex(idx)} className={`text-[10px] px-3 py-1.5 rounded whitespace-nowrap flex justify-between items-center gap-3 ${
                                                                    selectedVariantIndex === idx ? 'bg-orange-500 text-white' : 'text-stone-600 hover:bg-orange-50'
                                                                }`}>
                                                                    <span>{v.label}</span>
                                                                    <span className={`font-mono ${selectedVariantIndex === idx ? 'text-orange-100' : 'text-amber-500'}`}>{formatMoney(v.cost)}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </React.Fragment>
                            ))}

                            <div className="w-px h-12 bg-stone-200 mx-1 shrink-0"></div>
                            {/* Road button */}
                            <div className="relative group shrink-0">
                                <button
                                    onClick={() => { setSelectedTool(BuildingType.ROAD); setSelectedVariantIndex(0); }}
                                    className={`flex flex-col items-center justify-center p-2 min-w-[5rem] h-[4.5rem] rounded-xl border transition-all ${
                                        selectedTool === BuildingType.ROAD
                                            ? 'bg-stone-700 border-stone-600 text-white'
                                            : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-orange-50'
                                    }`}
                                >
                                    <div className="text-xl mb-0.5">🚧</div>
                                    <div className="text-[10px] font-bold">道路</div>
                                    <div className={`text-[9px] mt-0.5 font-mono ${selectedTool === BuildingType.ROAD ? 'text-stone-300' : 'text-amber-500'}`}>
                                        {formatMoney(getSelectedCost(BuildingType.ROAD, selectedTool === BuildingType.ROAD ? selectedVariantIndex : 0))}
                                    </div>
                                </button>
                                {selectedTool === BuildingType.ROAD && VARIANTS[BuildingType.ROAD] && (
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-stone-200 rounded-lg p-1.5 flex flex-col gap-1 shadow-xl min-w-[10rem]">
                                        {VARIANTS[BuildingType.ROAD]?.map((v, idx) => (
                                            <button key={v.id} onClick={() => setSelectedVariantIndex(idx)} className={`text-[10px] px-3 py-1.5 rounded whitespace-nowrap flex justify-between items-center gap-3 ${
                                                selectedVariantIndex === idx ? 'bg-stone-700 text-white' : 'text-stone-600 hover:bg-stone-50'
                                            }`}>
                                                <span>{v.label}</span>
                                                <span className={`font-mono ${selectedVariantIndex === idx ? 'text-stone-300' : 'text-amber-500'}`}>{formatMoney(v.cost)}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        {/* Rotate button for touch users */}
                        {onToggleRotate && selectedTool !== BuildingType.NONE && selectedTool !== BuildingType.ROAD && (
                            <button
                                onClick={onToggleRotate}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border transition-all min-h-[36px] ${
                                    isRotated ? 'bg-orange-500 text-white border-orange-400' : 'bg-white/80 text-stone-600 border-stone-200 hover:bg-orange-50'
                                }`}
                            >
                                <RotateCw className="w-3.5 h-3.5" /> 旋转
                            </button>
                        )}
                        <div className="text-[10px] text-stone-600 bg-white/80 px-3 py-1 rounded-full backdrop-blur shadow-sm border border-stone-200 hidden sm:block">
                            按 <span className="font-bold text-orange-600">Q / E</span> 旋转建筑 | <span className="font-bold text-red-500">右键</span> 拆除
                        </div>
                        <div className="text-[10px] text-stone-600 bg-white/80 px-3 py-1 rounded-full backdrop-blur shadow-sm border border-stone-200 sm:hidden">
                            点击放置 | <span className="font-bold text-red-500">长按</span> 拆除
                        </div>
                    </div>
                </div>
            )}

            {/* BOTTOM DOCK */}
            <div className={`absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 max-w-[95vw] ${isMenuExpanded ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl px-2 sm:px-4 py-2 sm:py-3 shadow-2xl flex items-center gap-1 sm:gap-2 ring-1 ring-black/5 overflow-x-auto">
                    {(Object.keys(TAB_MAP) as SidebarTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                if (activeSidebarTab === tab) {
                                    setActiveSidebarTab(null);
                                    setSelectedTool(BuildingType.NONE);
                                } else {
                                    setActiveSidebarTab(tab as SidebarTab);
                                    if (tab !== 'BUILD') {
                                        setSelectedTool(BuildingType.NONE);
                                    }
                                }
                            }}
                            className={`relative group p-2.5 sm:p-3 rounded-xl transition-all duration-200 hover:-translate-y-2 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 ${activeSidebarTab === tab ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-stone-400 hover:bg-orange-50 hover:text-orange-500'}`}
                        >
                            {tab === 'OVERVIEW' ? <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6"/> :
                            tab === 'BUILD' ? <Hammer className="w-5 h-5 sm:w-6 sm:h-6"/> :
                            tab === 'ACADEMIC' ? <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6"/> :
                            tab === 'HR' ? <Briefcase className="w-5 h-5 sm:w-6 sm:h-6"/> :
                            tab === 'PUBLICITY' ? <Megaphone className="w-5 h-5 sm:w-6 sm:h-6"/> :
                            tab === 'ADMISSIONS' ? <UserPlus className="w-5 h-5 sm:w-6 sm:h-6"/> :
                            tab === 'FINANCE' ? <PieChartIcon className="w-5 h-5 sm:w-6 sm:h-6"/> :
                            <Landmark className="w-5 h-5 sm:w-6 sm:h-6"/>}
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-stone-600 shadow-md hidden sm:block">
                                {TAB_MAP[tab!]}
                            </span>
                            {activeSidebarTab === tab && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2D/3D Toggle Button */}
            <button
                onClick={onToggle2D}
                className="absolute bottom-20 right-2 sm:right-4 z-50 w-11 h-11 sm:w-12 sm:h-12 bg-white/80 backdrop-blur border border-stone-200 rounded-full text-stone-600 hover:text-orange-600 hover:bg-orange-50 active:bg-orange-100 transition-colors shadow-lg flex items-center justify-center font-black text-xs group"
                title="切换视图模式"
            >
                {is2DMode ? "3D" : "2D"}
                <div className="absolute right-full mr-2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden sm:block">
                    切换视图
                </div>
            </button>

            {/* Toggle Dock Button */}
            <button
                onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-50 p-2.5 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/80 backdrop-blur border border-stone-200 rounded-full text-stone-400 hover:text-orange-500 hover:bg-orange-50 active:bg-orange-100 transition-colors shadow-lg"
            >
                {isMenuExpanded ? <ChevronDown className="w-5 h-5"/> : <ChevronUp className="w-5 h-5"/>}
            </button>
        </>
    );
}
