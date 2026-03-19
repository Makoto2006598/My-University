
import React from 'react';
import { BuildingDef, CellData, VariantDef } from '../../../types';
import { formatMoney } from '../../../utils/gameUtils';
import { Edit3, X, Trash2 } from 'lucide-react';

interface BuildingInspectorProps {
    selectedBuilding: {id: string, def: BuildingDef, variant?: VariantDef, cell: CellData} | null;
    renameValue: string;
    onRenameChange: (val: string) => void;
    onRenameSubmit: (newName: string) => void;
    onClose: () => void;
    onRemove: (id: string) => void;
}

export const BuildingInspector: React.FC<BuildingInspectorProps> = ({
    selectedBuilding, renameValue, onRenameChange, onRenameSubmit, onClose, onRemove
}) => {
    if (!selectedBuilding) return null;

    return (
        <div className="absolute bottom-32 left-4 bg-white/95 backdrop-blur border border-orange-200 p-4 rounded-xl shadow-xl w-72 z-30 animate-in slide-in-from-left-4 fade-in">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm ${selectedBuilding.def.color} text-white`}>
                        {selectedBuilding.def.icon}
                    </div>
                    <div>
                        <div className="font-bold text-stone-800 text-sm flex items-center gap-2">
                            {renameValue}
                            <button onClick={() => { const name = prompt("重命名建筑:", renameValue); if(name) onRenameSubmit(name); }} className="text-stone-400 hover:text-stone-600"><Edit3 className="w-3 h-3"/></button>
                        </div>
                        <div className="text-[10px] text-stone-500">{selectedBuilding.variant?.label || selectedBuilding.def.name}</div>
                    </div>
                </div>
                <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="w-4 h-4"/></button>
            </div>
            
            <div className="space-y-2 text-xs text-stone-600">
                <div className="flex justify-between border-b border-stone-100 pb-1">
                    <span>维护费用</span>
                    <span className="font-mono text-red-500">-{formatMoney(selectedBuilding.def.maintenance)}/m</span>
                </div>
                {selectedBuilding.def.capacity && (
                    <div className="flex justify-between border-b border-stone-100 pb-1">
                        <span>容量</span>
                        <span className="font-mono">{selectedBuilding.def.capacity} 人</span>
                    </div>
                )}
                {selectedBuilding.def.revenue && (
                    <div className="flex justify-between border-b border-stone-100 pb-1">
                        <span>预估营收</span>
                        <span className="font-mono text-emerald-600">+{formatMoney(selectedBuilding.def.revenue)}/m</span>
                    </div>
                )}
                {selectedBuilding.def.happiness && (
                    <div className="flex justify-between border-b border-stone-100 pb-1">
                        <span>满意度影响</span>
                        <span className={`font-mono ${selectedBuilding.def.happiness > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {selectedBuilding.def.happiness > 0 ? '+' : ''}{selectedBuilding.def.happiness}
                        </span>
                    </div>
                )}
                <div className="pt-2 text-[10px] text-stone-400 leading-tight">
                    {selectedBuilding.variant?.description || selectedBuilding.def.description || "暂无描述。"}
                </div>
                
                <button 
                    onClick={() => onRemove(selectedBuilding.id)}
                    className="mt-4 w-full py-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                    <Trash2 className="w-3 h-3"/> 拆除建筑
                </button>
            </div>
        </div>
    );
};
