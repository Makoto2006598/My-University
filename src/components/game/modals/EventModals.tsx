
import React from 'react';
import { RecruitmentMethod, Faculty } from '../../../types';
import { formatMoney } from '../../../utils/gameUtils';
import { COLLEGES_DEF } from '../../../data/gameData';
import { DollarSign, UserPlus, Scissors } from 'lucide-react';

// --- Recruitment Configuration Modal ---
interface RecruitmentConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    method: RecruitmentMethod;
    count: number;
    setCount: (n: number) => void;
    onConfirm: () => void;
    getCost: (m: RecruitmentMethod) => number;
    getProb: (m: RecruitmentMethod) => string;
}
export const RecruitmentConfigModal: React.FC<RecruitmentConfigModalProps> = ({ 
    isOpen, onClose, method, count, setCount, onConfirm, getCost, getProb 
}) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
            <div className="bg-white border border-stone-200 p-6 rounded-xl max-w-md w-full shadow-2xl">
                <h3 className="text-xl font-bold text-stone-800 mb-4">招聘配置</h3>
                <div className="space-y-4 mb-6">
                    <div><label className="text-sm text-stone-500">招聘渠道</label><div className="text-stone-800 font-bold">{method}</div></div>
                    <div><label className="text-sm text-stone-500">招聘人数</label><input type="range" min="1" max="10" value={count} onChange={e => setCount(parseInt(e.target.value))} className="w-full accent-orange-500"/><div className="text-right text-stone-800">{count} 人</div></div>
                    <div className="p-3 bg-stone-50 rounded text-xs text-stone-500">预估费用: <span className="text-emerald-600 font-mono">{formatMoney(getCost(method) * count)}</span></div>
                    <div className="p-2 bg-stone-100 rounded text-[10px] text-stone-400 font-mono">{getProb(method)}</div>
                </div>
                <div className="flex gap-4"><button onClick={onClose} className="flex-1 py-2 bg-stone-100 text-stone-500 rounded hover:bg-stone-200">取消</button><button onClick={onConfirm} className="flex-1 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500">确认招聘</button></div>
            </div>
        </div>
    );
};

// --- Recruitment Result Modal ---
interface RecruitmentResultModalProps {
    isOpen: boolean;
    hires: Faculty[];
    onHire: (f: Faculty) => void;
    onClose: () => void;
}
export const RecruitmentResultModal: React.FC<RecruitmentResultModalProps> = ({ isOpen, hires, onHire, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
            <div className="bg-white border border-stone-200 p-6 rounded-xl max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl">
                <h3 className="text-2xl font-bold text-stone-800 mb-6">招聘结果</h3>
                <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 p-2 custom-scrollbar">
                    {hires.map(h => (
                        <div key={h.id} className="bg-stone-50 border border-stone-200 p-4 rounded-lg flex flex-col justify-between">
                            <div><div className="font-bold text-stone-800">{h.name}</div><div className="text-xs text-stone-500 mb-2">{h.title} | {COLLEGES_DEF[h.department].name}</div><div className="space-y-1 text-xs text-stone-600"><div>科研: {h.researchAbility}</div><div>行政: {h.managementAbility}</div></div></div>
                            <button onClick={() => onHire(h)} className="mt-4 w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-500">录用</button>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-6 w-full py-3 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200">完成</button>
            </div>
        </div>
    );
};

// --- Faculty Selection Modal (For Dean/Vice Dean) ---
interface FacultySelectModalProps {
    isOpen: boolean;
    faculty: Faculty[];
    onSelect: (facultyId: string) => void;
    onClose: () => void;
}
export const FacultySelectModal: React.FC<FacultySelectModalProps> = ({ isOpen, faculty, onSelect, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-white border border-stone-200 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-bold text-stone-800">选择教职工</h3>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600">关闭</button>
                </div>
                <div className="p-2 overflow-y-auto custom-scrollbar space-y-2 flex-1">
                    {faculty.map(f => (
                        <button key={f.id} onClick={() => onSelect(f.id)} className="w-full text-left p-3 border border-stone-100 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-colors flex justify-between items-center group">
                            <div>
                                <div className="font-bold text-stone-700 group-hover:text-orange-700">{f.name}</div>
                                <div className="text-xs text-stone-500">{f.title} | 行政: {f.managementAbility}</div>
                            </div>
                            <div className="text-xs text-emerald-600 font-mono">选择</div>
                        </button>
                    ))}
                    {faculty.length === 0 && <div className="p-4 text-center text-stone-400">暂无可用教职工</div>}
                </div>
            </div>
        </div>
    );
};

// --- Simple Notification Modals ---
export const BudgetModal: React.FC<{ isOpen: boolean; onConfirm: () => void; }> = ({ isOpen, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-stone-200 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200"><DollarSign className="w-8 h-8 text-white"/></div>
                <h2 className="text-2xl font-bold text-stone-800 mb-2">新的月份开始了</h2>
                <p className="text-stone-500 mb-4">请前往财务处审阅并确认本月预算分配方案。</p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                    <p className="text-amber-700 text-sm font-bold">确认预算后才能继续推进时间</p>
                </div>
                <button onClick={onConfirm} className="w-full py-3 min-h-[48px] bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg">前往财务处</button>
            </div>
        </div>
    );
};

export const AdmissionsPrepModal: React.FC<{ isOpen: boolean; onConfirm: () => void; }> = ({ isOpen, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-stone-200 p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center">
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200"><UserPlus className="w-10 h-10 text-white"/></div>
                <h2 className="text-3xl font-bold text-stone-800 mb-2">招生筹备期开启</h2>
                <p className="text-stone-500 mb-6 text-sm leading-relaxed">现在是7月1日。离正式录取（7月15日）还有15天。<br/>请前往 <span className="text-indigo-600 font-bold">招生处</span> 制定今年的招生计划，包括分数线、招生总数及各学院名额分配。</p>
                <button onClick={onConfirm} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg">前往制定计划</button>
            </div>
        </div>
    );
};

export const OpeningCeremonyModal: React.FC<{ isOpen: boolean; newStudents: number; tuition: number; onConfirm: () => void; }> = ({ isOpen, newStudents, tuition, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="text-center max-w-2xl w-full p-8 bg-white/90 rounded-2xl shadow-2xl border border-white/50">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-4xl font-bold text-stone-800 mb-4">开学典礼</h2>
                <p className="text-xl text-stone-600 mb-8">新学期开始了！我们迎来了 {newStudents} 名新生。</p>
                <div className="grid grid-cols-2 gap-4 mb-8 text-left bg-stone-50 p-6 rounded-xl border border-stone-200">
                    <div><div className="text-stone-400 text-xs uppercase">新生人数</div><div className="text-2xl font-bold text-stone-800">{newStudents}</div></div>
                    <div><div className="text-stone-400 text-xs uppercase">预计学费收入</div><div className="text-2xl font-bold text-emerald-600">{formatMoney(tuition)}</div></div>
                </div>
                <button onClick={onConfirm} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full text-lg shadow-xl shadow-emerald-200 transition-all transform hover:scale-105">开始新学期</button>
            </div>
        </div>
    );
};

export const GrandOpeningModal: React.FC<{ isOpen: boolean; onConfirm: () => void; universityName: string; }> = ({ isOpen, onConfirm, universityName }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white border-2 border-orange-500 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col relative text-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                <div className="pt-10 pb-6 px-8 relative">
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-orange-500/20 rounded-full blur-xl"></div>
                    <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/30 mb-4 border-4 border-white"><Scissors className="w-10 h-10 text-white" /></div>
                    <h2 className="text-3xl font-bold text-stone-800 mb-2 tracking-wide drop-shadow-sm">盛大开幕</h2>
                    <p className="text-orange-500 font-medium uppercase tracking-widest text-sm">Grand Opening Ceremony</p>
                </div>
                <div className="px-8 pb-8 space-y-4 text-stone-600 text-sm leading-relaxed">
                    <p>经过漫长的筹备与建设，<span className="text-stone-800 font-bold">{universityName}</span> 的校园筹办建筑期已正式结束！</p>
                    <p className="text-xs text-stone-400">今天是 2027年7月1日。让我们为崭新的未来剪彩！</p>
                </div>
                <div className="p-6 bg-stone-50 border-t border-stone-200"><button onClick={onConfirm} className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold text-lg rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"><Scissors className="w-5 h-5 fill-current"/> 完成剪彩仪式</button></div>
            </div>
        </div>
    );
};
