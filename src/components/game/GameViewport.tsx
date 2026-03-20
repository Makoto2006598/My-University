
import React from 'react';
import { CellData, BuildingType, ConstructionStatus, GRID_SIZE } from '../../types';
import { getTextureStyle } from './Visuals';
import { BUILDINGS, VARIANTS } from '../../data/gameData';
import { formatMoney, checkConnectedRoadAdjacency } from '../../utils/gameUtils';
import { Hammer, AlertTriangle } from 'lucide-react';

interface GameViewportProps {
    grid: CellData[][];
    viewState: { x: number, y: number, zoom: number };
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
    grid, viewState, appSettings,
    onMouseDown, onMouseMove, onMouseUp, onMouseLeave, onContextMenu,
    hoveredCell, setHoveredCell, dragPath, selectedTool, isRotated, selectedVariantIndex, onWheel,
    onTouchStart, onTouchMove, onTouchEnd
}) => {
    const CELL_SIZE_PX = 37;

    // Shared hit-test: screen coords -> grid cell (2D only)
    const screenToGrid = (clientX: number, clientY: number, rect: DOMRect): { x: number, y: number } | null => {
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const worldX = (mx - centerX) / viewState.zoom + viewState.x;
        const worldY = (my - centerY) / viewState.zoom + viewState.y;

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

        // Road connectivity check
        const def = BUILDINGS[tool];
        const needsRoad = def.requiresRoadConnection !== false && ![BuildingType.ROAD, BuildingType.CITY_ROAD].includes(tool);
        if (needsRoad && tool !== BuildingType.SCHOOL_GATE) {
            const roadCheck = checkConnectedRoadAdjacency(grid, x, y, w, h);
            if (!roadCheck.valid) {
                return { valid: false, reason: roadCheck.reason || '需要连接道路' };
            }
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

        const def = BUILDINGS[selectedTool];
        const serviceRadius = def.serviceRadius;
        const serviceColors: Record<string, string> = {
            food: 'border-orange-400/40 bg-orange-400/10',
            study: 'border-blue-400/40 bg-blue-400/10',
            recreation: 'border-green-400/40 bg-green-400/10'
        };

        return (
            <>
                {/* 服务半径预览圈 */}
                {valid && serviceRadius && def.serviceType && (
                    <div className={`absolute pointer-events-none z-40 rounded-full border-2 border-dashed ${serviceColors[def.serviceType] || ''}`}
                        style={{
                            left: (hoveredCell.x + width / 2) * CELL_SIZE_PX - serviceRadius * CELL_SIZE_PX,
                            top: (hoveredCell.y + height / 2) * CELL_SIZE_PX - serviceRadius * CELL_SIZE_PX,
                            width: serviceRadius * 2 * CELL_SIZE_PX,
                            height: serviceRadius * 2 * CELL_SIZE_PX,
                        }}
                    />
                )}
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
                    }}
                >
                    <span className="text-white drop-shadow font-bold">{def.icon} {width}x{height}</span>
                    <span className={`text-[9px] font-mono drop-shadow mt-0.5 ${valid ? 'text-emerald-200' : 'text-red-200'}`}>
                        {valid ? formatMoney(cost) : reason}
                    </span>
                </div>
            </>
        );
    };

    return (
        <div
            className="flex-1 relative overflow-hidden bg-sky-100 cursor-crosshair select-none h-full w-full"
            style={{ touchAction: 'none' }}
            onMouseDown={onMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onWheel={onWheel}
            onTouchStart={(e) => {
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
                className="absolute inset-0 origin-center will-change-transform transition-transform duration-75 ease-out"
                style={{
                    transform: `
                        translateX(${ -viewState.x * viewState.zoom }px)
                        translateY(${ -viewState.y * viewState.zoom }px)
                        scale(${viewState.zoom})
                    `
                }}
            >
                {/* Ground Plane */}
                <div
                    className="absolute bg-[#e6efc5] shadow-2xl"
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
                            }}
                            onContextMenu={(e) => onContextMenu(e, x, y)}
                        >
                            {/* Construction Overlay */}
                            {cell.constructionStatus === ConstructionStatus.CONSTRUCTING && (
                                <div className="absolute inset-0 z-10 bg-orange-100/80 border border-yellow-500/50 overflow-hidden">
                                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'repeating-linear-gradient(45deg, #fbbf24 0, #fbbf24 5px, transparent 5px, transparent 10px)'}}></div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-orange-800 text-[10px] font-bold">
                                        <Hammer className="w-6 h-6 text-orange-500 animate-bounce mb-1" />
                                        <span>{Math.floor(((BUILDINGS[cell.building].constructionTime - (cell.constructionLeft || 0)) / Math.max(1, BUILDINGS[cell.building].constructionTime)) * 100)}%</span>
                                    </div>
                                </div>
                            )}

                            {/* 2D Building Label */}
                            {cell.building !== BuildingType.NONE && cell.building !== BuildingType.ROAD && cell.building !== BuildingType.CITY_ROAD && cell.building !== BuildingType.FENCE && cell.isOrigin && (
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

                            {/* 未连通道路警告 */}
                            {cell.building === BuildingType.ROAD && cell.isConnectedToCampus === false && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                                </div>
                            )}

                            {/* 服务覆盖可视化 */}
                            {cell.serviceCoverage && cell.building === BuildingType.NONE && (
                                <div className={`absolute inset-0 pointer-events-none ${
                                    cell.serviceCoverage.food ? 'bg-orange-400/8' :
                                    cell.serviceCoverage.study ? 'bg-blue-400/8' :
                                    cell.serviceCoverage.recreation ? 'bg-green-400/8' : ''
                                }`}></div>
                            )}

                            {/* Zone Highlight */}
                            {cell.isZoned && cell.building === BuildingType.NONE && <div className="absolute inset-0 bg-orange-500/10 border border-orange-500/20"></div>}
                        </div>
                    )))}

                    {/* Ghost Building for Placement */}
                    {renderGhost()}
                </div>
            </div>
        </div>
    );
});
