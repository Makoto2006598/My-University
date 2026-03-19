
import React from 'react';
import { GameState, UniversityRank } from '../../../types';
import { formatMoney, getGameDate } from '../../../utils/gameUtils';
import { SimpleLineChart } from '../Visuals';
import { 
    School, DollarSign, Users, Medal, Building2, TrendingUp 
} from 'lucide-react';

interface OverviewPanelProps {
    gameState: GameState;
    currentStats: any;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({ gameState, currentStats }) => {
    const gameDate = getGameDate(gameState.day);

    return (
        <div className="p-8 h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Basic Info Card */}
                <div className="col-span-full bg-white border border-orange-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3"><School className="w-10 h-10 text-white"/></div>
                        <div>
                            <h1 className="text-3xl font-bold text-stone-800">{gameState.universityName}</h1>
                            <div className="flex gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-stone-100 rounded text-xs text-stone-500 border border-stone-200">{gameState.universityLabel}</span>
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs border border-indigo-100">{gameState.rank}</span>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs border border-blue-100">{gameState.scale}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div><div className="text-stone-400 text-xs uppercase mb-1">建校时间</div><div className="text-xl font-mono text-stone-700">2026年</div></div>
                        <div><div className="text-stone-400 text-xs uppercase mb-1">已设学院</div><div className="text-xl font-bold text-stone-700">{gameState.colleges.length} <span className="text-xs text-stone-400">/ {gameState.rank === UniversityRank.STARTUP ? 3 : '∞'}</span></div></div>
                        <div><div className="text-stone-400 text-xs uppercase mb-1">当前学期</div><div className="text-xl font-mono text-emerald-600">{gameDate.semester}</div></div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="bg-white border border-stone-200 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-400 transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><DollarSign className="w-6 h-6"/></div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${currentStats.netIncome >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                            {currentStats.netIncome >= 0 ? '+' : ''}{formatMoney(currentStats.netIncome)}/日
                        </span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-stone-800 mb-1">{formatMoney(gameState.money)}</div>
                    <div className="text-xs text-stone-500">流动资金</div>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 relative overflow-hidden group hover:border-blue-400 transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users className="w-6 h-6"/></div>
                        <div className="text-right">
                            <div className="text-xs text-stone-400">容量利用率</div>
                            <div className="text-xs font-bold text-blue-500">{Math.round(gameState.students / Math.max(1, gameState.studentCap) * 100)}%</div>
                        </div>
                    </div>
                    <div className="text-3xl font-mono font-bold text-stone-800 mb-1">{gameState.students}</div>
                    <div className="text-xs text-stone-500">在校生总数 (容量: {gameState.studentCap})</div>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 relative overflow-hidden group hover:border-amber-400 transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Medal className="w-6 h-6"/></div>
                    </div>
                    <div className="text-3xl font-mono font-bold text-stone-800 mb-1">{gameState.socialRecognition}</div>
                    <div className="text-xs text-stone-500">社会认可度</div>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-5 relative overflow-hidden group hover:border-indigo-400 transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Building2 className="w-6 h-6"/></div>
                    </div>
                    <div className="text-3xl font-mono font-bold text-stone-800 mb-1">{gameState.ministryRecognition}</div>
                    <div className="text-xs text-stone-500">教育部评分</div>
                </div>

                {/* Detailed Stats Section */}
                <div className="col-span-full lg:col-span-3 bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-stone-600 uppercase mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> 财务趋势 (30天)</h3>
                    <div className="h-64 w-full">
                            <div className="h-full bg-stone-50 rounded-lg border border-stone-100 flex items-center justify-center relative">
                            {/* Chart implementation */}
                            <SimpleLineChart data={gameState.financeHistory} dataKeys={['income', 'expense', 'balance']} colors={['#10b981', '#ef4444', '#f59e0b']} height={256}/>
                            </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="col-span-full lg:col-span-1 space-y-4">
                    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-stone-400 uppercase mb-3">校园设施 (不含道路)</h3>
                        <div className="space-y-2 text-sm text-stone-700">
                            <div className="flex justify-between"><span>建筑总数</span><span className="font-mono">{currentStats.buildingCount}</span></div>
                            <div className="flex justify-between"><span>实验室</span><span className="font-mono">{currentStats.labCount}</span></div>
                            <div className="flex justify-between"><span>教学楼</span><span className="font-mono">{currentStats.lectureHallCount}</span></div>
                        </div>
                    </div>
                    
                    {/* Happiness Factors */}
                    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-stone-400 uppercase mb-3">满意度影响因子</h3>
                        <div className="space-y-2">
                            {currentStats.happinessFactors.length === 0 ? (
                                <div className="text-stone-400 text-xs text-center py-2">暂无显著影响</div>
                            ) : (
                                currentStats.happinessFactors.map((f: any, i: number) => (
                                    <div key={i} className="flex justify-between text-xs items-center text-stone-700">
                                        <span>{f.label}</span>
                                        <span className={`font-mono font-bold ${f.type === 'positive' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {f.type === 'positive' ? '+' : ''}{f.value}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
