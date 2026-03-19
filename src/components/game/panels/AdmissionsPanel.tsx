
import React, { useState, useEffect } from 'react';
import { GameState, Student, AdmissionsPhase, CollegeType } from '../../../types';
import { UserPlus, Users, Trophy, Target, Calendar, Lock, AlertTriangle, CheckCircle, Sliders } from 'lucide-react';
import { COLLEGES_DEF } from '../../../data/gameData';

interface AdmissionsPanelProps {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    onOpenPlanner: () => void;
}

export const AdmissionsPanel: React.FC<AdmissionsPanelProps> = ({ gameState, setGameState, onOpenPlanner }) => {
    const isPrepPhase = gameState.admissionsPhase === AdmissionsPhase.PREP;
    const isRecruiting = gameState.admissionsPhase === AdmissionsPhase.RECRUITING;
    const isIdle = gameState.admissionsPhase === AdmissionsPhase.IDLE;
    const hasColleges = gameState.colleges.length > 0;

    // Prep State
    const [totalTarget, setTotalTarget] = useState(gameState.admissionPolicy.totalTarget || 200);
    const [minScore, setMinScore] = useState(gameState.admissionPolicy.minScore || 500);
    const [collegeAllocations, setCollegeAllocations] = useState<Record<string, number>>({});

    useEffect(() => {
        // Init allocations if empty
        if (Object.keys(collegeAllocations).length === 0 && hasColleges) {
            const initial: Record<string, number> = {};
            const avg = Math.floor(100 / gameState.colleges.length);
            gameState.colleges.forEach((c, i) => {
                initial[c.type] = i === gameState.colleges.length - 1 ? 100 - (avg * i) : avg; // Ensure 100%
            });
            setCollegeAllocations(initial);
        }
    }, [gameState.colleges.length]);

    const handleAllocationChange = (type: string, val: number) => {
        const newVal = Math.max(0, Math.min(100, val));
        setCollegeAllocations(prev => ({ ...prev, [type]: newVal }));
    };

    const totalAllocation = Object.values(collegeAllocations).reduce((a: number, b: number) => a + b, 0);

    const savePolicy = () => {
        if (totalAllocation !== 100) {
            alert(`各学院分配比例总和必须为 100% (当前: ${totalAllocation}%)`);
            return;
        }
        setGameState(prev => ({
            ...prev,
            admissionPolicy: {
                totalTarget,
                minScore,
                collegeTargets: collegeAllocations,
                lastPlanUpdateYear: prev.day // Update timestamp
            }
        }));
        alert("招生计划已保存。");
    };

    if (isIdle && gameState.rank === '初创大学' && gameState.students === 0) {
         // Probably before 2027
         return (
             <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-orange-50">
                 <Calendar className="w-16 h-16 text-stone-300 mb-4"/>
                 <h2 className="text-xl font-bold text-stone-500">尚未进入招生季</h2>
                 <p className="text-stone-400 mt-2 max-w-md">首届招生工作将于 2027年7月1日 正式启动。请先专注于校园基础设施建设与教职工招聘。</p>
             </div>
         );
    }

    return (
        <div className="flex flex-col h-full bg-orange-50 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-orange-100 bg-white/50 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-emerald-600"/> 招生办
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isPrepPhase ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : isRecruiting ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>
                            {isPrepPhase ? '招生筹备期 (7.1 - 7.15)' : isRecruiting ? '正式录取期 (7.15 - 8.5)' : '休整期'}
                        </span>
                    </div>
                </div>
                {isPrepPhase && (
                     <button onClick={savePolicy} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm shadow-lg flex items-center gap-2">
                         <CheckCircle className="w-4 h-4"/> 保存计划
                     </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {/* PREP SYSTEM */}
                <div className={`rounded-xl border p-6 transition-all ${isPrepPhase ? 'bg-white border-indigo-200 shadow-md shadow-indigo-100' : 'bg-white/50 border-stone-200 opacity-80'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-indigo-500"/> 年度招生计划
                        </h3>
                        {!isPrepPhase && <Lock className="w-5 h-5 text-stone-400"/>}
                    </div>

                    {!hasColleges ? (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-3 text-red-600">
                            <AlertTriangle className="w-6 h-6 shrink-0"/>
                            <div className="text-sm font-bold">无法制定计划：校内暂无任何学院。请先前往【教务处】建设学院。</div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Total Target */}
                            <div>
                                <div className="flex justify-between text-sm text-stone-500 mb-2">
                                    <span>总招生名额</span>
                                    <span className="text-stone-800 font-mono font-bold text-lg">{totalTarget} 人</span>
                                </div>
                                <input 
                                    type="range" min="50" max="2000" step="10" 
                                    value={totalTarget} 
                                    onChange={e => isPrepPhase && setTotalTarget(parseInt(e.target.value))}
                                    disabled={!isPrepPhase}
                                    className={`w-full h-2 rounded-full appearance-none ${isPrepPhase ? 'bg-stone-200 accent-indigo-500 cursor-pointer' : 'bg-stone-200 cursor-not-allowed'}`}
                                />
                                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                                    <span>最小: 50</span>
                                    <span>最大容量限制: {gameState.studentCap}</span>
                                </div>
                            </div>

                            {/* Score Cutoff */}
                            <div>
                                <div className="flex justify-between text-sm text-stone-500 mb-2">
                                    <span>最低录取分数线 (Min Score)</span>
                                    <span className="text-stone-800 font-mono font-bold text-lg">{minScore} 分</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" min="200" max="700" step="5" 
                                        value={minScore} 
                                        onChange={e => isPrepPhase && setMinScore(parseInt(e.target.value))}
                                        disabled={!isPrepPhase}
                                        className={`flex-1 h-2 rounded-full appearance-none ${isPrepPhase ? 'bg-stone-200 accent-rose-500 cursor-pointer' : 'bg-stone-200 cursor-not-allowed'}`}
                                    />
                                    <div className={`px-3 py-1 rounded text-xs font-bold ${minScore > 600 ? 'bg-rose-100 text-rose-600' : minScore > 500 ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'}`}>
                                        {minScore > 600 ? '精英生源' : minScore > 500 ? '优质生源' : '普通生源'}
                                    </div>
                                </div>
                                <p className="text-[10px] text-stone-400 mt-2">
                                    分数线越高，生源质量越好（天赋、努力值更高），但可能导致招不满人。
                                </p>
                            </div>

                            {/* College Allocation */}
                            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-stone-600">各学院分配比例</span>
                                    <span className={`text-xs font-mono font-bold ${totalAllocation === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        Total: {totalAllocation}%
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {gameState.colleges.map(c => (
                                        <div key={c.id} className="flex items-center gap-3">
                                            <div className="w-24 text-xs text-stone-500 truncate" title={COLLEGES_DEF[c.type].name}>{COLLEGES_DEF[c.type].name}</div>
                                            <input 
                                                type="range" min="0" max="100" step="5"
                                                value={collegeAllocations[c.type] || 0}
                                                onChange={e => isPrepPhase && handleAllocationChange(c.type, parseInt(e.target.value))}
                                                disabled={!isPrepPhase}
                                                className={`flex-1 h-1.5 rounded-full appearance-none ${isPrepPhase ? 'bg-stone-200 accent-blue-500 cursor-pointer' : 'bg-stone-200 cursor-not-allowed'}`}
                                            />
                                            <div className="w-12 text-right font-mono text-xs text-stone-800">
                                                {collegeAllocations[c.type] || 0}%
                                            </div>
                                            <div className="w-16 text-right font-mono text-[10px] text-stone-400">
                                                ≈ {Math.floor(totalTarget * ((collegeAllocations[c.type] || 0)/100))} 人
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* STATUS & LIST */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm">
                        <div className="text-stone-400 text-xs uppercase mb-1">已录取 (待入学)</div>
                        <div className="text-3xl font-bold text-emerald-600 font-mono">{gameState.incomingStudents.length} <span className="text-sm text-stone-400 font-normal">/ {gameState.admissionPolicy.totalTarget}</span></div>
                        <div className="mt-2 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(100, (gameState.incomingStudents.length / (gameState.admissionPolicy.totalTarget || 1)) * 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm">
                        <div className="text-stone-400 text-xs uppercase mb-1">生源平均分</div>
                        <div className="text-3xl font-bold text-blue-500 font-mono">
                            {gameState.incomingStudents.length > 0 
                                ? Math.round(gameState.incomingStudents.reduce((a,b) => a + b.gaokaoScore, 0) / gameState.incomingStudents.length) 
                                : '-'}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden flex-1 min-h-[300px] shadow-sm">
                    <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 font-bold text-sm text-stone-600">
                        实时录取名单公示
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-stone-100 text-stone-500 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">姓名</th>
                                    <th className="px-4 py-2">高考分数</th>
                                    <th className="px-4 py-2">天赋</th>
                                    <th className="px-4 py-2">录取学院</th>
                                    <th className="px-4 py-2">标签</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {gameState.incomingStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-stone-400">
                                            {isRecruiting ? "正在录取中..." : "暂无数据"}
                                        </td>
                                    </tr>
                                ) : (
                                    gameState.incomingStudents.slice().reverse().slice(0, 50).map(s => (
                                        <tr key={s.id} className="hover:bg-stone-50 animate-in fade-in slide-in-from-left-2">
                                            <td className="px-4 py-2 font-medium text-stone-700">{s.name}</td>
                                            <td className="px-4 py-2 font-mono text-emerald-600">{s.gaokaoScore}</td>
                                            <td className="px-4 py-2 font-mono text-blue-500">{s.talent}</td>
                                            <td className="px-4 py-2 text-stone-500">{COLLEGES_DEF[s.college]?.name}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-1">
                                                    {s.tags.slice(0, 2).map((t, i) => (
                                                        <span key={i} className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200 text-[10px]">{t}</span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
