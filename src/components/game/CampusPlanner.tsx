
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    GRID_SIZE, BuildingType, BuildingDef, CellData, UniType1, UniType2, Faculty, 
    CollegeType, FacultyTitle, RecruitmentMethod, UniversityScale, UniversityRank, 
    GameSettings, ConstructionStatus, VariantDef, AdmissionsPhase, SidebarTab,
    INITIAL_MONEY_PUBLIC, INITIAL_MONEY_PRIVATE, MissionStatus
} from '../../types';
import { 
    DollarSign, School, Save, Info, Settings, Play, FastForward, UserPlus, ArrowLeft, X
} from 'lucide-react';
import { COLLEGES_DEF, BUILDINGS, VARIANTS, generateName, MISSIONS_DEF } from '../../data/gameData';
import { 
    generateId, formatMoney, getGameDate, calculateStats, getThickLinePoints, createInitialGrid 
} from '../../utils/gameUtils';
import { SaveManager } from '../../utils/saveManager';
import { useGameLogic } from './hooks/useGameLogic';

// UI Components
import { GameViewport } from './GameViewport';
import { FinancePanel } from './panels/FinancePanel';
import { AcademicPanel } from './panels/AcademicPanel';
import { HRPanel } from './panels/HRPanel';
import { AdmissionsPanel } from './panels/AdmissionsPanel';
import { OverviewPanel } from './panels/OverviewPanel';
import { PublicityPanel } from './panels/PublicityPanel';
import { LiaisonPanel } from './panels/LiaisonPanel';
import { TopBar } from './ui/TopBar';
import { GameHUD } from './ui/GameHUD';
import { BuildingInspector } from './ui/BuildingInspector';
import { GameLogo } from './ui/GameLogo';

// Modals
import { SettingsModal } from './modals/SettingsModal';
import { SaveLoadModal } from './modals/SaveLoadModal';
import { 
    RecruitmentConfigModal, RecruitmentResultModal, BudgetModal, 
    AdmissionsPrepModal, OpeningCeremonyModal, GrandOpeningModal, FacultySelectModal 
} from './modals/EventModals';

type AppPhase = 'MAIN_MENU' | 'SELECT_SLOT' | 'SETUP' | 'GAME';

export const CampusPlanner: React.FC = () => {
  const [appPhase, setAppPhase] = useState<AppPhase>('MAIN_MENU');
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [setupData, setSetupData] = useState({ name: "未命名大学", type1: UniType1.PUBLIC, type2: UniType2.RESEARCH });
  const [refreshKey, setRefreshKey] = useState(0); 
  const [appSettings, setAppSettings] = useState<GameSettings>({ musicVolume: 0.5, sfxVolume: 0.5, brightness: 1.0, cameraPanSensitivity: 1.0, cameraZoomSensitivity: 1.0 });

  // Use the new Game Logic Hook
  const { 
      gameState, setGameState, gameSpeed, setGameSpeed, previousSpeed, setPreviousSpeed, handlers 
  } = useGameLogic(setupData, currentSlot);

  // UI State
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>(null);
  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(true); 
  const [selectedTool, setSelectedTool] = useState<BuildingType>(BuildingType.NONE);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const [hoveredCell, setHoveredCell] = useState<{x: number, y: number} | null>(null);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [dragPath, setDragPath] = useState<{x: number, y: number}[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<{id: string, def: BuildingDef, variant?: VariantDef, cell: CellData} | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [viewState, setViewState] = useState({ x: 0, y: 0, zoom: 0.6, pitch: 55, yaw: 0 });
  
  // Interaction Refs
  const keysPressed = useRef<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);
  const inputRef = useRef({ isPanning: false, isRotating: false, panStartX: 0, panStartY: 0 });

  // Touch Refs
  const touchRef = useRef({
    startTime: 0,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    isTouchPanning: false,
    isPinching: false,
    initialPinchDist: 0,
    initialPinchAngle: 0,
    initialZoom: 0.6,
    initialYaw: 0,
    longPressTimer: null as ReturnType<typeof setTimeout> | null,
    moved: false,
  });
  
  // Modals & Events Flags
  const [is2DMode, setIs2DMode] = useState(false);
  const [potentialHires, setPotentialHires] = useState<Faculty[]>([]);
  const [recruitmentOpen, setRecruitmentOpen] = useState(false); 
  const [recruitmentConfigOpen, setRecruitmentConfigOpen] = useState(false); 
  const [selectedRecruitMethod, setSelectedRecruitMethod] = useState<RecruitmentMethod>(RecruitmentMethod.MINISTRY);
  const [recruitCount, setRecruitCount] = useState<number>(5);
  const [lockedAllocations, setLockedAllocations] = useState<string[]>([]);
  const [showAdmissionPlannerModal, setShowAdmissionPlannerModal] = useState(false);
  const [showOpeningCeremonyModal, setShowOpeningCeremonyModal] = useState(false);
  const [showGrandOpeningModal, setShowGrandOpeningModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showAdmissionsPrepModal, setShowAdmissionsPrepModal] = useState(false);
  const [showFacultySelectModal, setShowFacultySelectModal] = useState(false);
  const [selectedCollegeIdForDean, setSelectedCollegeIdForDean] = useState<string | null>(null);
  const [selectedDeanRole, setSelectedDeanRole] = useState<'DEAN' | 'VICE_DEAN' | null>(null);

  const currentStats = calculateStats(gameState.grid, gameState.students, gameState.happiness, gameState);
  const gameDate = getGameDate(gameState.day);
  const hasAnySave = useMemo(() => SaveManager.getLatestSlot() !== null, [refreshKey, appPhase]);

  // --- Handlers Wrappers ---
  const handleStartGame = () => {
      // If we are starting from SETUP, force a reset of the game state
      if (currentSlot) {
          const initialMoney = setupData.type1 === UniType1.PUBLIC ? INITIAL_MONEY_PUBLIC : INITIAL_MONEY_PRIVATE;
          const initialMissions: Record<string, MissionStatus> = {};
          Object.keys(MISSIONS_DEF).forEach(key => {
              initialMissions[key] = key.startsWith('root') ? MissionStatus.AVAILABLE : MissionStatus.LOCKED;
          });

          const newState = {
              ...gameState,
              day: 1,
              money: initialMoney,
              students: 0,
              grid: createInitialGrid(),
              universityName: setupData.name,
              uniType1: setupData.type1,
              uniType2: setupData.type2,
              faculty: [],
              colleges: [],
              incomingStudents: [],
              studentList: [],
              financeHistory: [],
              admissionsPhase: AdmissionsPhase.IDLE,
              socialRecognition: 0,
              ministryRecognition: 30,
              badges: [],
              publicity: { activeCampaigns: [], activeBuffs: [], ministryBonus: 30 },
              liaison: { missions: initialMissions, activeMissions: [], cooldowns: {}, grantDaysLeft: 0, grantDailyAmount: 0 }
          };
          setGameState(newState);
          SaveManager.save(currentSlot, newState, setupData);
      }
      setAppPhase('GAME');
  };

  const handleLoadSlot = (slot: number) => {
      if (handlers.loadGame(slot)) {
          setCurrentSlot(slot);
          setAppPhase('GAME');
          setShowSaveLoadModal(false);
      }
  };

  // Input Handling
  useEffect(() => { 
      if (dragStart && hoveredCell && selectedTool === BuildingType.ROAD) {
          setDragPath(getThickLinePoints(dragStart.x, dragStart.y, hoveredCell.x, hoveredCell.y, VARIANTS[BuildingType.ROAD]?.[selectedVariantIndex]?.width || 1)); 
      }
  }, [hoveredCell, dragStart, selectedTool, selectedVariantIndex]);

  useEffect(() => { 
      const kd = (e: KeyboardEvent) => {
          keysPressed.current.add(e.key.toLowerCase());
          if (e.key === 'q' || e.key === 'e') setIsRotated(p => !p);
      };
      const ku = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());
      window.addEventListener('keydown', kd); 
      window.addEventListener('keyup', ku);
      return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  useEffect(() => { 
      const updateLoop = () => { 
          if (keysPressed.current.size > 0 && appPhase === 'GAME') {
              setViewState(p => { 
                  const s = (10 / p.zoom) * appSettings.cameraPanSensitivity;
                  const r = (p.yaw * Math.PI) / 180;
                  const dx = (keysPressed.current.has('d') ? 1 : 0) - (keysPressed.current.has('a') ? 1 : 0);
                  const dy = (keysPressed.current.has('s') ? 1 : 0) - (keysPressed.current.has('w') ? 1 : 0);
                  return { ...p, x: p.x + (dx * Math.cos(r) - dy * Math.sin(r)) * s, y: p.y + (dx * Math.sin(r) + dy * Math.cos(r)) * s };
              });
          }
          rafRef.current = requestAnimationFrame(updateLoop); 
      };
      rafRef.current = requestAnimationFrame(updateLoop);
      return () => cancelAnimationFrame(rafRef.current!);
  }, [appPhase, appSettings]);

  // Event Triggers
  useEffect(() => {
      if (appPhase !== 'GAME') return;
      if (gameDate.month === 9 && gameDate.date === 1 && !showOpeningCeremonyModal && gameState.incomingStudents.length > 0) {
          handlers.handleSpeedChange(0); setShowOpeningCeremonyModal(true);
      }
      if (gameDate.year >= 2027 && gameDate.month === 7 && gameDate.date === 1 && gameState.admissionsPhase === AdmissionsPhase.IDLE && !showAdmissionsPrepModal) {
          handlers.handleSpeedChange(0); setShowAdmissionsPrepModal(true); setGameState(p => ({...p, admissionsPhase: AdmissionsPhase.PREP}));
      }
      if (gameDate.date === 1 && !gameState.budgetConfirmed && !showBudgetModal) {
          handlers.handleSpeedChange(0); setShowBudgetModal(true);
      }
  }, [gameState.day, appPhase, gameState.budgetConfirmed, gameState.admissionsPhase]);

  // --- Map Interaction ---
  const handleMapMouseDown = (e: React.MouseEvent) => {
      if (e.button === 0) { // Left Click
          if (selectedTool !== BuildingType.NONE && hoveredCell) {
              if (selectedTool === BuildingType.ROAD) {
                  setDragStart({x: hoveredCell.x, y: hoveredCell.y});
                  setDragPath([{x: hoveredCell.x, y: hoveredCell.y}]);
              } else {
                  handlers.placeBuilding(hoveredCell.x, hoveredCell.y, selectedTool, selectedVariantIndex, isRotated);
              }
          } else if (hoveredCell) {
              const cell = gameState.grid[hoveredCell.y][hoveredCell.x];
              if (cell.building !== BuildingType.NONE && cell.building !== BuildingType.ROAD && cell.building !== BuildingType.CITY_ROAD) {
                  const variant = VARIANTS[cell.building]?.find(v => v.id === cell.variantId);
                  setSelectedBuilding({ id: cell.buildingId || "", def: BUILDINGS[cell.building], variant, cell });
                  setRenameValue(cell.customName || BUILDINGS[cell.building].name);
              } else {
                  setSelectedBuilding(null);
                  inputRef.current.isPanning = true; inputRef.current.panStartX = e.clientX; inputRef.current.panStartY = e.clientY;
              }
          } else {
              inputRef.current.isPanning = true; inputRef.current.panStartX = e.clientX; inputRef.current.panStartY = e.clientY;
          }
      }
      if (e.button === 1) { // Middle Click
          e.preventDefault(); 
          if (!is2DMode) { 
              inputRef.current.isRotating = true; inputRef.current.panStartX = e.clientX; inputRef.current.panStartY = e.clientY; 
          }
      }
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
      if (inputRef.current.isRotating && !is2DMode) {
          const dx = e.clientX - inputRef.current.panStartX; const dy = e.clientY - inputRef.current.panStartY;
          setViewState(p => ({ ...p, yaw: p.yaw - dx * 0.5, pitch: Math.max(10, Math.min(85, p.pitch - dy * 0.5)) }));
          inputRef.current.panStartX = e.clientX; inputRef.current.panStartY = e.clientY;
          return;
      }
      if (inputRef.current.isPanning) {
          const dx = e.clientX - inputRef.current.panStartX; const dy = e.clientY - inputRef.current.panStartY;
          const s = (1/viewState.zoom)*appSettings.cameraPanSensitivity;
          const r = (viewState.yaw*Math.PI)/180;
          setViewState(p => ({ ...p, x: p.x - (dx*Math.cos(r)+dy*Math.sin(r))*s, y: p.y - (dy*Math.cos(r)-dx*Math.sin(r))*s }));
          inputRef.current.panStartX = e.clientX; inputRef.current.panStartY = e.clientY;
      }
  };

  const handleMapMouseUp = () => {
      inputRef.current.isPanning = false; inputRef.current.isRotating = false;
      if (dragStart && selectedTool === BuildingType.ROAD) {
          handlers.commitRoad(dragPath, selectedTool, selectedVariantIndex);
          setDragStart(null); setDragPath([]);
      }
  };

  const handleMapMouseLeave = () => {
      inputRef.current.isPanning = false; inputRef.current.isRotating = false;
      setDragStart(null); setDragPath([]); setHoveredCell(null);
  };

  const handleWheel = (e: React.WheelEvent) => setViewState(p => ({ ...p, zoom: Math.max(0.2, Math.min(2.0, p.zoom + e.deltaY * -0.001)) }));

  // --- Touch Interaction ---
  const getTouchDist = (t1: React.Touch, t2: React.Touch) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  const getTouchAngle = (t1: React.Touch, t2: React.Touch) => Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = touchRef.current;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      t.startTime = Date.now();
      t.startX = touch.clientX;
      t.startY = touch.clientY;
      t.lastX = touch.clientX;
      t.lastY = touch.clientY;
      t.moved = false;
      t.isTouchPanning = false;
      // Long press for context menu (delete building)
      if (t.longPressTimer) clearTimeout(t.longPressTimer);
      t.longPressTimer = setTimeout(() => {
        if (!t.moved && hoveredCell) {
          const cell = gameState.grid[hoveredCell.y][hoveredCell.x];
          if (cell.buildingId) {
            handlers.removeBuilding(cell.buildingId);
          }
        }
      }, 600);
    } else if (e.touches.length === 2) {
      // Cancel single-finger actions
      if (t.longPressTimer) { clearTimeout(t.longPressTimer); t.longPressTimer = null; }
      t.isTouchPanning = false;
      t.isPinching = true;
      t.initialPinchDist = getTouchDist(e.touches[0], e.touches[1]);
      t.initialPinchAngle = getTouchAngle(e.touches[0], e.touches[1]);
      t.initialZoom = viewState.zoom;
      t.initialYaw = viewState.yaw;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t = touchRef.current;
    if (e.touches.length === 1 && !t.isPinching) {
      const touch = e.touches[0];
      const dx = touch.clientX - t.lastX;
      const dy = touch.clientY - t.lastY;
      const totalDx = touch.clientX - t.startX;
      const totalDy = touch.clientY - t.startY;

      if (Math.abs(totalDx) > 8 || Math.abs(totalDy) > 8) {
        t.moved = true;
        if (t.longPressTimer) { clearTimeout(t.longPressTimer); t.longPressTimer = null; }
      }

      if (t.moved) {
        t.isTouchPanning = true;
        // Single-finger pan (same logic as mouse pan)
        const s = (1 / viewState.zoom) * appSettings.cameraPanSensitivity;
        const r = (viewState.yaw * Math.PI) / 180;
        setViewState(p => ({
          ...p,
          x: p.x - (dx * Math.cos(r) + dy * Math.sin(r)) * s,
          y: p.y - (dy * Math.cos(r) - dx * Math.sin(r)) * s,
        }));
      }
      t.lastX = touch.clientX;
      t.lastY = touch.clientY;
    } else if (e.touches.length === 2 && t.isPinching) {
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      const angle = getTouchAngle(e.touches[0], e.touches[1]);

      // Pinch zoom
      const scale = dist / t.initialPinchDist;
      setViewState(p => ({
        ...p,
        zoom: Math.max(0.2, Math.min(2.0, t.initialZoom * scale)),
        // Two-finger rotate (only in 3D mode)
        ...(!is2DMode ? { yaw: t.initialYaw - (angle - t.initialPinchAngle) } : {}),
      }));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const t = touchRef.current;
    if (t.longPressTimer) { clearTimeout(t.longPressTimer); t.longPressTimer = null; }

    if (e.touches.length === 0) {
      // All fingers lifted
      if (t.isPinching) {
        t.isPinching = false;
        return;
      }

      // Was it a tap? (short duration, no movement)
      const elapsed = Date.now() - t.startTime;
      if (!t.moved && elapsed < 300) {
        // Tap = click
        if (selectedTool !== BuildingType.NONE && hoveredCell) {
          if (selectedTool === BuildingType.ROAD) {
            // For road, just place single cell on tap
            handlers.commitRoad([{ x: hoveredCell.x, y: hoveredCell.y }], selectedTool, selectedVariantIndex);
          } else {
            handlers.placeBuilding(hoveredCell.x, hoveredCell.y, selectedTool, selectedVariantIndex, isRotated);
          }
        } else if (hoveredCell) {
          const cell = gameState.grid[hoveredCell.y][hoveredCell.x];
          if (cell.building !== BuildingType.NONE && cell.building !== BuildingType.ROAD && cell.building !== BuildingType.CITY_ROAD) {
            const variant = VARIANTS[cell.building]?.find(v => v.id === cell.variantId);
            setSelectedBuilding({ id: cell.buildingId || "", def: BUILDINGS[cell.building], variant, cell });
            setRenameValue(cell.customName || BUILDINGS[cell.building].name);
          } else {
            setSelectedBuilding(null);
          }
        }
      }

      t.isTouchPanning = false;
      t.moved = false;
    } else if (e.touches.length === 1) {
      // Went from 2 fingers to 1: reset single-finger tracking
      t.isPinching = false;
      const touch = e.touches[0];
      t.lastX = touch.clientX;
      t.lastY = touch.clientY;
      t.moved = true; // prevent tap on lift
    }
  };

  // --- Render Views ---

  if (appPhase === 'MAIN_MENU') return (
      <div className="h-full flex items-center justify-center bg-orange-50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="z-10 bg-white/90 p-12 rounded-3xl shadow-2xl border border-white/50 text-center max-w-md w-full backdrop-blur-xl">
              <div className="flex flex-col items-center gap-4 mb-8">
                  <GameLogo className="w-32 h-32" />
                  <div><h1 className="text-4xl font-extrabold text-stone-800 tracking-tight">MY UNIVERSITY</h1><p className="text-stone-500 text-xs tracking-[0.3em] uppercase mt-2 font-bold">Campus. Build. Thrive.</p></div>
              </div>
              <div className="space-y-3">
                  <button onClick={() => setAppPhase('SELECT_SLOT')} className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-lg shadow-lg flex items-center justify-center gap-2 transition-all"><Play className="w-5 h-5"/> 开始游戏</button>
                  <button onClick={() => { const s = SaveManager.getLatestSlot(); if(s) handleLoadSlot(s); }} disabled={!hasAnySave} className={`w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 border transition-all ${hasAnySave ? 'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200' : 'bg-stone-100 text-stone-400 border-transparent cursor-not-allowed'}`}><FastForward className="w-5 h-5"/> 继续游戏</button>
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setShowSettingsModal(true)} className="py-3 bg-white hover:bg-stone-50 text-stone-600 hover:text-orange-600 border border-stone-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"><Settings className="w-4 h-4"/> 设置</button>
                      <button onClick={() => setShowAboutModal(true)} className="py-3 bg-white hover:bg-stone-50 text-stone-600 hover:text-orange-600 border border-stone-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"><Info className="w-4 h-4"/> 关于</button>
                  </div>
              </div>
          </div>
      </div>
  );

  if (appPhase === 'SELECT_SLOT') return (
      <div className="h-full flex flex-col items-center justify-center bg-orange-50 gap-8">
          <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-3"><Save className="w-8 h-8 text-orange-500"/> 选择存档位</h2>
          <div className="grid grid-cols-3 gap-6 max-w-4xl w-full px-6">
              {[1, 2, 3].map(slot => { 
                  const info = SaveManager.getSlotInfo(slot); 
                  return (
                      <div key={slot} className="bg-white border border-orange-100 rounded-xl p-6 hover:border-orange-400 hover:shadow-xl transition-all group relative h-64 flex flex-col justify-between shadow-sm">
                          {info ? (
                              <>
                                  <div><div className="text-xs text-orange-500 font-bold mb-2">存档 {slot}</div><div className="text-xl font-bold text-stone-800 mb-1">{info.name}</div><div className="text-sm text-stone-500">第 {info.day} 天</div><div className="text-sm text-amber-500 font-mono mt-2">{formatMoney(info.money)}</div></div>
                                  <div className="space-y-2"><button onClick={() => handleLoadSlot(slot)} className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-bold text-sm shadow">读取</button><button onClick={() => {SaveManager.delete(slot); setRefreshKey(p => p+1);}} className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs">删除</button></div>
                              </>
                          ) : (
                              <button onClick={() => { setCurrentSlot(slot); setAppPhase('SETUP'); }} className="h-full flex flex-col items-center justify-center gap-4 text-stone-400 group-hover:text-orange-500 transition-colors"><UserPlus className="w-12 h-12 opacity-30"/><span className="font-bold">新建存档</span></button>
                          )}
                      </div>
                  );
              })}
          </div>
          <button onClick={() => setAppPhase('MAIN_MENU')} className="text-stone-500 hover:text-stone-800 flex items-center gap-2 mt-4"><ArrowLeft className="w-4 h-4"/> 返回主菜单</button>
      </div>
  );

  if (appPhase === 'SETUP') return (
      <div className="h-full flex items-center justify-center bg-orange-50">
          <div className="bg-white p-8 rounded-2xl border border-orange-100 w-full max-w-lg shadow-xl">
              <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2"><School className="w-6 h-6 text-orange-500"/> 筹建新校</h2>
              <div className="space-y-4 mb-8">
                  <div><label className="block text-sm text-stone-500 mb-1">大学名称</label><input type="text" value={setupData.name} onChange={e => setSetupData({...setupData, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:border-orange-500 outline-none"/></div>
                  <div>
                      <label className="block text-sm text-stone-500 mb-1">办学性质</label>
                      <div className="grid grid-cols-2 gap-3">{[UniType1.PUBLIC, UniType1.PRIVATE].map(t => <button key={t} onClick={() => setSetupData({...setupData, type1: t})} className={`p-3 rounded-lg border text-sm font-bold ${setupData.type1 === t ? 'bg-orange-500 text-white border-orange-500 shadow' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}>{t}</button>)}</div>
                  </div>
              </div>
              <div className="flex gap-4"><button onClick={() => setAppPhase('SELECT_SLOT')} className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-bold">取消</button><button onClick={handleStartGame} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-lg">开始建校</button></div>
          </div>
      </div>
  );

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-orange-50" style={{ filter: `brightness(${appSettings.brightness})` }}>
        <TopBar 
            gameState={gameState} currentStats={currentStats} gameDate={gameDate} gameSpeed={gameSpeed} appSettings={appSettings}
            onRenameUniversity={() => { const n = prompt("新校名:", gameState.universityName); if(n) { if(gameState.money < 500000) { alert("资金不足（需要500K）"); return; } setGameState(p=>({...p, universityName:n, money:p.money-500000})); } }}
            onSpeedChange={handlers.handleSpeedChange} onOpenSave={() => setShowSaveLoadModal(true)} onOpenSettings={() => setShowSettingsModal(true)}
        />
        
        <div className="absolute inset-0 top-14 sm:top-16 pb-0 z-0">
            {/* Memoized GameViewport using grid prop for optimization */}
            <GameViewport 
                grid={gameState.grid} 
                viewState={viewState} 
                is2DMode={is2DMode} 
                appSettings={appSettings}
                onMouseDown={handleMapMouseDown} 
                onMouseMove={handleMapMouseMove} 
                onMouseUp={handleMapMouseUp} 
                onMouseLeave={handleMapMouseLeave} 
                onContextMenu={(e, x, y) => { e.preventDefault(); handlers.removeBuilding(gameState.grid[y][x].buildingId || ""); }}
                hoveredCell={hoveredCell} 
                setHoveredCell={setHoveredCell} 
                dragPath={dragPath} 
                selectedTool={selectedTool} 
                isRotated={isRotated} 
                selectedVariantIndex={selectedVariantIndex} 
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            />
        </div>
        
        <GameHUD 
            activeSidebarTab={activeSidebarTab} setActiveSidebarTab={setActiveSidebarTab} isMenuExpanded={isMenuExpanded} setIsMenuExpanded={setIsMenuExpanded}
            selectedTool={selectedTool} setSelectedTool={setSelectedTool} selectedVariantIndex={selectedVariantIndex} setSelectedVariantIndex={setSelectedVariantIndex}
            isRotated={isRotated} onToggleRotate={() => setIsRotated(p => !p)}
            is2DMode={is2DMode} onToggle2D={() => {
                const newIs2D = !is2DMode;
                setIs2DMode(newIs2D);
                if (newIs2D) {
                    setViewState(prev => ({ ...prev, pitch: 0, yaw: 0 }));
                } else {
                    setViewState(prev => ({ ...prev, pitch: 55 }));
                }
            }}
        />

        {activeSidebarTab && activeSidebarTab !== 'BUILD' && (
            <div className="absolute inset-0 top-14 sm:top-16 bottom-0 bg-orange-50/95 z-20 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-orange-100 bg-white/50">
                    <h2 className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-3">
                        {/* Map localized name or default */}
                        {activeSidebarTab === 'OVERVIEW' ? '概况' : activeSidebarTab === 'FINANCE' ? '财务处' : activeSidebarTab === 'PUBLICITY' ? '宣传处' : activeSidebarTab === 'LIAISON' ? '教育部联络处' : activeSidebarTab}
                    </h2>
                    <button onClick={() => setActiveSidebarTab(null)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-stone-200 active:bg-stone-300 text-stone-400 hover:text-stone-600"><X className="w-6 h-6"/></button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    {activeSidebarTab === 'FINANCE' && <FinancePanel gameState={gameState} setGameState={setGameState} currentStats={currentStats} lockedAllocations={lockedAllocations} setLockedAllocations={setLockedAllocations} onBudgetConfirmed={() => { handlers.handleSpeedChange(previousSpeed || 1); }} />}
                    {activeSidebarTab === 'ACADEMIC' && <AcademicPanel gameState={gameState} setGameState={setGameState} onAssignDean={(cid, role) => { setSelectedCollegeIdForDean(cid); setSelectedDeanRole(role); setShowFacultySelectModal(true); }} />}
                    {activeSidebarTab === 'HR' && <HRPanel gameState={gameState} onFire={(fid) => setGameState(p=>({...p, faculty: p.faculty.filter(f=>f.id!==fid)}))} onOpenRecruit={(m) => { setSelectedRecruitMethod(m); setRecruitmentConfigOpen(true); }} />}
                    {activeSidebarTab === 'ADMISSIONS' && <AdmissionsPanel gameState={gameState} setGameState={setGameState} onOpenPlanner={() => { setShowAdmissionPlannerModal(true); }} />}
                    {activeSidebarTab === 'OVERVIEW' && <OverviewPanel gameState={gameState} currentStats={currentStats} />}
                    {activeSidebarTab === 'PUBLICITY' && <PublicityPanel gameState={gameState} onStartSocial={handlers.startSocialCampaign} onStartMinistry={handlers.startMinistryCampaign} />}
                    {activeSidebarTab === 'LIAISON' && <LiaisonPanel gameState={gameState} onAcceptMission={handlers.acceptMission} onClaimMission={handlers.claimMission} onCancelMission={handlers.cancelMission} />}
                </div>
            </div>
        )}

        <BuildingInspector 
            selectedBuilding={selectedBuilding} renameValue={renameValue} onRenameChange={setRenameValue} 
            onRenameSubmit={(n) => handlers.renameBuilding(selectedBuilding!.id, n)} onClose={() => setSelectedBuilding(null)} onRemove={handlers.removeBuilding} 
        />

        {/* Modals Layer */}
        <SettingsModal 
            isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} appSettings={appSettings} setAppSettings={setAppSettings}
            onReturnToMain={() => setAppPhase('MAIN_MENU')} onDevTimeJump={(e) => { e.preventDefault(); setGameState(p => ({...p, day: 500})); setShowSettingsModal(false); }} onDevMaxRank={(e) => { e.preventDefault(); setGameState(p => ({...p, money: p.money + 1000000000})); setShowSettingsModal(false); }}
        />
        <SaveLoadModal 
            isOpen={showSaveLoadModal} onClose={() => setShowSaveLoadModal(false)} currentSlot={currentSlot} gameState={gameState}
            onQuickSave={() => { if(currentSlot) SaveManager.save(currentSlot, gameState, setupData); }} onSaveToSlot={(s) => { SaveManager.save(s, gameState, setupData); setRefreshKey(p=>p+1); }} onLoadSlot={handleLoadSlot} refreshKey={refreshKey}
        />
        
        <RecruitmentConfigModal isOpen={recruitmentConfigOpen} onClose={() => setRecruitmentConfigOpen(false)} method={selectedRecruitMethod} count={recruitCount} setCount={setRecruitCount} 
            onConfirm={() => {
                // Inline simple recruit logic for brevity, ideally in hook but requires complex params
                setGameState(p => ({...p, money: p.money - (selectedRecruitMethod === RecruitmentMethod.SOCIAL ? 5000 : 0) * recruitCount, recruitAvailable: false}));
                const newHires: Faculty[] = Array(recruitCount).fill(null).map(() => ({ id: generateId(), name: generateName(), title: FacultyTitle.LECTURER, department: CollegeType.ARTS, researchAbility: 50, managementAbility: 50, salary: 8000, hireDate: gameState.day, satisfaction: 80 }));
                setPotentialHires(newHires); setRecruitmentConfigOpen(false); setRecruitmentOpen(true);
            }} 
            getCost={(m) => m === RecruitmentMethod.SOCIAL ? 5000 : 0} getProb={() => "Standard"} 
        />
        <RecruitmentResultModal isOpen={recruitmentOpen} hires={potentialHires} onHire={(f) => { setGameState(p => ({...p, faculty: [...p.faculty, f]})); setPotentialHires(p => p.filter(h => h.id !== f.id)); }} onClose={() => setRecruitmentOpen(false)} />
        
        <BudgetModal isOpen={showBudgetModal} onConfirm={() => { setShowBudgetModal(false); setActiveSidebarTab('FINANCE'); }} />
        <AdmissionsPrepModal isOpen={showAdmissionsPrepModal} onConfirm={() => { setShowAdmissionsPrepModal(false); setActiveSidebarTab('ADMISSIONS'); }} />
        <OpeningCeremonyModal isOpen={showOpeningCeremonyModal} newStudents={gameState.studentList.length - gameState.students} tuition={0} onConfirm={() => { 
            const newStudents = [...gameState.incomingStudents];
            setGameState(p => ({...p, studentList: [...p.studentList, ...newStudents], students: p.students + newStudents.length, incomingStudents: []}));
            setShowOpeningCeremonyModal(false); handlers.handleSpeedChange(previousSpeed || 1); 
        }} />
        <GrandOpeningModal isOpen={showGrandOpeningModal} onConfirm={() => { setShowGrandOpeningModal(false); handlers.handleSpeedChange(previousSpeed || 1); }} universityName={gameState.universityName} />
        
        <FacultySelectModal isOpen={showFacultySelectModal} faculty={gameState.faculty} onSelect={(fid) => {
            if (selectedCollegeIdForDean && selectedDeanRole) {
                setGameState(prev => ({
                    ...prev,
                    colleges: prev.colleges.map(c => c.id === selectedCollegeIdForDean ? { ...c, [selectedDeanRole === 'DEAN' ? 'deanId' : 'viceDeanId']: fid } : c)
                }));
            }
            setShowFacultySelectModal(false);
        }} onClose={() => setShowFacultySelectModal(false)} />
    </div>
  );
};
