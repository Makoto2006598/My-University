
import React from 'react';
import { BuildingDef, CellData, VariantDef, ConstructionStatus, BuildingType, ServiceCoverage } from '../../../types';
import { BUILDINGS } from '../../../data/gameData';
import { formatMoney } from '../../../utils/gameUtils';
import { Edit3, X, Trash2, Hammer, AlertTriangle, Utensils, BookOpen, Trees } from 'lucide-react';

interface BuildingInspectorProps {
    selectedBuilding: {id: string, def: BuildingDef, variant?: VariantDef, cell: CellData} | null;
    renameValue: string;
    onRenameChange: (val: string) => void;
    onRenameSubmit: (newName: string) => void;
    onClose: () => void;
    onRemove: (id: string) => void;
    serviceCoverage?: { food: boolean; study: boolean; recreation: boolean };
    isConnected?: boolean;
}

export const BuildingInspector: React.FC<BuildingInspectorProps> = ({
    selectedBuilding, renameValue, onRenameChange, onRenameSubmit, onClose, onRemove,
    serviceCoverage, isConnected
}) => {
    if (!selectedBuilding) return null;

    const { def, variant, cell } = selectedBuilding;
    const isConstructing = cell.constructionStatus === ConstructionStatus.CONSTRUCTING;
    const constructionProgress = isConstructing
        ? Math.floor(((def.constructionTime - (cell.constructionLeft || 0)) / Math.max(1, def.constructionTime)) * 100)
        : 100;

    // Use variant stats if available, otherwise fall back to base
    const maintenance = variant?.maintenance ?? def.maintenance;
    const capacity = variant?.capacity ?? def.capacity;
    const revenue = variant?.revenue ?? def.revenue;
    const happiness = variant?.happiness ?? def.happiness;

    return (
        <div className="absolute bottom-28 sm:bottom-32 left-2 right-2 sm:left-4 sm:right-auto bg-white/95 backdrop-blur border border-orange-200 p-3 sm:p-4 rounded-xl shadow-xl sm:w-72 z-30 animate-in slide-in-from-left-4 fade-in">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm ${def.color} text-white`}>
                        {def.icon}
                    </div>
                    <div>
                        <div className="font-bold text-stone-800 text-sm flex items-center gap-2">
                            {renameValue}
                            <button onClick={() => { const name = prompt("重命名建筑:", renameValue); if(name) onRenameSubmit(name); }} className="text-stone-400 hover:text-stone-600"><Edit3 className="w-3 h-3"/></button>
                        </div>
                        <div className="text-[10px] text-stone-500">{variant?.label || def.name}</div>
                    </div>
                </div>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 min-w-[36px] min-h-[36px] flex items-center justify-center"><X className="w-5 h-5"/></button>
            </div>

            {/* Construction Progress */}
            {isConstructing && (
                <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-amber-700 font-bold mb-1.5">
                        <Hammer className="w-3.5 h-3.5 animate-bounce" />
                        <span>施工中... 剩余 {cell.constructionLeft} 天</span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-2">
                        <div
                            className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${constructionProgress}%` }}
                        />
                    </div>
                    <div className="text-right text-[10px] text-amber-600 mt-0.5 font-mono">{constructionProgress}%</div>
                </div>
            )}

            {/* 道路连通警告 */}
            {isConnected === false && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-red-700 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>未连通校门 - 建筑无法正常运作</span>
                    </div>
                </div>
            )}

            {/* 服务覆盖状态 */}
            {serviceCoverage && (cell.building === BuildingType.DORMITORY || cell.building === BuildingType.LECTURE_HALL) && (
                <div className="mb-3 p-2 bg-stone-50 border border-stone-200 rounded-lg">
                    <div className="text-[10px] text-stone-500 mb-1.5 font-medium">周边设施覆盖</div>
                    <div className="flex gap-3 text-xs">
                        <div className={`flex items-center gap-1 ${serviceCoverage.food ? 'text-orange-600' : 'text-stone-300'}`}>
                            <Utensils className="w-3 h-3" /> 餐饮
                        </div>
                        <div className={`flex items-center gap-1 ${serviceCoverage.study ? 'text-blue-600' : 'text-stone-300'}`}>
                            <BookOpen className="w-3 h-3" /> 学习
                        </div>
                        <div className={`flex items-center gap-1 ${serviceCoverage.recreation ? 'text-green-600' : 'text-stone-300'}`}>
                            <Trees className="w-3 h-3" /> 休闲
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2 text-xs text-stone-600">
                <div className="flex justify-between border-b border-stone-100 pb-1">
                    <span>维护费用</span>
                    <span className="font-mono text-red-500">-{formatMoney(maintenance)}/月</span>
                </div>
                {capacity !== undefined && capacity > 0 && (
                    <div className="flex justify-between border-b border-stone-100 pb-1">
                        <span>容量</span>
                        <span className="font-mono">{capacity} 人</span>
                    </div>
                )}
                {revenue !== undefined && revenue > 0 && (
                    <div className="flex justify-between border-b border-stone-100 pb-1">
                        <span>预估营收</span>
                        <span className="font-mono text-emerald-600">+{formatMoney(revenue)}/月</span>
                    </div>
                )}
                {happiness !== undefined && happiness !== 0 && (
                    <div className="flex justify-between border-b border-stone-100 pb-1">
                        <span>满意度影响</span>
                        <span className={`font-mono ${happiness > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {happiness > 0 ? '+' : ''}{happiness}
                        </span>
                    </div>
                )}
                {cell.rotation !== undefined && cell.rotation !== 0 && (
                    <div className="flex justify-between border-b border-stone-100 pb-1">
                        <span>朝向</span>
                        <span className="font-mono text-stone-500">已旋转 90°</span>
                    </div>
                )}
                <div className="pt-2 text-[10px] text-stone-400 leading-tight">
                    {variant?.description || def.description || "暂无描述。"}
                </div>

                <button
                    onClick={() => onRemove(selectedBuilding.id)}
                    className="mt-4 w-full py-2.5 sm:py-2 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-500 border border-red-200 rounded-lg flex items-center justify-center gap-2 transition-all min-h-[44px]"
                >
                    <Trash2 className="w-3 h-3"/> 拆除建筑
                </button>
            </div>
        </div>
    );
};
