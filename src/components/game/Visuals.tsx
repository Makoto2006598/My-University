
import React from 'react';
import { BuildingType, CellData, FinanceHistoryPoint } from '../../types';
import { BUILDINGS, VARIANTS } from '../../data/gameData';
import { formatMoney } from '../../utils/gameUtils';

export const getBuilding3DHeight = (type: BuildingType): number => {
    switch(type) {
        case BuildingType.DORMITORY: return 40;
        case BuildingType.LECTURE_HALL: return 55;
        case BuildingType.LABORATORY: return 50;
        case BuildingType.LIBRARY: return 70;
        case BuildingType.SCHOOL_GATE: return 35;
        case BuildingType.CAFETERIA: return 25;
        default: return 0;
    }
};

export const getTextureStyle = (cell: CellData): React.CSSProperties => {
    if (cell.building === BuildingType.NONE) return {};
    let texture = '';
    const def = BUILDINGS[cell.building];
    if (cell.building === BuildingType.ROAD && cell.variantId) {
        const v = VARIANTS[BuildingType.ROAD]?.find(v => v.id === cell.variantId);
        if (v) texture = v.texture || '';
    } else {
        texture = def.textureType || '';
    }
    const rotationDeg = cell.rotation ? 90 : 0;
    const transform = `rotate(${rotationDeg}deg)`;
    switch (texture) {
        case 'paved': return { backgroundImage: 'repeating-linear-gradient(45deg, #78350f 0, #78350f 2px, #92400e 0, #92400e 50%)', backgroundSize: '10px 10px' };
        case 'asphalt_city': return { backgroundImage: 'linear-gradient(90deg, transparent 48%, #e2e8f0 48%, #e2e8f0 52%, transparent 52%)', backgroundColor: '#334155' };
        case 'asphalt_1': return { backgroundColor: '#475569', transform };
        case 'asphalt_2': return { backgroundImage: 'linear-gradient(90deg, transparent 45%, #eab308 45%, #eab308 47%, transparent 47%, transparent 53%, #eab308 53%, #eab308 55%, transparent 55%)', backgroundColor: '#334155', transform };
        case 'asphalt_4': return { backgroundImage: 'linear-gradient(90deg, transparent 24%, #fff 24%, #fff 26%, transparent 26%, transparent 48%, #eab308 48%, #eab308 52%, transparent 52%, transparent 74%, #fff 74%, #fff 76%, transparent 76%)', backgroundColor: '#1e293b', transform };
        case 'brick': return { backgroundImage: 'repeating-linear-gradient(45deg, #7c2d12 0, #7c2d12 10px, #9a3412 0, #9a3412 20px)', transform };
        case 'glass': return { backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 100%)', backgroundColor: '#3b82f6', transform };
        case 'concrete': return { backgroundImage: 'url("https://www.transparenttextures.com/patterns/concrete-wall.png")', backgroundColor: '#94a3b8', transform };
        case 'tech': return { backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '4px 4px', backgroundColor: '#1e1b4b', transform };
        case 'grass': return { backgroundColor: '#10b981', backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)', backgroundSize: '8px 8px' };
        default: return { transform };
    }
};

export const Cube3D: React.FC<{
    width: number;
    depth: number;
    height: number;
    x?: number;
    y?: number;
    z?: number;
    colorClass: string;
    textureStyle: React.CSSProperties;
    label?: React.ReactNode;
}> = ({ width, depth, height, x = 0, y = 0, z = 0, colorClass, textureStyle, label }) => {
    return (
        <div className="absolute" style={{ 
            left: x, top: y, width, height: depth, 
            transform: `translateZ(${z}px)`, 
            transformStyle: 'preserve-3d',
            pointerEvents: 'none' 
        }}>
            <div className={`absolute ${colorClass} origin-bottom`} style={{ width: `${width}px`, height: `${height}px`, bottom: 0, left: 0, transform: `rotateX(-90deg)`, filter: 'brightness(0.8)', ...textureStyle, backfaceVisibility: 'hidden' }} />
            <div className={`absolute ${colorClass} origin-right`} style={{ width: `${depth}px`, height: `${height}px`, top: 0, right: 0, transform: `rotateY(-90deg) rotateZ(90deg)`, transformOrigin: 'right bottom', filter: 'brightness(0.6)', ...textureStyle, backfaceVisibility: 'hidden' }} />
            <div className={`absolute ${colorClass} origin-top`} style={{ width: `${width}px`, height: `${height}px`, top: 0, left: 0, transform: `rotateX(90deg)`, filter: 'brightness(0.7)', ...textureStyle, backfaceVisibility: 'hidden' }} />
            <div className={`absolute ${colorClass} origin-left`} style={{ width: `${depth}px`, height: `${height}px`, top: 0, left: 0, transform: `rotateY(90deg) rotateZ(-90deg)`, transformOrigin: 'left bottom', filter: 'brightness(0.9)', ...textureStyle, backfaceVisibility: 'hidden' }} />
            <div className={`absolute ${colorClass}`} style={{ width: `${width}px`, height: `${depth}px`, top: 0, left: 0, transform: `translateZ(${height}px)`, filter: 'brightness(1.1)', ...textureStyle, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                {label}
            </div>
        </div>
    );
};

export const Building3DBox: React.FC<{
    width: number;
    depth: number;
    height: number;
    colorClass: string;
    textureStyle: React.CSSProperties;
    cell: CellData;
}> = ({ width, depth, height, colorClass, textureStyle, cell }) => {
    if (cell.building === BuildingType.LECTURE_HALL) {
        const baseHeight = height * 0.6;
        const topHeight = height * 0.4;
        const topScale = 0.6;
        const topWidth = width * topScale;
        const topDepth = depth * topScale;
        return (
            <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
                <Cube3D width={width} depth={depth} height={baseHeight} colorClass={colorClass} textureStyle={textureStyle} />
                <Cube3D width={topWidth} depth={topDepth} height={topHeight} x={(width - topWidth)/2} y={(depth - topDepth)/2} z={baseHeight} colorClass={colorClass} textureStyle={textureStyle} label={<div className="transform -rotate-45 text-white/50 text-[10px] whitespace-nowrap overflow-hidden">{cell.customName || "教学楼"}</div>} />
            </div>
        );
    }
    return (
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            <Cube3D width={width} depth={depth} height={height} colorClass={colorClass} textureStyle={textureStyle} label={<div className="transform -rotate-45 text-white/50 text-[10px] whitespace-nowrap overflow-hidden">{cell.customName || BUILDINGS[cell.building].name}</div>} />
        </div>
    );
};

export const SimpleLineChart: React.FC<{ data: FinanceHistoryPoint[], dataKeys: (keyof FinanceHistoryPoint)[], colors: string[], height?: number }> = ({ data, dataKeys, colors, height = 150 }) => {
    if (!data || data.length < 2) return <div className="h-[150px] flex items-center justify-center text-xs text-stone-600">数据不足</div>;
    const maxVal = Math.max(...data.map(d => Math.max(...dataKeys.map(k => Math.abs(d[k] as number)))));
    const minVal = Math.min(...data.map(d => Math.min(...dataKeys.map(k => d[k] as number)))); 
    const range = maxVal - Math.min(0, minVal); 
    const effectiveMin = Math.min(0, minVal);
    const points = dataKeys.map(key => data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d[key] as number - effectiveMin) / (range || 1)) * 100}`).join(' '));
    return (
        <div className="relative w-full" style={{ height: `${height}px` }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {effectiveMin < 0 && <line x1="0" y1={100 - ((0 - effectiveMin) / range) * 100} x2="100" y2={100 - ((0 - effectiveMin) / range) * 100} stroke="#475569" strokeWidth="0.5" strokeDasharray="2" />}
                {points.map((p, i) => <polyline key={i} points={p} fill="none" stroke={colors[i]} strokeWidth="2" vectorEffect="non-scaling-stroke" />)}
            </svg>
            <div className="absolute top-0 right-0 text-[10px] text-stone-500 bg-stone-900/80 px-1 rounded">Max: {formatMoney(maxVal)}</div>
            <div className="absolute bottom-0 right-0 text-[10px] text-stone-500 bg-stone-900/80 px-1 rounded">Min: {formatMoney(minVal)}</div>
        </div>
    );
};

export const BudgetPieChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let cumulativePercent = 0;
    if (total === 0) return <div className="w-32 h-32 rounded-full bg-stone-800 flex items-center justify-center text-[10px] text-stone-500">无预算</div>;
    return (
        <div className="relative w-32 h-32">
            <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full overflow-visible">
                {data.map((slice, i) => {
                    if (slice.value === 0) return null;
                    const startP = cumulativePercent;
                    const sliceP = slice.value / total;
                    cumulativePercent += sliceP;
                    const endP = cumulativePercent;
                    if (sliceP === 1) return <circle key={i} cx="0" cy="0" r="1" fill={slice.color} />;
                    const [sx, sy] = [Math.cos(2 * Math.PI * startP), Math.sin(2 * Math.PI * startP)];
                    const [ex, ey] = [Math.cos(2 * Math.PI * endP), Math.sin(2 * Math.PI * endP)];
                    return <path key={i} d={`M 0 0 L ${sx} ${sy} A 1 1 0 ${sliceP > 0.5 ? 1 : 0} 1 ${ex} ${ey} Z`} fill={slice.color} stroke="#1c1917" strokeWidth="0.02" />;
                })}
            </svg>
        </div>
    );
};
