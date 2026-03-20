
import React from 'react';
import { CellData, BuildingType, ConstructionStatus, GRID_SIZE } from '../../types';
import { Building3DBox, getTextureStyle } from './Visuals';
import { BUILDINGS, VARIANTS } from '../../data/gameData';
import { formatMoney } from '../../utils/gameUtils';
import { checkRoadAdjacency } from '../../utils/gameUtils';
import { Hammer } from 'lucide-react';

interface GameViewportProps {
    grid: CellData[][]; // Only pass grid, not full GameState, for memoization
    viewState: { x: number, y: number, zoom: number, pitch: number, yaw: number };
    is2DMode: boolean;
    appSettings: any;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
    onContextMenu: (e: React.MouseEvent, x: number, y: number) => void;
    hoveredCell: { x: number, y: number } | null;
    setHoveredCell: (cell: { x: number, y: number } | null) => void;
    dragPath: { x: number, y: number }[];
    selectedTool: BuildingType;
    isRotated: boolean;
    selectedVariantIndex: number;
    onWheel: (e: React.WheelEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
}

// Wrap in memo to prevent re-renders when money/students change, only when grid changes
export const GameViewport: React.FC<GameViewportProps> = React.memo(({
    grid, viewState, is2DMode, appSettings,
    onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onContextMenu,
    hoveredCell, setHoveredCell, dragPath, selectedTool, isRotated, selectedVariantIndex, onWheel,
    onTouchStart, onTouchMove, onTouchEnd
}) => {
    const CELL_SIZE_PX = 37;

    // Shared hit-test: screen coords -> grid cell
    const screenToGrid = (clientX: number, clientY: number, rect: DOMRect): { x: number, y: number } | null => {
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const relX = mx - centerX;
        const relY = my - centerY;

        const P = 2000;
        const zoom = viewState.zoom;
        const pitchRad = (viewState.pitch * Math.PI) / 180;
        const yawRad = (viewState.yaw * Math.PI) / 180;
        const cosP = Math.cos(pitchRad);
        const sinP = Math.sin(pitchRad);
        const vx = viewState.x;
        const vy = viewState.y;

        const tanP = sinP / (cosP || 0.0001);
        const denominator = zoom * P - relY * tanP * zoom;
        if (Math.abs(denominator) < 0.001) return null;

        const B = (relY * (P + vy * tanP * zoom)) / denominator;
        const ry = (B + vy) / (cosP || 0.0001);
        const tz = -(B + vy) * tanP * zoom;
        const D = P / (P - tz);
        const A = relX / (zoom * D);
        const rx = A + vx;

        const cosY = Math.cos(-yawRad);
        const sinY = Math.sin(-yawRad);
        const worldX = rx * cosY - ry * sinY;
        const worldY = rx * sinY + ry * cosY;

        const gridX = Math.floor((worldX + (GRID_SIZE * CELL_SIZE_PX) / 2) / CELL_SIZE_PX);
        const gridY = Math.floor((worldY + (GRID_SIZE * CELL_SIZE_PX) / 2) / CELL_SIZE_PX);

        if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
            return { x: gridX, y: gridY };
        }
        return null;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        onMouseMove(e);
        const rect = e.currentTarget.getBoundingClientRect();
        const cell = screenToGrid(e.clientX, e.clientY, rect);
        if (cell) {
            if (!hoveredCell || hoveredCell.x !== cell.x || hoveredCell.y !== cell.y) {
                setHoveredCell(cell);
            }
        } else {
            setHoveredCell(null);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        onTouchMove(e);
        // Update hovered cell from first touch point
        if (e.touches.length === 1) {
            const rect = e.currentTarget.getBoundingClientRect();
            const touch = e.touches[0];
            const cell = screenToGrid(touch.clientX, touch.clientY, rect);
            if (cell) {
                if (!hoveredCell || hoveredCell.x !== cell.x || hoveredCell.y !== cell.y) {
                    setHoveredCell(cell);
                }
            } else {
                setHoveredCell(null);
            }
        }
    };

    // Helper to check placement validity
    const checkPlacementValid = (x: number, y: number, w: number, h: number, tool: BuildingType): { valid: boolean; reason?: string } => {
        // Bounds check
        if (x + w > GRID_SIZE || y + h > GRID_SIZE) return { valid: false, reason: '超出边界' };

        // Collision check
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                const cell = grid[y + dy]?.[x + dx];
                if (!cell) return { valid: false, reason: '超出边界' };
                if (cell.building !== BuildingType.NONE && cell.building !== BuildingType.FENCE) {
                    return { valid: false, reason: '被占用' };
                }
            }
        }

        // Road adjacency check
        const needsRoad = ![BuildingType.PARK, BuildingType.FENCE, BuildingType.ROAD, BuildingType.CITY_ROAD].includes(tool);
        if (needsRoad && tool !== BuildingType.SCHOOL_GATE && !checkRoadAdjacency(grid, x, y, w, h)) {
            return { valid: false, reason: '需要连接道路' };
        }

        return { valid: true };
    };

    // Helper to render ghost building
    const renderGhost = () => {
        if (!hoveredCell) return null;
        if (selectedTool === BuildingType.NONE || selectedTool === BuildingType.ROAD) return null;

        const variants = VARIANTS[selectedTool];
        const variant = variants && variants.length > 0 ? (variants[selectedVariantIndex] || variants[0]) : undefined;
        let width = 1, height = 1;

        if (variant) {
            width = variant.width;
            height = variant.height;
        } else if (BUILDINGS[selectedTool]) {
            width = BUILDINGS[selectedTool].width || 1;
            height = BUILDINGS[selectedTool].height || 1;
        }

        if (isRotated) {
            const temp = width;
            width = height;
            height = temp;
        }

        const cost = variant?.cost || BUILDINGS[selectedTool].cost;
        const { valid, reason } = checkPlacementValid(hoveredCell.x, hoveredCell.y, width, height, selectedTool);

        return (
            <div className={`absolute border-2 pointer-events-none z-50 transition-all duration-75 flex flex-col items-center justify-center font-bold text-xs ${
                valid
                    ? 'border-emerald-400/70 bg-emerald-500/25'
                    : 'border-red-400/70 bg-red-500/25'
            }`}
                style={{
                    left: hoveredCell.x * CELL_SIZE_PX,
                    top: hoveredCell.y * CELL_SIZE_PX,
                    width: width * CELL_SIZE_PX,
                    height: height * CELL_SIZE_PX,
                    transform: `translateZ(1px)`
                }}
            >
                <span className="text-white drop-shadow font-bold">{BUILDINGS[selectedTool].icon} {width}x{height}</span>
                <span className={`text-[9px] font-mono drop-shadow mt-0.5 ${valid ? 'text-emerald-200' : 'text-red-200'}`}>
                    {valid ? formatMoney(cost) : reason}
                </span>
            </div>
        );
    };

    return (
        <div
            className="flex-1 relative overflow-hidden bg-sky-100 cursor-crosshair select-none perspective-1000 h-full w-full"
            style={{ touchAction: 'none' }}
            onMouseDown={onMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onWheel={onWheel}
            onTouchStart={(e) => {
                // Update hovered cell on touch start for single-finger taps
                if (e.touches.length === 1) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const touch = e.touches[0];
                    const cell = screenToGrid(touch.clientX, touch.clientY, rect);
                    if (cell) setHoveredCell(cell);
                }
                onTouchStart(e);
            }}
            onTouchMove={handleTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div 
                className="absolute inset-0 transform-style-3d origin-center will-change-transform transition-transform duration-75 ease-out"
                style={{
                    transform: `
                        perspective(2000px)
                        translateX(${ -viewState.x * viewState.zoom }px)
                        translateY(${ -viewState.y * viewState.zoom }px)
                        scale(${viewState.zoom})
                        rotateX(${viewState.pitch}deg)
                        rotateZ(${viewState.yaw}deg)
                    `
                }}
            >
                {/* The Map Plane (Ground) */}
                <div 
                    className="absolute bg-[#e6efc5] shadow-2xl transform-style-3d"
                    style={{
                        width: GRID_SIZE * CELL_SIZE_PX,
                        height: GRID_SIZE * CELL_SIZE_PX,
                        left: '50%',
                        top: '50%',
                        marginLeft: -(GRID_SIZE * CELL_SIZE_PX) / 2,
                        marginTop: -(GRID_SIZE * CELL_SIZE_PX) / 2,
                        backgroundImage: 'radial-gradient(#a3cf62 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        backgroundColor: '#ecfccb'
                    }}
                >
                    {/* Render Cells */}
                    {grid.map((row, y) => row.map((cell, x) => (
                        <div 
                            key={`${x}-${y}`}
                            className={`absolute transition-colors duration-200 ${
                                hoveredCell?.x === x && hoveredCell?.y === y ? 'bg-white/30' : ''
                            } ${
                                dragPath.some(p => p.x === x && p.y === y) ? 'bg-blue-500/50' : ''
                            }`}
                            style={{
                                left: x * CELL_SIZE_PX,
                                top: y * CELL_SIZE_PX,
                                width: CELL_SIZE_PX,
                                height: CELL_SIZE_PX,
                                ...getTextureStyle(cell),
                                transformStyle: 'preserve-3d',
                                backfaceVisibility: 'hidden',
                            }}
                            onContextMenu={(e) => onContextMenu(e, x, y)}
                        >
                            {/* Construction Overlay */}
                            {cell.constructionStatus === ConstructionStatus.CONSTRUCTING && (
                                <div className="absolute inset-0 z-10 bg-orange-100/80 border border-yellow-500/50 overflow-hidden" style={{transform: 'translateZ(1px)'}}>
                                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'repeating-linear-gradient(45deg, #fbbf24 0, #fbbf24 5px, transparent 5px, transparent 10px)'}}></div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-orange-800 text-[10px] font-bold">
                                        <Hammer className="w-6 h-6 text-orange-500 animate-bounce mb-1" />
                                        <span>{Math.floor(((BUILDINGS[cell.building].constructionTime - (cell.constructionLeft || 0)) / Math.max(1, BUILDINGS[cell.building].constructionTime)) * 100)}%</span>
                                    </div>
                                </div>
                            )}

                            {/* Render Building 3D Object if exists (only in 3D mode) */}
                            {!is2DMode && cell.building !== BuildingType.NONE && cell.building !== BuildingType.ROAD && cell.building !== BuildingType.CITY_ROAD && cell.building !== BuildingType.FENCE && cell.isOrigin && (
                                <Building3DBox
                                    width={
                                        (cell.rotation ? (VARIANTS[cell.building]?.find(v => v.id === cell.variantId)?.height || 1) : (VARIANTS[cell.building]?.find(v => v.id === cell.variantId)?.width || 1)) * CELL_SIZE_PX
                                    }
                                    depth={
                                        (cell.rotation ? (VARIANTS[cell.building]?.find(v => v.id === cell.variantId)?.width || 1) : (VARIANTS[cell.building]?.find(v => v.id === cell.variantId)?.height || 1)) * CELL_SIZE_PX
                                    }
                                    height={
                                        cell.constructionStatus === ConstructionStatus.CONSTRUCTING
                                        ? 10
                                        : 40
                                    }
                                    colorClass={
                                        cell.constructionStatus === ConstructionStatus.CONSTRUCTING
                                        ? 'bg-yellow-500/50'
                                        : BUILDINGS[cell.building].color
                                    }
                                    textureStyle={getTextureStyle(cell)}
                                    cell={cell}
                                />
                            )}
                            {/* 2D mode: flat building label */}
                            {is2DMode && cell.building !== BuildingType.NONE && cell.building !== BuildingType.ROAD && cell.building !== BuildingType.CITY_ROAD && cell.building !== BuildingType.FENCE && cell.isOrigin && (
                                <div className={`absolute ${BUILDINGS[cell.building].color} border border-white/30 flex items-center justify-center pointer-events-none z-10`}
                                    style={{
                                        width: (cell.rotation ? (VARIANTS[cell.building]?.find(v => v.id === cell.variantId)?.height || 1) : (VARIANTS[cell.building]?.find(v => v.id === cell.variantId)?.width || 1)) * CELL_SIZE_PX,
                                        height: (cell.rotation ? (VARIANTS[cell.building]?.find(v => v.id === cell.variantId)?.width || 1) : (VARIANTS[cell.building]?.find(v => v.id === cell.variantId)?.height || 1)) * CELL_SIZE_PX,
                                    }}
                                >
                                    <span className="text-white text-[10px] font-bold drop-shadow truncate px-1">
                                        {BUILDINGS[cell.building].icon} {cell.customName || BUILDINGS[cell.building].name}
                                    </span>
                                </div>
                            )}
                            {/* Flat Elements */}
                            {(cell.building === BuildingType.ROAD || cell.building === BuildingType.CITY_ROAD || cell.building === BuildingType.PARK || cell.building === BuildingType.FENCE) && (
                                <div className="absolute inset-0" style={{transform: 'translateZ(0.5px)'}} />
                            )}
                            
                            {/* Zone Highlight */}
                            {cell.isZoned && cell.building === BuildingType.NONE && <div className="absolute inset-0 bg-orange-500/10 border border-orange-500/20"></div>}
                        </div>
                    )))}

                    {/* Ghost Building for Placement */}
                    {renderGhost()}
                </div>
            </div>
            
            {/* Compass / Orientation Indicator */}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full border border-orange-200 pointer-events-none shadow-md">
                <div className="w-8 h-8 rounded-full border-2 border-orange-400 relative flex items-center justify-center" style={{ transform: `rotate(${-viewState.yaw}deg)` }}>
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-red-500 absolute -top-1"></div>
                    <div className="text-[8px] font-bold text-stone-600">N</div>
                </div>
            </div>
        </div>
    );
});
