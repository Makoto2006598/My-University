
import React, { useState } from 'react';
import { GameState, CollegeType, FacultyTitle, Faculty, UniversityRank } from '../../../types';
import { COLLEGES_DEF, MAJORS_DEF } from '../../../data/gameData';

const RANK_ORDER: UniversityRank[] = [
    UniversityRank.STARTUP, UniversityRank.TIER_3, UniversityRank.TIER_2,
    UniversityRank.TIER_1, UniversityRank.PROJECT_211, UniversityRank.PROJECT_985
];
const meetsRank = (current: UniversityRank, required?: UniversityRank) => {
    if (!required) return true;
    return RANK_ORDER.indexOf(current) >= RANK_ORDER.indexOf(required);
};
import { getDeanManagementAbility } from '../../../utils/gameUtils';
import { BookOpen, GraduationCap, Medal, UserPlus, AlertCircle, Check, Lock, ChevronRight, Hammer, Settings, Users, School } from 'lucide-react';

interface AcademicPanelProps {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    onAssignDean: (collegeId: string, role: 'DEAN' | 'VICE_DEAN') => void;
}

type SubTab = 'CONSTRUCTION' | 'COLLEGES' | 'FACULTY' | 'STUDENTS';

export const AcademicPanel: React.FC<AcademicPanelProps> = ({ gameState, setGameState, onAssignDean }) => {
    const [subTab, setSubTab] = useState<SubTab>('CONSTRUCTION');

    const handleCreateCollege = (type: CollegeType) => {
        const def = COLLEGES_DEF[type];
        if (def.requiredRank && !meetsRank(gameState.rank, def.requiredRank)) {
            alert(`设立 ${def.name} 需要大学等级达到 ${def.requiredRank}！`);
            return;
        }
        if (def.dependency && !gameState.colleges.find(c => c.type === def.dependency)) {
            alert(`设立 ${def.name} 需要先设立 ${COLLEGES_DEF[def.dependency].name}！`);
            return;
        }
        const newCollege = { 
            id: Math.random().toString(36).substring(2), 
            type, 
            activeMajors: [], 
            foundingDay: gameState.day, 
            assignedBuildingIds: [] 
        };
        setGameState(prev => ({
            ...prev,
            colleges: [...prev.colleges, newCollege],
            money: prev.money - 500000 
        }));
    };

    const handleOpenMajor = (collegeId: string, majorId: string) => {
        setGameState(prev => ({
            ...prev,
            colleges: prev.colleges.map(c => 
                c.id === collegeId 
                ? { ...c, activeMajors: [...c.activeMajors, majorId] }
                : c
            )
        }));
    };

    return (
        <div className="flex flex-col h-full bg-orange-50/50 overflow-hidden">
            {/* Sub-menu Header */}
            <div className="bg-white border-b border-orange-100 p-4">
                <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-500"/> 教务处
                    </h2>
                    <div className="flex bg-stone-50 rounded-lg p-1 border border-stone-200">
                        <button onClick={() => setSubTab('CONSTRUCTION')} className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${subTab === 'CONSTRUCTION' ? 'bg-white text-stone-800 shadow' : 'text-stone-500 hover:text-stone-700'}`}>
                            <Hammer className="w-4 h-4"/> 学院建设
                        </button>
                        <button onClick={() => setSubTab('COLLEGES')} className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${subTab === 'COLLEGES' ? 'bg-white text-stone-800 shadow' : 'text-stone-500 hover:text-stone-700'}`}>
                            <School className="w-4 h-4"/> 学院管理
                        </button>
                        <button onClick={() => setSubTab('FACULTY')} className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${subTab === 'FACULTY' ? 'bg-white text-stone-800 shadow' : 'text-stone-500 hover:text-stone-700'}`}>
                            <UserPlus className="w-4 h-4"/> 教务管理
                        </button>
                        <button onClick={() => setSubTab('STUDENTS')} className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${subTab === 'STUDENTS' ? 'bg-white text-stone-800 shadow' : 'text-stone-500 hover:text-stone-700'}`}>
                            <Users className="w-4 h-4"/> 学生名册
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="max-w-5xl mx-auto w-full">
                    
                    {/* TAB: CONSTRUCTION */}
                    {subTab === 'CONSTRUCTION' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-sm font-bold text-stone-500 mb-4 uppercase">筹建新学院</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(Object.values(COLLEGES_DEF) as any[]).map((def: any) => {
                                    const exists = gameState.colleges.find(c => c.type === def.type);
                                    const depLocked = def.dependency && !gameState.colleges.find(c => c.type === def.dependency);
                                    const rankLocked = def.requiredRank && !meetsRank(gameState.rank, def.requiredRank);
                                    const isLocked = depLocked || rankLocked;

                                    if (exists) return null;

                                    return (
                                        <button
                                            key={def.type}
                                            onClick={() => !isLocked && handleCreateCollege(def.type)}
                                            disabled={isLocked}
                                            className={`p-4 rounded-xl border text-left transition-all relative group h-36 flex flex-col justify-between ${
                                                isLocked
                                                ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                                                : 'bg-white border-orange-100 text-stone-600 hover:bg-orange-50 hover:border-indigo-400 hover:text-indigo-900 shadow-sm hover:shadow-md'
                                            }`}
                                        >
                                            <div>
                                                <div className="text-lg font-bold mb-1 flex justify-between">
                                                    {def.name}
                                                    {isLocked && <Lock className="w-4 h-4 text-stone-400"/>}
                                                </div>
                                                <div className="text-xs opacity-70 leading-tight">{def.description}</div>
                                            </div>
                                            <div className="space-y-1">
                                                {rankLocked && (
                                                    <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block w-max border border-amber-200">
                                                        需要等级: {def.requiredRank}
                                                    </div>
                                                )}
                                                {depLocked && (
                                                    <div className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded inline-block w-max">
                                                        前置需求: {COLLEGES_DEF[def.dependency as CollegeType].name}
                                                    </div>
                                                )}
                                                {!isLocked && (
                                                    <div className="text-xs text-emerald-600 font-mono self-end">费用: 500K</div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                                {Object.keys(COLLEGES_DEF).length === gameState.colleges.length && (
                                    <div className="col-span-full py-12 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl">
                                        <Check className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                                        <p>所有学院均已建设完毕！</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: COLLEGES */}
                    {subTab === 'COLLEGES' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            {gameState.colleges.length === 0 ? (
                                <div className="py-12 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl">
                                    <Hammer className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                                    <p>暂无学院，请前往“学院建设”页面筹建。</p>
                                </div>
                            ) : (
                                gameState.colleges.map(college => {
                                    const def = COLLEGES_DEF[college.type];
                                    const availableMajors = MAJORS_DEF.filter(m => m.collegeType === college.type);
                                    const studentCount = gameState.studentList.filter(s => s.college === college.type).length;

                                    return (
                                        <div key={college.id} className="bg-white border border-orange-100 rounded-xl overflow-hidden shadow-md">
                                            <div className="p-4 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-sm ${
                                                        def.category === 'BASE' ? 'bg-emerald-100 text-emerald-600' :
                                                        def.category === 'NEW_ENG' ? 'bg-indigo-100 text-indigo-600' : 
                                                        def.category === 'TRAD_ENG' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                                                    }`}>
                                                        <GraduationCap className="w-6 h-6"/>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-stone-800 text-lg">{def.name}</h3>
                                                        <div className="text-[10px] text-stone-500 flex gap-2">
                                                            <span>成立: 第 {college.foundingDay} 天</span>
                                                            <span>•</span>
                                                            <span>在读学生: <span className="text-stone-800 font-mono">{studentCount}</span></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Majors Grid */}
                                            <div className="p-4 bg-white">
                                                <div className="text-[10px] font-bold text-stone-400 uppercase mb-2 tracking-wider">专业建设 ({college.activeMajors.length}/{availableMajors.length})</div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {availableMajors.map(major => {
                                                        const isActive = college.activeMajors.includes(major.id);
                                                        return (
                                                            <button
                                                                key={major.id}
                                                                onClick={() => !isActive && handleOpenMajor(college.id, major.id)}
                                                                disabled={isActive}
                                                                className={`px-3 py-2 rounded border text-xs text-left transition-all flex items-center justify-between ${
                                                                    isActive 
                                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                                                    : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800'
                                                                }`}
                                                            >
                                                                <span>{major.name}</span>
                                                                {isActive ? <Check className="w-3 h-3"/> : <Lock className="w-3 h-3 opacity-50"/>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* TAB: FACULTY (Administrative) */}
                    {subTab === 'FACULTY' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 mb-6 flex items-start gap-2">
                                <Medal className="w-4 h-4 mt-0.5 shrink-0"/>
                                <div>
                                    <p className="font-bold mb-1">行政任命说明</p>
                                    <p className="opacity-80">院长的行政能力将直接影响该学院的科研产出效率与学生满意度。请任命行政能力较高（&gt;80）的教授或院士担任。</p>
                                </div>
                            </div>

                            {gameState.colleges.length === 0 ? (
                                <div className="text-center text-stone-400 py-8">无可用学院</div>
                            ) : (
                                gameState.colleges.map(college => {
                                    const def = COLLEGES_DEF[college.type];
                                    const dean = gameState.faculty.find(f => f.id === college.deanId);
                                    const viceDean = gameState.faculty.find(f => f.id === college.viceDeanId);

                                    return (
                                        <div key={college.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3 w-1/3">
                                                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400">
                                                    <School className="w-5 h-5"/>
                                                </div>
                                                <div className="font-bold text-stone-800">{def.name}</div>
                                            </div>
                                            
                                            <div className="flex gap-6 w-2/3 justify-end">
                                                <div className="flex-1 max-w-[200px]">
                                                    <div className="text-[10px] text-stone-500 mb-1">院长 (Dean)</div>
                                                    <button onClick={() => onAssignDean(college.id, 'DEAN')} className={`w-full p-2 rounded border text-left text-sm flex items-center gap-2 ${dean ? 'bg-orange-50 border-orange-200 text-stone-800' : 'bg-white border-stone-200 border-dashed text-stone-400 hover:border-stone-400'}`}>
                                                        {dean ? (
                                                            <>
                                                                <img src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${dean.id}`} className="w-5 h-5 rounded-full bg-stone-200"/>
                                                                <span className="truncate">{dean.name}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserPlus className="w-4 h-4"/> <span>任命</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="flex-1 max-w-[200px]">
                                                    <div className="text-[10px] text-stone-500 mb-1">副院长 (Vice Dean)</div>
                                                    <button onClick={() => onAssignDean(college.id, 'VICE_DEAN')} className={`w-full p-2 rounded border text-left text-sm flex items-center gap-2 ${viceDean ? 'bg-orange-50 border-orange-200 text-stone-800' : 'bg-white border-stone-200 border-dashed text-stone-400 hover:border-stone-400'}`}>
                                                        {viceDean ? (
                                                            <>
                                                                <img src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${viceDean.id}`} className="w-5 h-5 rounded-full bg-stone-200"/>
                                                                <span className="truncate">{viceDean.name}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserPlus className="w-4 h-4"/> <span>任命</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* TAB: STUDENTS */}
                    {subTab === 'STUDENTS' && (
                        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 shadow-sm">
                            <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 font-bold text-sm text-stone-700 flex justify-between">
                                <span>在校生名册</span>
                                <span className="font-mono text-emerald-600">总计: {gameState.studentList.length} 人</span>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-stone-100 text-stone-500 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-2">姓名</th>
                                            <th className="px-4 py-2">性别</th>
                                            <th className="px-4 py-2">所属学院</th>
                                            <th className="px-4 py-2">高考分数</th>
                                            <th className="px-4 py-2">天赋</th>
                                            <th className="px-4 py-2">评价标签</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {gameState.studentList.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center text-stone-400">
                                                    暂无在校生，请等待开学季。
                                                </td>
                                            </tr>
                                        ) : (
                                            gameState.studentList.slice(0, 100).map(s => ( // Limit rendering for performance
                                                <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                                                    <td className="px-4 py-2 font-medium text-stone-700">{s.name}</td>
                                                    <td className="px-4 py-2 text-stone-500">{s.gender}</td>
                                                    <td className="px-4 py-2 text-stone-500">{COLLEGES_DEF[s.college]?.name || s.college}</td>
                                                    <td className="px-4 py-2 font-mono text-emerald-600">{s.gaokaoScore}</td>
                                                    <td className="px-4 py-2 font-mono text-blue-500">{s.talent}</td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {s.tags.slice(0, 2).map((t, i) => (
                                                                <span key={i} className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 text-[9px]">{t}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        {gameState.studentList.length > 100 && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-2 text-center text-stone-400 text-[10px] italic">
                                                    仅显示前 100 名学生...
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
