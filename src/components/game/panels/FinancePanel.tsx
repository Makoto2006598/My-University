
import React, { useState, useEffect } from 'react';
import { GameState, UniType1 } from '../../../types';
import { SimpleLineChart, BudgetPieChart } from '../Visuals';
import { formatMoney, getGameDate } from '../../../utils/gameUtils';
import { ArrowLeft, ArrowRight, DollarSign, Info, AlertCircle, PieChart as PieChartIcon, Lock, Unlock, CheckCircle } from 'lucide-react';

interface FinancePanelProps {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    currentStats: any;
    lockedAllocations: string[];
    setLockedAllocations: React.Dispatch<React.SetStateAction<string[]>>;
    onBudgetConfirmed?: () => void;
}

export const FinancePanel: React.FC<FinancePanelProps> = ({
    gameState, setGameState, currentStats, lockedAllocations, setLockedAllocations, onBudgetConfirmed
}) => {
    const [financeChartMode, setFinanceChartMode] = useState<'OVERVIEW' | 'EXPENSE_DETAIL'>('OVERVIEW');
    const [tempAllocationWeights, setTempAllocationWeights] = useState(gameState.financeSettings.allocationWeights);

    const date = getGameDate(gameState.day);
    const isBudgetLocked = date.date !== 1 || gameState.budgetConfirmed;

    useEffect(() => {
        setTempAllocationWeights(gameState.financeSettings.allocationWeights);
    }, [gameState.financeSettings.allocationWeights]);

    const handleWeightChange = (key: keyof typeof tempAllocationWeights, rawValue: number) => { 
        if (isBudgetLocked) return;
        const value = Math.max(5, Math.min(80, rawValue)); 
        const oldWeights = { ...tempAllocationWeights }; 
        if (oldWeights[key] === value) return; 
        if (lockedAllocations.includes(key as string)) return; 
        const keys = Object.keys(oldWeights) as Array<keyof typeof tempAllocationWeights>; 
        const adjustableKeys = keys.filter(k => k !== key && !lockedAllocations.includes(k as string)); 
        if (adjustableKeys.length === 0) return; 
        const lockedSum = keys.reduce<number>((sum, k) => (lockedAllocations.includes(k as string) ? sum + (oldWeights[k] as number) : sum), 0); 
        const maxPossibleForCurrent = 100 - lockedSum - (adjustableKeys.length * 5); 
        const finalValue = Math.min(value, maxPossibleForCurrent); 
        if (finalValue < 5) return; 
        const newWeights = { ...oldWeights }; 
        newWeights[key] = finalValue; 
        const remainingPool = 100 - lockedSum - finalValue; 
        const currentSumOfAdjustable = adjustableKeys.reduce<number>((sum, k) => sum + (oldWeights[k] as number), 0); 
        let accumulated = 0; 
        adjustableKeys.forEach((k, index) => { 
            let share = 0; 
            if (currentSumOfAdjustable === 0) share = remainingPool / adjustableKeys.length; else share = (oldWeights[k] / currentSumOfAdjustable) * remainingPool; 
            let newKVal = Math.floor(share); 
            if (newKVal < 5) newKVal = 5; 
            if (index === adjustableKeys.length - 1) newKVal = 100 - (lockedSum + finalValue + accumulated); 
            else accumulated += newKVal; 
            newWeights[k] = newKVal; 
        }); 
        if (adjustableKeys.some(k => newWeights[k] < 5)) return; 
        setTempAllocationWeights(newWeights); 
    };

    const toggleLock = (key: string) => { 
        if (isBudgetLocked) return;
        setLockedAllocations(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]); 
    };

    const handleConfirmBudget = () => {
        setGameState(prev => ({
            ...prev,
            budgetConfirmed: true,
            financeSettings: {
                ...prev.financeSettings,
                allocationWeights: tempAllocationWeights
            }
        }));
        onBudgetConfirmed?.();
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-4 h-full overflow-hidden p-6">
            <div className="flex-1 flex flex-col gap-4 min-w-[300px] overflow-y-auto custom-scrollbar pr-2">
                <div className="flex justify-between items-center"><div className="flex gap-2 p-1 bg-stone-100 rounded-lg border border-stone-200"><button onClick={() => setFinanceChartMode('OVERVIEW')} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${financeChartMode === 'OVERVIEW' ? 'bg-orange-500 text-white' : 'text-stone-500 hover:text-stone-800'}`}>总览</button><button onClick={() => setFinanceChartMode('EXPENSE_DETAIL')} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${financeChartMode === 'EXPENSE_DETAIL' ? 'bg-orange-500 text-white' : 'text-stone-500 hover:text-stone-800'}`}>支出</button></div><div className="text-[10px] text-stone-400">财务周期: 30天</div></div>
                <div className="bg-white border border-stone-200 rounded-xl p-4 min-h-[200px] shadow-sm">{financeChartMode === 'OVERVIEW' ? (<SimpleLineChart data={gameState.financeHistory} dataKeys={['income', 'expense', 'balance']} colors={['#10b981', '#ef4444', '#f59e0b']} height={180}/>) : (<SimpleLineChart data={gameState.financeHistory} dataKeys={['maintenance', 'cafeteriaSubsidy', 'researchCost', 'facultySalaries']} colors={['#64748b', '#ef4444', '#a855f7', '#3b82f6']} height={180}/>)}</div>
                
                {/* Daily Breakdown Table */}
                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-4 shadow-sm">
                    <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-500 uppercase">日财务明细 (预估)</div>
                    <div className="grid grid-cols-2 text-xs">
                        <div className="p-4 border-r border-stone-200">
                            <div className="font-bold text-emerald-600 mb-3 flex items-center gap-2"><ArrowLeft className="w-3 h-3 rotate-45"/> 收入 (Daily Income)</div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-stone-600"><span>学费分摊</span><span className="font-mono text-stone-800">{formatMoney(currentStats.annualizedTuition)}</span></div>
                                <div className="flex justify-between text-stone-600"><span>建筑营收</span><span className="font-mono text-stone-800">{formatMoney(currentStats.buildingRevenueDaily)}</span></div>
                                <div className="flex justify-between text-stone-600">
                                    <span>财政拨款</span>
                                    <span className="font-mono text-stone-800 flex items-center gap-1">
                                        {formatMoney(currentStats.dailyGrant)}
                                        {gameState.ministryPenaltyEndDay && gameState.day <= gameState.ministryPenaltyEndDay && <span title="拨款减少中 (惩罚)"><AlertCircle className="w-3 h-3 text-red-500"/></span>}
                                    </span>
                                </div>
                                <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-emerald-600"><span>总计</span><span>{formatMoney(currentStats.totalRevenue)}</span></div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="font-bold text-red-500 mb-3 flex items-center gap-2"><ArrowRight className="w-3 h-3 rotate-45"/> 支出 (Daily Expense)</div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-stone-600"><span>教工薪资</span><span className="font-mono text-stone-800">{formatMoney(currentStats.salaryRequiredDaily)}</span></div>
                                <div className="flex justify-between text-stone-600">
                                    <span>建筑维护</span>
                                    <span className="font-mono text-stone-800 flex items-center gap-1">
                                        {formatMoney(currentStats.maintenanceCostActual)}
                                        {currentStats.isMaintenanceFree && <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 rounded">(暂无消耗)</span>}
                                    </span>
                                </div>
                                <div className="flex justify-between text-stone-600"><span>科研投入</span><span className="font-mono text-stone-800">{formatMoney(currentStats.researchAllocated)}</span></div>
                                <div className="flex justify-between text-stone-600"><span>各类补贴</span><span className="font-mono text-stone-800">{formatMoney(currentStats.cafeteriaAllocated + currentStats.studentAllocated + currentStats.facultyAllocated)}</span></div>
                                <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-red-500"><span>总计</span><span>{formatMoney(currentStats.totalExpense)}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className={`px-4 py-2 border-t border-stone-200 text-sm font-bold flex justify-between ${currentStats.netIncome >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        <span>日净收 (Net)</span>
                        <span className="font-mono">{currentStats.netIncome >= 0 ? '+' : ''}{formatMoney(currentStats.netIncome)}</span>
                    </div>
                </div>
            </div>

            {/* Right Column - Controls */}
            <div className="w-full xl:w-[340px] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar pb-6">
                
                {/* Income Management Card */}
                <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shrink-0 shadow-sm">
                    <h4 className="text-xs font-bold text-stone-800 uppercase border-b border-stone-200 pb-2 flex items-center gap-2"><DollarSign className="w-3 h-3 text-emerald-500"/> 收入管理</h4>
                    <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                        <div className="flex justify-between text-[10px] text-stone-500 mb-2">
                            <span>学年学费标准</span>
                            <span className="text-stone-800 font-mono">{gameState.financeSettings.tuitionFeePerYear}K￥</span>
                        </div>
                        <input type="range" min="5" max="100" step="1" value={gameState.financeSettings.tuitionFeePerYear} onChange={e => setGameState({...gameState, financeSettings: {...gameState.financeSettings, tuitionFeePerYear: parseInt(e.target.value)}})} className="w-full h-1 bg-stone-200 rounded-full appearance-none accent-emerald-500 cursor-pointer"/>
                        <div className="text-[10px] text-stone-400 mt-2 flex items-start gap-1 leading-tight">
                            <Info className="w-3 h-3 shrink-0 mt-0.5"/> <span>学费将在每学年开始时统一收取。过高的学费会降低学生满意度。</span>
                        </div>
                    </div>
                    {gameState.uniType1 === UniType1.PUBLIC && !currentStats.isOperational && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                            <div title="财政拨款已锁定"><AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /></div>
                            <div>
                                <div className="text-xs font-bold text-amber-600 mb-1">财政拨款已锁定</div>
                                <div className="text-[10px] text-amber-700/70 leading-tight">当前无法获得每日 {formatMoney(currentStats.potentialDailyGrant)} 的政府补助。<br/><span className="text-amber-600 mt-1 block">需满足：至少1名学生且1名教工</span></div>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2 pt-2">
                        <button onClick={() => { if(gameState.day % 30 !== 0) {alert("每月1号可申请"); return;} setGameState(prev => ({...prev, money: prev.money + 500000})); alert("获得企业赞助 500K"); }} className="w-full flex items-center justify-between p-3 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-200 rounded-lg text-xs transition-all group"><span className="font-bold text-stone-600 group-hover:text-emerald-700">申请企业赞助</span><span className="text-emerald-600 font-mono">+500K</span></button>
                         <button onClick={() => { if(gameState.day % 180 !== 0) {alert("每学期初可申请"); return;} setGameState(prev => ({...prev, money: prev.money + 2000000})); alert("获得校友捐赠 2.0M"); }} className="w-full flex items-center justify-between p-3 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-200 rounded-lg text-xs transition-all group"><span className="font-bold text-stone-600 group-hover:text-emerald-700">校友捐赠</span><span className="text-emerald-600 font-mono">+2.0M</span></button>
                    </div>
                </div>

                {/* Budget Allocation Card */}
                <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4 shrink-0 relative shadow-sm">
                    {isBudgetLocked && (
                         <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-4 rounded-xl border border-stone-200">
                             <Lock className="w-8 h-8 text-amber-500 mb-2"/>
                             <h4 className="text-stone-800 font-bold text-sm">预算已锁定</h4>
                             <p className="text-[10px] text-stone-500 mt-1">本月预算方案已确定。请等待下月1日调整。</p>
                         </div>
                    )}
                    
                    <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                        <h4 className="text-xs font-bold text-stone-800 uppercase flex items-center gap-2">
                            <PieChartIcon className="w-3 h-3 text-purple-500"/> 预算分配
                        </h4>
                        {!isBudgetLocked && (
                            <button 
                                onClick={handleConfirmBudget}
                                className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded transition-colors shadow-lg flex items-center gap-1"
                            >
                                <CheckCircle className="w-3 h-3"/> 确认预算
                            </button>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                            <span>每日预算总额</span>
                            <span className="text-stone-800 font-mono">{formatMoney(gameState.financeSettings.totalDailyBudget)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="1000" 
                            max={Math.max(500000, currentStats.totalRevenue * 2)} 
                            step="1000" 
                            value={gameState.financeSettings.totalDailyBudget} 
                            onChange={e => setGameState({...gameState, financeSettings: {...gameState.financeSettings, totalDailyBudget: parseInt(e.target.value)}})} 
                            disabled={isBudgetLocked}
                            className={`w-full h-1.5 bg-stone-200 rounded-full appearance-none accent-purple-500 ${isBudgetLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        />
                    </div>

                    <div className="flex justify-center py-2 relative">
                        <div className="scale-75 origin-center">
                            <BudgetPieChart data={[
                                { label: '科研', value: tempAllocationWeights.research, color: '#a855f7' }, 
                                { label: '食堂', value: tempAllocationWeights.cafeteria, color: '#ef4444' }, 
                                { label: '维护', value: tempAllocationWeights.maintenance, color: '#64748b' }, 
                                { label: '学生', value: tempAllocationWeights.student, color: '#10b981' }, 
                                { label: '津贴', value: tempAllocationWeights.faculty, color: '#3b82f6' }
                            ]} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            { label: '科研投入', key: 'research', val: tempAllocationWeights.research, color: 'accent-purple-500' },
                            { label: '食堂补贴', key: 'cafeteria', val: tempAllocationWeights.cafeteria, color: 'accent-red-500' },
                            { label: '建筑维护', key: 'maintenance', val: tempAllocationWeights.maintenance, color: 'accent-stone-500' },
                            { label: '学生补贴', key: 'student', val: tempAllocationWeights.student, color: 'accent-emerald-500' },
                            { label: '教师津贴', key: 'faculty', val: tempAllocationWeights.faculty, color: 'accent-blue-500' }
                        ].map((item) => (
                            <div key={item.key}>
                                <div className="flex justify-between text-[10px] text-stone-500 mb-0.5">
                                    <span className="flex items-center gap-1">{item.label} {lockedAllocations.includes(item.key) && <Lock className="w-2 h-2 text-amber-500"/>}</span>
                                    <span className="text-stone-800 font-mono">{item.val}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="range" 
                                        min="5" max="80" step="1" 
                                        value={item.val} 
                                        onChange={e => handleWeightChange(item.key as any, parseInt(e.target.value))} 
                                        disabled={lockedAllocations.includes(item.key) || isBudgetLocked} 
                                        className={`flex-1 h-1 bg-stone-200 rounded-full appearance-none ${item.color} ${lockedAllocations.includes(item.key) || isBudgetLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                    />
                                    <button onClick={() => toggleLock(item.key)} disabled={isBudgetLocked} className={`text-stone-400 hover:text-stone-600 ${lockedAllocations.includes(item.key) ? 'text-amber-500' : ''}`}>
                                        {lockedAllocations.includes(item.key) ? <Lock className="w-3 h-3"/> : <Unlock className="w-3 h-3"/>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips Card */}
                <div className="bg-white border border-stone-200 rounded-xl p-4 shrink-0 shadow-sm">
                    <div className="text-[10px] text-stone-500 leading-relaxed">
                        <p className="font-bold text-stone-700 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> 财务小贴士：</p>
                        <p>保持正向现金流是大学生存的关键。如果连续3个月赤字，可能会导致教育部接管（游戏结束）。优先保证基础设施维护与教师薪资发放。</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
