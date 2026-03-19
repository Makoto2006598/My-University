
import React from 'react';
import { GameState, Faculty, RecruitmentMethod } from '../../../types';
import { formatMoney } from '../../../utils/gameUtils';
import { Users, Briefcase, Trash2, Search, TrendingUp, Medal, UserPlus, Star, Gem } from 'lucide-react';

interface HRPanelProps {
    gameState: GameState;
    onFire: (facultyId: string) => void;
    onOpenRecruit: (method: RecruitmentMethod) => void;
}

export const HRPanel: React.FC<HRPanelProps> = ({ gameState, onFire, onOpenRecruit }) => {
    return (
        <div className="flex flex-col h-full bg-orange-50/50">
            {/* Top Section: Recruitment Channels */}
            <div className="p-6 border-b border-orange-100 bg-white/50 shrink-0">
                <div className="max-w-5xl mx-auto w-full">
                    <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2 mb-4">
                        <UserPlus className="w-5 h-5 text-emerald-600"/> 人才引进通道
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Channel 1: Ministry */}
                        <button 
                            onClick={() => onOpenRecruit(RecruitmentMethod.MINISTRY)}
                            disabled={!gameState.recruitAvailable}
                            className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-400 rounded-xl p-4 text-left transition-all group relative overflow-hidden shadow-sm"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Briefcase className="w-16 h-16"/></div>
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-stone-100 rounded-lg text-stone-500 group-hover:text-stone-700"><Users className="w-5 h-5"/></div>
                                <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">免费</span>
                            </div>
                            <div className="font-bold text-stone-800 mb-1">教育部调配</div>
                            <div className="text-[10px] text-stone-500 leading-tight">接收教育部指派的毕业生或青年教师。成本低，但资质普通。</div>
                        </button>

                        {/* Channel 2: Social */}
                        <button 
                            onClick={() => onOpenRecruit(RecruitmentMethod.SOCIAL)}
                            disabled={!gameState.recruitAvailable}
                            className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-blue-300 rounded-xl p-4 text-left transition-all group relative overflow-hidden shadow-sm"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Search className="w-16 h-16"/></div>
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:text-blue-700"><Briefcase className="w-5 h-5"/></div>
                                <span className="text-xs font-mono text-stone-600 bg-stone-100 px-2 py-1 rounded">5K/人</span>
                            </div>
                            <div className="font-bold text-stone-800 mb-1">社会招聘</div>
                            <div className="text-[10px] text-stone-500 leading-tight">面向社会公开发布职位。能招募到有经验的讲师和副教授。</div>
                        </button>

                        {/* Channel 3: Headhunter */}
                        <button 
                            onClick={() => onOpenRecruit(RecruitmentMethod.HEADHUNTER_HIGH)}
                            disabled={!gameState.recruitAvailable}
                            className="bg-gradient-to-br from-white to-amber-50 hover:to-amber-100 border border-amber-100 hover:border-amber-300 rounded-xl p-4 text-left transition-all group relative overflow-hidden shadow-sm"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Gem className="w-16 h-16 text-amber-500"/></div>
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600 group-hover:text-amber-800"><Star className="w-5 h-5"/></div>
                                <span className="text-xs font-mono text-amber-600 bg-amber-100/50 px-2 py-1 rounded">1.0M/人</span>
                            </div>
                            <div className="font-bold text-stone-800 mb-1">高端猎头</div>
                            <div className="text-[10px] text-stone-500 leading-tight">聘请专业猎头挖角。主要获取教授、学科带头人及院士级专家。</div>
                        </button>
                    </div>
                    {!gameState.recruitAvailable && <div className="text-xs text-red-500 mt-2 text-center">当前招聘额度已用尽或处于非招聘期</div>}
                </div>
            </div>

            {/* Bottom Section: Faculty List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="max-w-5xl mx-auto w-full">
                    <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-blue-500"/> 在职教工 ({gameState.faculty.length})
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gameState.faculty.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                                <p>暂无教职工，请使用上方通道进行招聘。</p>
                            </div>
                        ) : (
                            gameState.faculty.map(f => (
                                <div key={f.id} className="bg-white border border-stone-200 p-4 rounded-xl hover:border-orange-200 transition-colors group relative shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <img src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${f.id}`} className="w-10 h-10 rounded-full bg-stone-100"/>
                                            <div>
                                                <div className="font-bold text-stone-800 text-sm">{f.name}</div>
                                                <div className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded inline-block mt-0.5">{f.title}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-mono text-emerald-600">{formatMoney(f.salary)}/m</div>
                                            <div className="text-[9px] text-stone-400">满意度: {Math.floor(f.satisfaction)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-3">
                                        <div>
                                            <div className="flex justify-between text-[10px] text-stone-500 mb-0.5">
                                                <span>科研能力</span>
                                                <span>{f.researchAbility}</span>
                                            </div>
                                            <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500" style={{ width: `${f.researchAbility}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] text-stone-500 mb-0.5">
                                                <span>行政能力</span>
                                                <span>{f.managementAbility}</span>
                                            </div>
                                            <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${f.managementAbility}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-[10px] text-stone-500 pt-2 border-t border-stone-100">
                                        <span>{f.department}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onFire(f.id); }}
                                            className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3"/> 解雇
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
