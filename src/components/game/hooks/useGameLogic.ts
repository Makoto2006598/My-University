
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    GameState, UniType1, UniType2, UniversityScale, UniversityRank,
    AdmissionsPhase, FinanceHistoryPoint, ConstructionStatus,
    BuildingType, CellData, BuildingDef, VariantDef,
    SocialPublicityTier, MinistryPublicityType, PublicityBuffType,
    ActiveCampaign, ActiveBuff, MissionStatus
} from '../../../types';
import { 
    INITIAL_MONEY_PUBLIC, INITIAL_MONEY_PRIVATE, GRID_SIZE 
} from '../../../types';
import {
    createInitialGrid, getGameDate, calculateStats, generateId,
    calculateZones, getThickLinePoints, updateFullGrid,
    checkConnectedRoadAdjacency
} from '../../../utils/gameUtils';
import { generateDailyStudents } from '../../../utils/studentSystem';
import { SaveManager } from '../../../utils/saveManager';
import { BUILDINGS, VARIANTS, MISSIONS_DEF, COLLEGES_DEF } from '../../../data/gameData';

export const useGameLogic = (
    initialSetup: { name: string; type1: UniType1; type2: UniType2 },
    currentSlot: number | null
) => {
    // Initial Mission State
    const initialMissions: Record<string, MissionStatus> = {};
    Object.keys(MISSIONS_DEF).forEach(key => {
        initialMissions[key] = key.startsWith('root') ? MissionStatus.AVAILABLE : MissionStatus.LOCKED;
    });

    const [gameState, setGameState] = useState<GameState>({
        money: initialSetup.type1 === UniType1.PUBLIC ? INITIAL_MONEY_PUBLIC : INITIAL_MONEY_PRIVATE, 
        students: 0, studentCap: 6000, happiness: 50, grid: createInitialGrid(), day: 1, semester: 1,
        universityName: initialSetup.name, universityLabel: "初创大学", uniType1: initialSetup.type1, uniType2: initialSetup.type2, 
        scale: UniversityScale.ACADEMY, rank: UniversityRank.STARTUP,
        socialRecognition: 0, ministryRecognition: 30, badges: [], startDate: Date.now(), faculty: [], colleges: [], 
        studentList: [], incomingStudents: [], recruitAvailable: true, pityUsed: false, budgetConfirmed: false,
        financeSettings: { tuitionFeePerYear: 10, totalDailyBudget: 100000, allocationWeights: { research: 20, cafeteria: 20, maintenance: 20, student: 20, faculty: 20 } },
        financeHistory: [], admissionPolicy: { totalTarget: 0, minScore: 500, collegeTargets: {}, lastPlanUpdateYear: 0 },
        admissionsPhase: AdmissionsPhase.IDLE,
        publicity: { activeCampaigns: [], activeBuffs: [], ministryBonus: 30 },
        liaison: { missions: initialMissions, activeMissions: [], cooldowns: {}, grantDaysLeft: 0, grantDailyAmount: 0 }
    });

    const [gameSpeed, setGameSpeed] = useState<number>(1);
    const [previousSpeed, setPreviousSpeed] = useState<number>(1);
    const previousSpeedRef = useRef<number>(1);

    // --- GAME LOOP ---
    useEffect(() => {
        if (gameSpeed === 0) return;
        
        const intervalMs = 8000 / gameSpeed;
        const timer = setInterval(() => {
            setGameState(prev => {
                const currentDate = getGameDate(prev.day);
                let newBudgetConfirmed = prev.budgetConfirmed;
                
                // Monthly Budget Logic: reset on 1st of each month, require manual confirmation
                if (currentDate.date === 1 && prev.day > 1) newBudgetConfirmed = false;

                // Admissions Logic
                let newAdmissionsPhase = prev.admissionsPhase;
                let newIncoming = [...prev.incomingStudents];

                // IDLE -> PREP on July 1
                if (currentDate.year >= 2027 && currentDate.month === 7 && currentDate.date === 1 && newAdmissionsPhase === AdmissionsPhase.IDLE) {
                    newAdmissionsPhase = AdmissionsPhase.PREP;
                }
                // PREP -> RECRUITING on July 15
                if (currentDate.year >= 2027 && currentDate.month === 7 && currentDate.date === 15 && newAdmissionsPhase === AdmissionsPhase.PREP) {
                    newAdmissionsPhase = AdmissionsPhase.RECRUITING;
                }
                
                if (newAdmissionsPhase === AdmissionsPhase.RECRUITING && 
                   ((currentDate.month === 7 && currentDate.date >= 15) || (currentDate.month === 8 && currentDate.date <= 5))) {
                    if (prev.colleges.length > 0 && prev.admissionPolicy.totalTarget > 0) {
                        const newStudents = generateDailyStudents(prev.admissionPolicy, prev.colleges, newIncoming.length);
                        newIncoming = [...newIncoming, ...newStudents];
                    }
                }
                
                if (currentDate.month === 8 && currentDate.date === 6 && newAdmissionsPhase === AdmissionsPhase.RECRUITING) {
                    newAdmissionsPhase = AdmissionsPhase.IDLE;
                }

                // Publicity Logic
                const activeBuffs = prev.publicity.activeBuffs.map(b => ({...b, daysLeft: b.daysLeft - 1})).filter(b => b.daysLeft > 0);
                const hasOverPublicity = activeBuffs.some(b => b.type === PublicityBuffType.OVER_PUBLICITY);
                const hasBackroom = activeBuffs.some(b => b.type === PublicityBuffType.BACKROOM_DEAL);
                
                let dailyPublicityCost = 0;
                let dailySocialRecGain = 0;
                let newActiveCampaigns: ActiveCampaign[] = [];

                prev.publicity.activeCampaigns.forEach(camp => {
                    const daysLeft = camp.daysLeft - 1;
                    let cost = 0;
                    let gainMin = 0;
                    let gainMax = 0;

                    if (camp.tier === SocialPublicityTier.STANDARD) { cost = 10000; gainMin = 0; gainMax = 1.5; }
                    else if (camp.tier === SocialPublicityTier.PREMIUM) { cost = 80000; gainMin = 0; gainMax = 5; }
                    else if (camp.tier === SocialPublicityTier.MASSIVE) { cost = 150000; gainMin = 1; gainMax = 10; }

                    dailyPublicityCost += cost;
                    
                    let gain = gainMin + Math.random() * (gainMax - gainMin);
                    
                    // Modifiers
                    if (hasOverPublicity) gain *= 0.85; // -15%
                    if (hasBackroom) gain *= 0.1; // -90%

                    dailySocialRecGain += gain;

                    if (daysLeft > 0) {
                        newActiveCampaigns.push({ ...camp, daysLeft });
                    }
                });

                // Liaison / Mission Logic
                let liaisonGrant = 0;
                let newGrantDaysLeft = prev.liaison.grantDaysLeft;
                if (newGrantDaysLeft > 0) {
                    liaisonGrant = prev.liaison.grantDailyAmount;
                    newGrantDaysLeft--;
                }
                
                // Cooldown Check
                const newCooldowns = { ...prev.liaison.cooldowns };
                const newMissionStatuses = { ...prev.liaison.missions };
                Object.keys(newCooldowns).forEach(id => {
                    if (newCooldowns[id] <= prev.day) {
                        delete newCooldowns[id];
                        newMissionStatuses[id] = MissionStatus.AVAILABLE;
                    }
                });

                // Construction & Stats
                const nextDay = prev.day + 1;
                let anyCompleted = false;
                const newGrid = prev.grid.map(row => row.map(cell => {
                    if (cell.constructionStatus === ConstructionStatus.CONSTRUCTING && cell.constructionLeft !== undefined) {
                        const newLeft = cell.constructionLeft - 1;
                        if (newLeft <= 0) {
                            anyCompleted = true;
                            return { ...cell, constructionStatus: ConstructionStatus.COMPLETED, constructionLeft: 0 };
                        }
                        return { ...cell, constructionLeft: newLeft };
                    }
                    return cell;
                }));
                // 建筑完工时重新计算服务覆盖
                if (anyCompleted) {
                    updateFullGrid(newGrid);
                }

                const stats = calculateStats(newGrid, prev.students, prev.happiness, prev);
                const netIncome = stats.netIncome - dailyPublicityCost + liaisonGrant;
                
                const totalMinistryRecognition = stats.ministryRecognition + (prev.publicity.ministryBonus || 0);

                const newHistoryPoint: FinanceHistoryPoint = { 
                    day: prev.day, 
                    totalMoney: prev.money + netIncome, 
                    income: stats.totalRevenue + liaisonGrant, 
                    expense: stats.totalExpense + dailyPublicityCost, 
                    balance: netIncome, 
                    maintenance: stats.maintenanceAllocated, 
                    cafeteriaSubsidy: stats.cafeteriaAllocated, 
                    researchCost: stats.researchAllocated, 
                    studentSubsidy: stats.studentAllocated, 
                    ministryGrant: stats.dailyGrant, 
                    facultySalaries: stats.salaryRequiredDaily,
                    publicityCost: dailyPublicityCost,
                    liaisonIncome: liaisonGrant
                };

                return { 
                    ...prev, 
                    day: nextDay, 
                    money: prev.money + netIncome, 
                    financeHistory: [...prev.financeHistory, newHistoryPoint].slice(-60), 
                    grid: newGrid, 
                    incomingStudents: newIncoming, 
                    budgetConfirmed: newBudgetConfirmed, 
                    admissionsPhase: newAdmissionsPhase,
                    socialRecognition: prev.socialRecognition + dailySocialRecGain,
                    ministryRecognition: totalMinistryRecognition,
                    publicity: {
                        activeCampaigns: newActiveCampaigns,
                        activeBuffs: activeBuffs,
                        ministryBonus: prev.publicity.ministryBonus || 0
                    },
                    liaison: {
                        ...prev.liaison,
                        missions: newMissionStatuses,
                        cooldowns: newCooldowns,
                        grantDaysLeft: newGrantDaysLeft
                    }
                };
            });
        }, intervalMs);

        return () => clearInterval(timer);
    }, [gameSpeed]);

    // --- ACTIONS ---

    const handleSpeedChange = useCallback((speed: number) => {
        if (speed > 0) {
            const date = getGameDate(gameState.day);
            if (date.date === 1 && !gameState.budgetConfirmed && gameState.day > 1) {
                // Block unpausing until budget is confirmed
                return;
            }
            setPreviousSpeed(speed);
            previousSpeedRef.current = speed;
        }
        setGameSpeed(speed);
    }, [gameState.day, gameState.budgetConfirmed]);

    const placeBuilding = useCallback((
        x: number, y: number, 
        tool: BuildingType, 
        variantIndex: number, 
        isRotated: boolean
    ) => {
        const variants = VARIANTS[tool];
        const variant = variants && variants.length > 0 ? (variants[variantIndex] || variants[0]) : undefined;
        let width = variant ? variant.width : (BUILDINGS[tool].width || 1);
        let height = variant ? variant.height : (BUILDINGS[tool].height || 1);
        if (isRotated) { const t = width; width = height; height = t; }
        const cost = variant?.cost || BUILDINGS[tool].cost;
        
        if (gameState.money < cost) { alert("资金不足！"); return; }
        if (x + width > GRID_SIZE || y + height > GRID_SIZE) return;

        const def = BUILDINGS[tool];
        const needsRoad = def.requiresRoadConnection !== false && ![BuildingType.ROAD, BuildingType.CITY_ROAD].includes(tool);
        if (needsRoad && tool !== BuildingType.SCHOOL_GATE) {
            const roadCheck = checkConnectedRoadAdjacency(gameState.grid, x, y, width, height);
            if (!roadCheck.valid) {
                alert(roadCheck.reason || "建筑必须连接道路！"); return;
            }
        }

        for(let dy=0; dy<height; dy++) for(let dx=0; dx<width; dx++) {
            if(gameState.grid[y+dy][x+dx].building !== BuildingType.NONE && gameState.grid[y+dy][x+dx].building !== BuildingType.FENCE) return;
        }

        setGameState(prev => {
            const newGrid = prev.grid.map(row => row.map(c => ({...c})));
            const bid = generateId();
            const bDef = BUILDINGS[tool];
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    newGrid[y + dy][x + dx] = {
                        ...newGrid[y + dy][x + dx],
                        building: tool,
                        buildingId: bid,
                        variantId: variant?.id,
                        isOrigin: dx === 0 && dy === 0,
                        rotation: isRotated ? 1 : 0,
                        constructionStatus: bDef.constructionTime > 0 ? ConstructionStatus.CONSTRUCTING : ConstructionStatus.COMPLETED,
                        constructionLeft: bDef.constructionTime
                    };
                }
            }
            // 更新路网拓扑和服务覆盖
            updateFullGrid(newGrid);
            return { ...prev, money: prev.money - cost, grid: newGrid };
        });
    }, [gameState.money, gameState.grid]);

    const commitRoad = useCallback((dragPath: {x:number, y:number}[], tool: BuildingType, variantIndex: number) => {
        if (dragPath.length === 0) return;
        const variants = VARIANTS[tool];
        const variant = variants ? variants[variantIndex] : undefined;
        const cost = (variant?.cost || BUILDINGS[BuildingType.ROAD].cost) * dragPath.length;
        if (gameState.money < cost) { alert("资金不足！"); return; }

        setGameState(prev => {
            const newGrid = prev.grid.map(row => row.map(c => ({...c})));
            dragPath.forEach(pos => {
                const current = newGrid[pos.y][pos.x];
                if (current.building === BuildingType.NONE || current.building === BuildingType.FENCE) {
                    newGrid[pos.y][pos.x] = {
                        x: pos.x, y: pos.y,
                        building: BuildingType.ROAD,
                        roadZoneDepth: 3,
                        isZoned: false,
                        variantId: variant?.id,
                        constructionStatus: ConstructionStatus.COMPLETED
                    };
                }
            });
            // 新道路可能连通之前断开的路段，需要全局重算
            updateFullGrid(newGrid);
            return { ...prev, money: prev.money - cost, grid: newGrid };
        });
    }, [gameState.money]);

    const removeBuilding = useCallback((buildingId: string) => {
        setGameState(prev => {
            const newGrid = prev.grid.map(row => row.map(c => c.buildingId === buildingId ? { x: c.x, y: c.y, building: BuildingType.NONE } as CellData : {...c}));
            // 删除道路可能导致其他道路/建筑断开连接
            updateFullGrid(newGrid);
            return { ...prev, grid: newGrid };
        });
    }, []);

    const renameBuilding = useCallback((buildingId: string, newName: string) => {
        setGameState(prev => {
            const newGrid = prev.grid.map(row => row.map(c => c.buildingId === buildingId ? { ...c, customName: newName } : c));
            return { ...prev, grid: newGrid };
        });
    }, []);

    const loadGame = (slot: number) => {
        const data = SaveManager.load(slot);
        if (data) {
            // Migration
            if (!data.gameState.publicity) {
                data.gameState.publicity = { activeCampaigns: [], activeBuffs: [], ministryBonus: data.gameState.ministryRecognition || 30 };
            } else if (data.gameState.publicity.ministryBonus === undefined) {
                data.gameState.publicity.ministryBonus = 0;
            }
            // Migration for Liaison
            if (!data.gameState.liaison) {
                const initialMissions: Record<string, MissionStatus> = {};
                Object.keys(MISSIONS_DEF).forEach(key => {
                    initialMissions[key] = key.startsWith('root') ? MissionStatus.AVAILABLE : MissionStatus.LOCKED;
                });
                data.gameState.liaison = { missions: initialMissions, activeMissions: [], cooldowns: {}, grantDaysLeft: 0, grantDailyAmount: 0 };
            }
            setGameState(data.gameState);
            return true;
        }
        return false;
    };

    // --- Publicity Handlers ---
    const startSocialCampaign = useCallback((tier: SocialPublicityTier) => {
        setGameState(prev => {
            const hasOver = prev.publicity.activeBuffs.some(b => b.type === PublicityBuffType.OVER_PUBLICITY);
            if (hasOver || prev.publicity.activeCampaigns.length > 0) return prev;

            let duration = 0;
            if (tier === SocialPublicityTier.STANDARD) duration = 20;
            if (tier === SocialPublicityTier.PREMIUM) duration = 30;
            if (tier === SocialPublicityTier.MASSIVE) duration = 50;

            const newCampaign: ActiveCampaign = { tier, daysLeft: duration };
            
            const hasRecent = prev.publicity.activeBuffs.some(b => b.type === PublicityBuffType.RECENT_PUBLICITY);
            let newBuffs = [...prev.publicity.activeBuffs];
            
            if (hasRecent) {
                newBuffs.push({ type: PublicityBuffType.OVER_PUBLICITY, daysLeft: 90 }); 
            } else {
                newBuffs.push({ type: PublicityBuffType.RECENT_PUBLICITY, daysLeft: 180 });
            }

            return {
                ...prev,
                publicity: {
                    ...prev.publicity,
                    activeCampaigns: [newCampaign],
                    activeBuffs: newBuffs
                }
            };
        });
    }, []);

    const startMinistryCampaign = useCallback((type: MinistryPublicityType) => {
        if (type === MinistryPublicityType.CONNECTION) return; 
        
        setGameState(prev => {
            const cost = 5000000;
            if (prev.money < cost) { alert("资金不足 (需要 5M)"); return prev; }
            
            const hasOver = prev.publicity.activeBuffs.some(b => b.type === PublicityBuffType.OVER_PUBLICITY);
            if (hasOver) { alert("处于过度宣传状态，无法公关。"); return prev; }

            const stats = calculateStats(prev.grid, prev.students, prev.happiness, prev);
            const facSat = stats.facultySatisfaction;
            
            const gainBase = 10 + Math.random() * 40;
            let gain = gainBase * (0.5 + 0.5 * (facSat / 100));
            
            const hasRecent = prev.publicity.activeBuffs.some(b => b.type === PublicityBuffType.RECENT_PUBLICITY);
            const hasOverPub = prev.publicity.activeBuffs.some(b => b.type === PublicityBuffType.OVER_PUBLICITY);
            const hasBackroom = prev.publicity.activeBuffs.some(b => b.type === PublicityBuffType.BACKROOM_DEAL);
            
            if (hasRecent) gain *= 0.9;
            if (hasOverPub) gain *= 0.7;
            if (hasBackroom) gain *= 0.2;

            const hasContact = prev.publicity.activeBuffs.some(b => b.type === PublicityBuffType.MINISTRY_CONTACT);
            let newBuffs = [...prev.publicity.activeBuffs];

            if (hasContact) {
                newBuffs.push({ type: PublicityBuffType.BACKROOM_DEAL, daysLeft: 360 });
            } else {
                newBuffs.push({ type: PublicityBuffType.MINISTRY_CONTACT, daysLeft: 180 });
            }

            return {
                ...prev,
                money: prev.money - cost,
                ministryRecognition: prev.ministryRecognition + gain, // Visual update immediate
                publicity: {
                    ...prev.publicity,
                    activeBuffs: newBuffs,
                    ministryBonus: (prev.publicity.ministryBonus || 0) + gain
                }
            };
        });
    }, []);

    // --- Liaison Handlers ---
    const acceptMission = useCallback((id: string) => {
        setGameState(prev => {
            // Check Capacity
            if (prev.liaison.activeMissions.length >= 3) { alert("任务已满"); return prev; }
            
            // Check Exclusivity
            const targetDef = MISSIONS_DEF[id];
            
            // 1. Check if ANY currently active mission is in the target's exclusiveWith list
            const activeMissionIds = prev.liaison.activeMissions.map(m => m.id);
            if (targetDef.exclusiveWith) {
                const conflict = targetDef.exclusiveWith.find(exId => activeMissionIds.includes(exId));
                if (conflict) {
                    alert(`互斥任务冲突：无法同时进行此任务与【${MISSIONS_DEF[conflict].title}】。`);
                    return prev;
                }
            }

            // 2. Check if the TARGET mission is in the exclusiveWith list of any currently active mission
            // (Strictly speaking exclusiveWith should be symmetric, but safe to check)
            for (const activeId of activeMissionIds) {
                const activeDef = MISSIONS_DEF[activeId];
                if (activeDef.exclusiveWith && activeDef.exclusiveWith.includes(id)) {
                    alert(`互斥任务冲突：无法同时进行此任务与【${activeDef.title}】。`);
                    return prev;
                }
            }

            return {
                ...prev,
                liaison: {
                    ...prev.liaison,
                    missions: { ...prev.liaison.missions, [id]: MissionStatus.ACTIVE },
                    activeMissions: [...prev.liaison.activeMissions, { id, acceptedDay: prev.day }]
                }
            };
        });
    }, []);

    const cancelMission = useCallback((id: string) => {
        setGameState(prev => {
            const cooldownDays = 30; // 30 day penalty
            const newMissions = { ...prev.liaison.missions, [id]: MissionStatus.COOLDOWN };
            const newCooldowns = { ...prev.liaison.cooldowns, [id]: prev.day + cooldownDays };
            return {
                ...prev,
                liaison: {
                    ...prev.liaison,
                    missions: newMissions,
                    activeMissions: prev.liaison.activeMissions.filter(m => m.id !== id),
                    cooldowns: newCooldowns
                }
            };
        });
    }, []);

    const checkRequirements = (id: string, state: GameState): boolean => {
        const def = MISSIONS_DEF[id];
        if (!def) return false;
        const req = def.requirements;

        // Check Colleges
        if (req.colleges) {
            for (const cType of req.colleges) {
                if (!state.colleges.find(c => c.type === cType)) return false;
            }
        }

        // Check Categories
        if (req.categories) {
            for (const cat of req.categories) {
                const found = state.colleges.find(c => COLLEGES_DEF[c.type].category === cat);
                if (!found) return false;
            }
        }

        // Check Deans
        if (req.needDean) {
            const requiredColleges = new Set<string>();
            if (req.colleges) req.colleges.forEach(c => requiredColleges.add(c));
            if (req.categories) {
                state.colleges.forEach(c => {
                    if (req.categories?.includes(COLLEGES_DEF[c.type].category)) requiredColleges.add(c.type);
                });
            }
            
            for (const cType of requiredColleges) {
                const col = state.colleges.find(c => c.type === cType);
                if (col && !col.deanId) return false;
            }
        }

        // Check Buildings
        if (req.minBuildingsPerCollege) {
            let requiredCollegeCount = (req.colleges?.length || 0);
            if (req.categories) {
                 requiredCollegeCount += (req.categories.length);
            }

            let buildingCount = 0;
            state.grid.forEach(row => row.forEach(cell => {
                if (cell.building === req.minBuildingsPerCollege?.type && cell.isOrigin && cell.constructionStatus === ConstructionStatus.COMPLETED) {
                    buildingCount++;
                }
            }));

            if (buildingCount < requiredCollegeCount * req.minBuildingsPerCollege.count) return false;
        }

        return true;
    };

    const claimMission = useCallback((id: string) => {
        setGameState(prev => {
            if (!checkRequirements(id, prev)) {
                alert("未满足任务完成条件！请检查学院、建筑或院长任命。");
                return prev;
            }

            const def = MISSIONS_DEF[id];
            const newMissions = { ...prev.liaison.missions, [id]: MissionStatus.COMPLETED };
            
            // Handle Exclusivity
            if (def.exclusiveWith) {
                def.exclusiveWith.forEach(exId => newMissions[exId] = MissionStatus.LOCKED);
            }

            // Handle Unlocks
            if (def.rewards.unlocks) {
                def.rewards.unlocks.forEach(unId => newMissions[unId] = MissionStatus.AVAILABLE);
            }

            // Handle Rewards
            let newLabel = prev.universityLabel;
            if (def.rewards.title) newLabel = def.rewards.title;

            let bonusGrantAmount = prev.liaison.grantDailyAmount;
            let bonusGrantDays = prev.liaison.grantDaysLeft;
            if (def.rewards.grant) {
                bonusGrantAmount += def.rewards.grant.amount;
                bonusGrantDays += def.rewards.grant.days;
            }

            return {
                ...prev,
                universityLabel: newLabel,
                socialRecognition: prev.socialRecognition + (def.rewards.socialRec || 0),
                ministryRecognition: prev.ministryRecognition + (def.rewards.ministryRec || 0),
                publicity: {
                    ...prev.publicity,
                    ministryBonus: (prev.publicity.ministryBonus || 0) + (def.rewards.ministryRec || 0) // Persist ministry bonus
                },
                liaison: {
                    ...prev.liaison,
                    missions: newMissions,
                    activeMissions: prev.liaison.activeMissions.filter(m => m.id !== id),
                    grantDailyAmount: bonusGrantAmount,
                    grantDaysLeft: bonusGrantDays
                }
            };
        });
    }, []);

    return {
        gameState,
        setGameState,
        gameSpeed,
        setGameSpeed,
        previousSpeed,
        setPreviousSpeed,
        handlers: {
            handleSpeedChange,
            placeBuilding,
            commitRoad,
            removeBuilding,
            renameBuilding,
            loadGame,
            startSocialCampaign,
            startMinistryCampaign,
            acceptMission,
            claimMission,
            cancelMission
        }
    };
};
