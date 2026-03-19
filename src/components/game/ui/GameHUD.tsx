
import React from 'react';
import { SidebarTab, BuildingType } from '../../../types';
import { BUILDINGS, VARIANTS } from '../../../data/gameData';
import { 
    LayoutDashboard, Hammer, GraduationCap, Briefcase, Megaphone, UserPlus, PieChart as PieChartIcon, 
    ChevronDown, ChevronUp, Landmark
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
}

const TAB_MAP: Record<string, string> = { 
    'OVERVIEW': '概况', 'BUILD': '建设', 'ACADEMIC': '教务处', 'HR': '人事处', 
    'PUBLICITY': '宣传处', 'ADMISSIONS': '招生处', 'FINANCE': '财务处', 'LIAISON': '联络处' 
};

export const GameHUD: React.FC<GameHUDProps> = ({
    activeSidebarTab, setActiveSidebarTab,
    isMenuExpanded, setIsMenuExpanded,
    selectedTool, setSelectedTool,
    selectedVariantIndex, setSelectedVariantIndex,
    is2DMode, onToggle2D
}) => {
    return (
        <>
            {/* Building Selector (Floats above Dock when 'BUILD' is active) */}
            {activeSidebarTab === 'BUILD' && isMenuExpanded && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-white/90 backdrop-blur-md border border-orange-200 rounded-2xl p-3 shadow-2xl flex items-center gap-2 overflow-x-auto max-w-[90vw] custom-scrollbar">
                        {Object.values(BUILDINGS).filter(b => b.type !== BuildingType.NONE && b.type !== BuildingType.CITY_ROAD && b.type !== BuildingType.SCHOOL_GATE).map(b => (
                            <div key={b.type} className="relative group">
                                <button 
                                    onClick={() => { setSelectedTool(b.type); setSelectedVariantIndex(0); }} 
                                    className={`flex flex-col items-center justify-center p-2 min-w-[4.5rem] h-16 rounded-xl border transition-all ${selectedTool === b.type ? 'bg-orange-500 border-orange-400 text-white shadow-lg' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'}`}
                                >
                                    <div className="text-xl mb-1">{b.icon}</div>
                                    <div className="text-[10px] font-bold leading-none">{b.name}</div>
                                </button>
                                {/* Variant Selector Popup (if selected) */}
                                {selectedTool === b.type && VARIANTS[b.type] && (VARIANTS[b.type]?.length || 0) > 1 && (
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-stone-200 rounded-lg p-1 flex flex-col gap-1 shadow-xl">
                                        {VARIANTS[b.type]?.map((v, idx) => (
                                            <button key={v.id} onClick={() => setSelectedVariantIndex(idx)} className={`text-[10px] px-2 py-1 rounded whitespace-nowrap ${selectedVariantIndex === idx ? 'bg-orange-500 text-white' : 'text-stone-600 hover:bg-orange-50'}`}>
                                                {v.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="w-px h-10 bg-stone-200 mx-1"></div>
                        <button onClick={() => { setSelectedTool(BuildingType.ROAD); setSelectedVariantIndex(0); }} className={`flex flex-col items-center justify-center p-2 min-w-[4.5rem] h-16 rounded-xl border transition-all ${selectedTool === BuildingType.ROAD ? 'bg-stone-700 border-stone-600 text-white' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-orange-50'}`}><div className="text-xl mb-1">🚧</div><div className="text-[10px] font-bold">道路</div></button>
                    </div>
                    <div className="text-[10px] text-stone-600 bg-white/80 px-3 py-1 rounded-full mt-2 backdrop-blur shadow-sm border border-stone-200">
                        按 <span className="font-bold text-orange-600">Q / E</span> 旋转建筑
                    </div>
                </div>
            )}

            {/* BOTTOM DOCK */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${isMenuExpanded ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-2 ring-1 ring-black/5">
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
                            className={`relative group p-3 rounded-xl transition-all duration-200 hover:-translate-y-2 hover:scale-110 ${activeSidebarTab === tab ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-stone-400 hover:bg-orange-50 hover:text-orange-500'}`}
                        >
                            {tab === 'OVERVIEW' ? <LayoutDashboard className="w-6 h-6"/> : 
                            tab === 'BUILD' ? <Hammer className="w-6 h-6"/> : 
                            tab === 'ACADEMIC' ? <GraduationCap className="w-6 h-6"/> : 
                            tab === 'HR' ? <Briefcase className="w-6 h-6"/> : 
                            tab === 'PUBLICITY' ? <Megaphone className="w-6 h-6"/> : 
                            tab === 'ADMISSIONS' ? <UserPlus className="w-6 h-6"/> : 
                            tab === 'FINANCE' ? <PieChartIcon className="w-6 h-6"/> :
                            <Landmark className="w-6 h-6"/>}
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-stone-600 shadow-md">
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
                className="absolute bottom-20 right-4 z-50 w-12 h-12 bg-white/80 backdrop-blur border border-stone-200 rounded-full text-stone-600 hover:text-orange-600 hover:bg-orange-50 transition-colors shadow-lg flex items-center justify-center font-black text-xs group"
                title="切换视图模式"
            >
                {is2DMode ? "3D" : "2D"}
                <div className="absolute right-full mr-2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    切换视图
                </div>
            </button>

            {/* Toggle Dock Button */}
            <button 
                onClick={() => setIsMenuExpanded(!isMenuExpanded)} 
                className="absolute bottom-4 right-4 z-50 p-3 bg-white/80 backdrop-blur border border-stone-200 rounded-full text-stone-400 hover:text-orange-500 hover:bg-orange-50 transition-colors shadow-lg"
            >
                {isMenuExpanded ? <ChevronDown className="w-5 h-5"/> : <ChevronUp className="w-5 h-5"/>}
            </button>
        </>
    );
}
