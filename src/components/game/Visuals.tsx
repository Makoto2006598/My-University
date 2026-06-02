
import React from 'react';
import { BuildingType, CellData, FinanceHistoryPoint, ConstructionStatus } from '../../types';
import { BUILDINGS, VARIANTS } from '../../data/gameData';
import { formatMoney } from '../../utils/gameUtils';

export const getBuilding3DHeight = (type: BuildingType, variantId?: string): number => {
    const variants = VARIANTS[type];
    const variant = variants?.find(v => v.id === variantId);
    const area = variant ? variant.width * variant.height : 1;
    switch(type) {
        case BuildingType.DORMITORY: return 30 + Math.sqrt(area) * 8;
        case BuildingType.LECTURE_HALL: return 40 + Math.sqrt(area) * 10;
        case BuildingType.LABORATORY: return 45 + Math.sqrt(area) * 8;
        case BuildingType.LIBRARY: return 60 + Math.sqrt(area) * 10;
        case BuildingType.SCHOOL_GATE: return 30 + Math.sqrt(area) * 5;
        case BuildingType.CAFETERIA: return 20 + Math.sqrt(area) * 5;
        case BuildingType.PARK: return 5;
        default: return 0;
    }
};

/**
 * 根据道路形态生成路口纹理样式
 */
const getRoadShapeStyle = (cell: CellData): React.CSSProperties => {
    const shape = cell.roadShape;
    const isDisconnected = cell.isConnectedToCampus === false;
    const baseColor = isDisconnected ? '#6b2121' : '#475569';
    const lineColor = isDisconnected ? '#a85454' : '#94a3b8';
    const yellowLine = '#eab308';

    // 基础：深灰路面
    const base: React.CSSProperties = { backgroundColor: baseColor };

    if (!shape || shape === 'isolated') {
        return { ...base, border: `1px dashed ${lineColor}`, boxSizing: 'border-box' as const };
    }

    // 直道
    if (shape === 'straight_h') {
        return { ...base, backgroundImage: `linear-gradient(0deg, transparent 40%, ${lineColor} 40%, ${lineColor} 44%, transparent 44%, transparent 56%, ${lineColor} 56%, ${lineColor} 60%, transparent 60%)` };
    }
    if (shape === 'straight_v') {
        return { ...base, backgroundImage: `linear-gradient(90deg, transparent 40%, ${lineColor} 40%, ${lineColor} 44%, transparent 44%, transparent 56%, ${lineColor} 56%, ${lineColor} 60%, transparent 60%)` };
    }

    // 十字路口
    if (shape === 'cross') {
        return { ...base, backgroundImage: `linear-gradient(0deg, transparent 40%, ${yellowLine}44 40%, ${yellowLine}44 60%, transparent 60%), linear-gradient(90deg, transparent 40%, ${yellowLine}44 40%, ${yellowLine}44 60%, transparent 60%)` };
    }

    // T字路口 - 用黄色虚线标记
    if (shape.startsWith('t_')) {
        return { ...base, backgroundImage: `radial-gradient(circle at 50% 50%, ${yellowLine}33 2px, transparent 4px)`, backgroundSize: '8px 8px' };
    }

    // 弯道 - 用圆弧暗示转弯
    if (shape.startsWith('corner_')) {
        const positions: Record<string, string> = {
            corner_ne: '100% 0%', corner_nw: '0% 0%',
            corner_se: '100% 100%', corner_sw: '0% 100%'
        };
        return { ...base, backgroundImage: `radial-gradient(circle at ${positions[shape] || '50% 50%'}, transparent 40%, ${lineColor}44 42%, ${lineColor}44 58%, transparent 60%)` };
    }

    // 死胡同 - 末端标记
    if (shape.startsWith('dead_end_')) {
        const dirs: Record<string, string> = {
            dead_end_n: 'to bottom', dead_end_s: 'to top',
            dead_end_e: 'to left', dead_end_w: 'to right'
        };
        return { ...base, backgroundImage: `linear-gradient(${dirs[shape] || 'to bottom'}, ${lineColor}66 0%, transparent 30%)` };
    }

    return base;
};

export const getTextureStyle = (cell: CellData): React.CSSProperties => {
    if (cell.building === BuildingType.NONE) return {};

    // 道路使用形态纹理系统
    if (cell.building === BuildingType.ROAD) {
        return getRoadShapeStyle(cell);
    }
    if (cell.building === BuildingType.CITY_ROAD) {
        return { backgroundColor: '#334155', backgroundImage: 'linear-gradient(90deg, transparent 48%, #e2e8f0 48%, #e2e8f0 52%, transparent 52%)' };
    }

    const def = BUILDINGS[cell.building];
    let texture = def.textureType || '';
    const rotationDeg = cell.rotation ? 90 : 0;
    const transform = `rotate(${rotationDeg}deg)`;
    switch (texture) {
        case 'paved': return { backgroundImage: 'repeating-linear-gradient(45deg, #78350f 0, #78350f 2px, #92400e 0, #92400e 50%)', backgroundSize: '10px 10px' };
        case 'asphalt': return { backgroundColor: '#475569', transform };
        case 'brick': return { backgroundImage: 'repeating-linear-gradient(45deg, #7c2d12 0, #7c2d12 10px, #9a3412 0, #9a3412 20px)', transform };
        case 'glass': return { backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 100%)', backgroundColor: '#3b82f6', transform };
        case 'concrete': return { backgroundColor: '#94a3b8', transform };
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
    opacity?: number;
}> = ({ width, depth, height, x = 0, y = 0, z = 0, colorClass, textureStyle, label, opacity = 1 }) => {
    return (
        <div className="absolute" style={{
            left: x, top: y, width, height: depth,
            transform: `translateZ(${z}px)`,
            transformStyle: 'preserve-3d',
            pointerEvents: 'none',
            opacity
        }}>
            <div className={`absolute ${colorClass} origin-bottom`} style={{ ...textureStyle, width: `${width}px`, height: `${height}px`, bottom: 0, left: 0, transform: `rotateX(-90deg)`, filter: 'brightness(0.8)', backfaceVisibility: 'hidden' }} />
            <div className={`absolute ${colorClass} origin-right`} style={{ ...textureStyle, width: `${depth}px`, height: `${height}px`, top: 0, right: 0, transform: `rotateY(-90deg) rotateZ(90deg)`, transformOrigin: 'right bottom', filter: 'brightness(0.6)', backfaceVisibility: 'hidden' }} />
            <div className={`absolute ${colorClass} origin-top`} style={{ ...textureStyle, width: `${width}px`, height: `${height}px`, top: 0, left: 0, transform: `rotateX(90deg)`, filter: 'brightness(0.7)', backfaceVisibility: 'hidden' }} />
            <div className={`absolute ${colorClass} origin-left`} style={{ ...textureStyle, width: `${depth}px`, height: `${height}px`, top: 0, left: 0, transform: `rotateY(90deg) rotateZ(-90deg)`, transformOrigin: 'left bottom', filter: 'brightness(0.9)', backfaceVisibility: 'hidden' }} />
            <div className={`absolute ${colorClass}`} style={{ ...textureStyle, width: `${width}px`, height: `${depth}px`, top: 0, left: 0, transform: `translateZ(${height}px)`, filter: 'brightness(1.1)', backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                {label}
            </div>
        </div>
    );
};

export const Building3DBox: React.FC<{
    width: number;
    depth: number;
    colorClass: string;
    textureStyle: React.CSSProperties;
    cell: CellData;
}> = ({ width, depth, colorClass, textureStyle, cell }) => {
    const isConstructing = cell.constructionStatus === ConstructionStatus.CONSTRUCTING;
    const buildingHeight = isConstructing ? 10 : getBuilding3DHeight(cell.building, cell.variantId);
    const buildingName = cell.customName || BUILDINGS[cell.building].name;
    const buildingIcon = BUILDINGS[cell.building].icon;

    const label = (
        <div className="transform -rotate-45 text-white/70 text-[10px] whitespace-nowrap overflow-hidden flex items-center gap-1 font-medium drop-shadow-sm">
            <span>{buildingIcon}</span>
            <span>{buildingName}</span>
        </div>
    );

    if (cell.building === BuildingType.LECTURE_HALL && !isConstructing) {
        const baseHeight = buildingHeight * 0.6;
        const topHeight = buildingHeight * 0.4;
        const topScale = 0.65;
        const topWidth = width * topScale;
        const topDepth = depth * topScale;
        return (
            <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
                <Cube3D width={width} depth={depth} height={baseHeight} colorClass={colorClass} textureStyle={textureStyle} />
                <Cube3D width={topWidth} depth={topDepth} height={topHeight} x={(width - topWidth)/2} y={(depth - topDepth)/2} z={baseHeight} colorClass={colorClass} textureStyle={textureStyle} label={label} />
            </div>
        );
    }

    if (cell.building === BuildingType.LIBRARY && !isConstructing) {
        const baseHeight = buildingHeight * 0.5;
        const topHeight = buildingHeight * 0.5;
        const topWidth = width * 0.5;
        const topDepth = depth * 0.7;
        return (
            <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
                <Cube3D width={width} depth={depth} height={baseHeight} colorClass={colorClass} textureStyle={textureStyle} />
                <Cube3D width={topWidth} depth={topDepth} height={topHeight} x={(width - topWidth)/2} y={(depth - topDepth)/2} z={baseHeight} colorClass="bg-teal-500" textureStyle={textureStyle} label={label} />
            </div>
        );
    }

    if (cell.building === BuildingType.SCHOOL_GATE && !isConstructing) {
        const pillarWidth = Math.min(width * 0.25, 15);
        const archHeight = buildingHeight * 0.7;
        const topHeight = buildingHeight * 0.3;
        return (
            <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
                <Cube3D width={pillarWidth} depth={depth} height={archHeight} colorClass={colorClass} textureStyle={textureStyle} />
                <Cube3D width={pillarWidth} depth={depth} height={archHeight} x={width - pillarWidth} colorClass={colorClass} textureStyle={textureStyle} />
                <Cube3D width={width} depth={depth} height={topHeight} z={archHeight} colorClass="bg-orange-500" textureStyle={textureStyle} label={label} />
            </div>
        );
    }

    return (
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            <Cube3D
                width={width} depth={depth} height={buildingHeight}
                colorClass={isConstructing ? 'bg-yellow-500/50' : colorClass}
                textureStyle={textureStyle}
                label={isConstructing ? undefined : label}
                opacity={isConstructing ? 0.7 : 1}
            />
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
