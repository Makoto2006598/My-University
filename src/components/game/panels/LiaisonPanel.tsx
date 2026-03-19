
import React, { useState } from 'react';
import { GameState, MissionDef, MissionStatus, LiaisonState, CollegeType, BuildingType, ConstructionStatus } from '../../../types';
import { MISSIONS_DEF, COLLEGES_DEF, BUILDINGS } from '../../../data/gameData';
import { Landmark, AlertTriangle, Lock, CheckCircle, Clock, X, ArrowUpRight, Check, Target, Gift } from 'lucide-react';

interface LiaisonPanelProps {
    gameState: GameState;
    onAcceptMission: (id: string) => void;
    onClaimMission: (id: string) => void;
    onCancelMission: (id: string) => void;
}

export const LiaisonPanel: React.FC<LiaisonPanelProps> = ({ 
    gameState, onAcceptMission, onClaimMission, onCancelMission 
}) => {
    const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
    const missions = gameState.liaison.missions;
    const selectedMission = selectedMissionId ? MISSIONS_DEF[selectedMissionId] : null;
    const activeCount = gameState.liaison.activeMissions.length;

    // Helper to draw connection lines
    const renderConnections = () => {
        return Object.values(MISSIONS_DEF).map(mission => {
            if (!mission.parentId) return null;
            const parent = MISSIONS_DEF[mission.parentId];
            const parentStatus = missions[parent.id];
            
            // Only show connection if parent is visible (Available, Active, Completed)
            if (!parentStatus || parentStatus === MissionStatus.LOCKED) return null;

            // Simple Bezier
            const start = { x: parent.position.x + 60, y: parent.position.y + 80 }; // Bottom center of parent
            const end = { x: mission.position.x + 60, y: mission.position.y }; // Top center of child
            const c1 = { x: start.x, y: start.y + 50 };
            const c2 = { x: end.x, y: end.y - 50 };

            const isPathActive = parentStatus === MissionStatus.COMPLETED;

            return (
                <path 
                    key={`${parent.id}-${mission.id}`}
                    d={`M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`}
                    stroke={isPathActive ? "#10b981" : "#e5e7eb"}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={isPathActive ? "0" : "5,5"}
                />
            );
        });
    };

    const getStatusColor = (status: MissionStatus) => {
        switch (status) {
            case MissionStatus.COMPLETED: return 'bg-emerald-100 border-emerald-500 text-emerald-700 shadow-emerald-100';
            case MissionStatus.ACTIVE: return 'bg-orange-100 border-orange-500 text-orange-700 shadow-orange-100 ring-2 ring-orange-200 animate-pulse';
            case MissionStatus.AVAILABLE: return 'bg-white border-indigo-200 text-stone-600 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-lg cursor-pointer';
            case MissionStatus.COOLDOWN: return 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed opacity-75';
            case MissionStatus.LOCKED: default: return 'bg-stone-100 border-stone-200 text-stone-300 cursor-not-allowed opacity-50 grayscale';
        }
    };

    // --- REQUIREMENT CHECK LOGIC FOR UI ---
    const checkCollegeReq = (cType: CollegeType) => !!gameState.colleges.find(c => c.type === cType);
    const checkCategoryReq = (cat: string) => !!gameState.colleges.find(c => COLLEGES_DEF[c.type].category === cat);
    const checkDeanReq = (req: MissionDef['requirements']) => {
        const involvedColleges: string[] = [];
        if (req.colleges) involvedColleges.push(...req.colleges);
        if (req.categories) {
            gameState.colleges.forEach(c => {
                if (req.categories?.includes(COLLEGES_DEF[c.type].category)) involvedColleges.push(c.type);
            });
        }
        if (involvedColleges.length === 0) return false; // No colleges yet
        // Check if ALL involved colleges have deans
        return involvedColleges.every(cType => {
            const col = gameState.colleges.find(c => c.type === cType);
            return col && col.deanId;
        });
    };
    const checkBuildingReq = (type: BuildingType, count: number, req: MissionDef['requirements']) => {
        let requiredCollegeCount = (req.colleges?.length || 0);
        if (req.categories) requiredCollegeCount += req.categories.length; 
        
        let buildingCount = 0;
        gameState.grid.forEach(row => row.forEach(cell => {
            if (cell.building === type && cell.isOrigin && cell.constructionStatus === ConstructionStatus.COMPLETED) {
                buildingCount++;
            }
        }));
        // Logic matches useGameLogic.ts
        return buildingCount >= requiredCollegeCount * count;
    };

    return (
        <div className="flex h-full bg-stone-50 overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            {/* Tree Area */}
            <div className="flex-1 overflow-auto custom-scrollbar relative cursor-grab active:cursor-grabbing p-10 bg-white/30 backdrop-blur-sm">
                <div className="min-w-[1000px] min-h-[800px] relative">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        {renderConnections()}
                    </svg>

                    {Object.values(MISSIONS_DEF).map(mission => {
                        const status = missions[mission.id];
                        if (mission.parentId && missions[mission.parentId] === MissionStatus.LOCKED) return null;

                        return (
                            <div
                                key={mission.id}
                                onClick={() => status !== MissionStatus.LOCKED && status !== MissionStatus.COOLDOWN && setSelectedMissionId(mission.id)}
                                className={`absolute w-32 h-20 rounded-xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all z-10 shadow-md ${getStatusColor(status)}`}
                                style={{ left: mission.position.x, top: mission.position.y }}
                            >
                                <div className="text-xs font-bold leading-tight line-clamp-2">{mission.title}</div>
                                {status === MissionStatus.COMPLETED && <CheckCircle className="w-4 h-4 mt-1 text-emerald-600"/>}
                                {status === MissionStatus.LOCKED && <Lock className="w-4 h-4 mt-1 text-stone-300"/>}
                                {status === MissionStatus.COOLDOWN && <Clock className="w-4 h-4 mt-1 text-stone-400"/>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Side Panel for Details */}
            <div className={`w-[400px] bg-white border-l border-stone-200 shadow-2xl flex flex-col transition-all duration-300 transform ${selectedMission ? 'translate-x-0' : 'translate-x-full'} absolute right-0 top-0 bottom-0 z-20`}>
                {selectedMission && (
                    <>
                        <div className="p-6 border-b border-stone-100 bg-stone-50 flex justify-between items-start">
                            <div>
                                <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 px-2 py-0.5 rounded w-max 
                                    ${missions[selectedMission.id] === MissionStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : 
                                      missions[selectedMission.id] === MissionStatus.ACTIVE ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {missions[selectedMission.id] === MissionStatus.COMPLETED ? '已完成 (Completed)' : 
                                     missions[selectedMission.id] === MissionStatus.ACTIVE ? '进行中 (In Progress)' : '待接取 (Available)'}
                                </div>
                                <h2 className="text-xl font-bold text-stone-800 leading-tight">{selectedMission.title}</h2>
                            </div>
                            <button onClick={() => setSelectedMissionId(null)} className="text-stone-400 hover:text-stone-600 p-1 hover:bg-stone-200 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            
                            {/* 1. Description */}
                            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                                <h4 className="text-xs font-bold text-stone-500 uppercase mb-2 flex items-center gap-1"><Landmark className="w-3 h-3"/> 任务简报</h4>
                                <div className="text-sm text-stone-600 leading-relaxed italic">
                                    "{selectedMission.description}"
                                </div>
                            </div>

                            {/* 2. Requirements */}
                            <div className="border border-stone-200 rounded-xl overflow-hidden">
                                <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-stone-500"/>
                                    <h4 className="text-xs font-bold text-stone-600 uppercase">达成条件 (Objectives)</h4>
                                </div>
                                <div className="p-4 bg-white space-y-3">
                                    {/* College Reqs */}
                                    {selectedMission.requirements.colleges?.map(c => {
                                        const met = checkCollegeReq(c);
                                        return (
                                            <div key={c} className="flex items-center justify-between text-sm">
                                                <span className={met ? "text-stone-800" : "text-stone-500"}>建设 {COLLEGES_DEF[c].name}</span>
                                                {met ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <X className="w-4 h-4 text-stone-300"/>}
                                            </div>
                                        );
                                    })}
                                    {selectedMission.requirements.categories?.map(cat => {
                                        const met = checkCategoryReq(cat);
                                        const label = cat === 'NEW_ENG' ? '新工科类学院' : cat === 'TRAD_ENG' ? '传统工科类学院' : '文经类学院';
                                        return (
                                            <div key={cat} className="flex items-center justify-between text-sm">
                                                <span className={met ? "text-stone-800" : "text-stone-500"}>建设任意 {label}</span>
                                                {met ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <X className="w-4 h-4 text-stone-300"/>}
                                            </div>
                                        );
                                    })}
                                    
                                    {/* Dean Req */}
                                    {selectedMission.requirements.needDean && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={checkDeanReq(selectedMission.requirements) ? "text-stone-800" : "text-stone-500"}>相关学院均任命院长</span>
                                            {checkDeanReq(selectedMission.requirements) ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <X className="w-4 h-4 text-stone-300"/>}
                                        </div>
                                    )}

                                    {/* Building Req */}
                                    {selectedMission.requirements.minBuildingsPerCollege && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={checkBuildingReq(selectedMission.requirements.minBuildingsPerCollege.type, selectedMission.requirements.minBuildingsPerCollege.count, selectedMission.requirements) ? "text-stone-800" : "text-stone-500"}>
                                                每学院配备 {BUILDINGS[selectedMission.requirements.minBuildingsPerCollege.type].name}
                                            </span>
                                            {checkBuildingReq(selectedMission.requirements.minBuildingsPerCollege.type, selectedMission.requirements.minBuildingsPerCollege.count, selectedMission.requirements) ? <CheckCircle className="w-4 h-4 text-emerald-500"/> : <X className="w-4 h-4 text-stone-300"/>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. Rewards */}
                            <div className="border border-emerald-100 rounded-xl overflow-hidden bg-emerald-50/50">
                                <div className="bg-emerald-100/50 px-4 py-2 border-b border-emerald-100 flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-emerald-600"/>
                                    <h4 className="text-xs font-bold text-emerald-700 uppercase">获批奖励 (Rewards)</h4>
                                </div>
                                <div className="p-4 space-y-2">
                                    {selectedMission.rewards.title && <div className="text-xs text-emerald-800 flex items-center gap-2"><ArrowUpRight className="w-3 h-3"/> 获得称号：<span className="font-bold bg-white px-2 rounded border border-emerald-200">{selectedMission.rewards.title}</span></div>}
                                    {selectedMission.rewards.socialRec && <div className="text-xs text-emerald-800 flex items-center gap-2"><ArrowUpRight className="w-3 h-3"/> 社会认可度 +{selectedMission.rewards.socialRec}</div>}
                                    {selectedMission.rewards.ministryRec && <div className="text-xs text-emerald-800 flex items-center gap-2"><ArrowUpRight className="w-3 h-3"/> 教育部评分 +{selectedMission.rewards.ministryRec}</div>}
                                    {selectedMission.rewards.grant && <div className="text-xs text-emerald-800 flex items-center gap-2"><ArrowUpRight className="w-3 h-3"/> 专项拨款: {selectedMission.rewards.grant.amount}/天 (持续{selectedMission.rewards.grant.days}天)</div>}
                                    {selectedMission.rewards.unlocks && <div className="text-xs text-emerald-800 flex items-center gap-2"><ArrowUpRight className="w-3 h-3"/> 解锁后续发展路线</div>}
                                </div>
                            </div>

                            {/* Warning */}
                            {selectedMission.exclusiveWith && selectedMission.exclusiveWith.length > 0 && missions[selectedMission.id] === MissionStatus.AVAILABLE && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>
                                    <div>
                                        <span className="font-bold block mb-1">互斥路线警告</span>
                                        接取此任务将<span className="font-bold underline">永久锁定</span>其他方向的任务路线。请谨慎规划学校发展方向。
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-stone-200 bg-stone-50 shrink-0">
                            {missions[selectedMission.id] === MissionStatus.AVAILABLE && (
                                <button 
                                    onClick={() => { onAcceptMission(selectedMission.id); setSelectedMissionId(null); }}
                                    disabled={activeCount >= 3}
                                    className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${activeCount >= 3 ? 'bg-stone-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400'}`}
                                >
                                    {activeCount >= 3 ? '当前任务已满 (3/3)' : '确认接取任务'}
                                </button>
                            )}

                            {missions[selectedMission.id] === MissionStatus.ACTIVE && (
                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => { onClaimMission(selectedMission.id); }}
                                        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-5 h-5"/> 提交任务报告
                                    </button>
                                    <button 
                                        onClick={() => { if(confirm('取消任务将进入冷却期，确定吗？')) { onCancelMission(selectedMission.id); setSelectedMissionId(null); } }}
                                        className="w-full py-2.5 rounded-lg font-bold text-stone-500 hover:text-red-500 hover:bg-red-50 border border-stone-200 hover:border-red-200 transition-all text-xs"
                                    >
                                        放弃任务
                                    </button>
                                </div>
                            )}

                            {missions[selectedMission.id] === MissionStatus.COMPLETED && (
                                <div className="text-center text-emerald-600 font-bold bg-emerald-50 py-3 rounded-xl border border-emerald-200">
                                    <CheckCircle className="w-5 h-5 inline mr-2 mb-0.5"/> 任务已完成
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* HUD Overlay for Liaison */}
            <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur border border-stone-200 p-4 rounded-xl shadow-md">
                <h1 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    <Landmark className="w-6 h-6 text-indigo-600"/> 教育部联络处
                </h1>
                <p className="text-xs text-stone-500 mt-1">当前进行中任务: <span className={`font-bold ${activeCount === 3 ? 'text-red-500' : 'text-indigo-600'}`}>{activeCount} / 3</span></p>
                {gameState.liaison.grantDaysLeft > 0 && (
                    <div className="mt-2 text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-2">
                        <Gift className="w-3 h-3"/>
                        <span>额外拨款: +{gameState.liaison.grantDailyAmount}/d ({gameState.liaison.grantDaysLeft}d)</span>
                    </div>
                )}
            </div>
        </div>
    );
};
