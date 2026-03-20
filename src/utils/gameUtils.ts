
import {
    GameState, CellData, BuildingType, BuildingDef, VariantDef,
    ActiveCollege, CollegeType, Faculty, UniversityScale, UniversityRank,
    Student, Gender, UniType1, GRID_SIZE, ConstructionStatus
} from '../types';
import { BUILDINGS, VARIANTS, generateName } from '../data/gameData';
import { Snowflake, Leaf, Sun, CloudRain } from 'lucide-react';
import { updateRoadNetwork, checkConnectedRoadAdjacency } from './roadNetwork';
import { calculateServiceCoverage, getBuildingServiceInfo } from './serviceRadius';

export const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export const formatMoney = (amount: number): string => {
    const abs = Math.abs(amount);
    if (abs >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
    if (abs >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return `${Math.floor(amount)}`;
};

export const createInitialGrid = (): CellData[][] => {
  const grid = Array(GRID_SIZE).fill(null).map((_, y) =>
    Array(GRID_SIZE).fill(null).map((_, x) => {
      let building = BuildingType.NONE;
      const isOuterRim = x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1;
      if (isOuterRim) {
        if ((x > GRID_SIZE/2 - 5 && x < GRID_SIZE/2 + 5) || (y > GRID_SIZE/2 - 5 && y < GRID_SIZE/2 + 5) || Math.random() > 0.4) building = BuildingType.CITY_ROAD;
      }
      const status = building === BuildingType.CITY_ROAD ? ConstructionStatus.COMPLETED : undefined;
      return { x, y, building, constructionStatus: status } as CellData;
    })
  );
  // 初始化路网拓扑
  updateRoadNetwork(grid);
  calculateZones(grid);
  return grid;
};

const GAME_START_TIMESTAMP = new Date('2026-02-01T00:00:00Z').getTime();
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const getGameDate = (day: number) => {
    const current = new Date(GAME_START_TIMESTAMP + (day - 1) * MILLISECONDS_PER_DAY);
    const year = current.getUTCFullYear();
    const month = current.getUTCMonth() + 1;
    const date = current.getUTCDate();
    
    // Semester Logic
    // Sem 1: Sep(9) - Jan(1)
    // Sem 2: Feb(2) - Aug(8)
    const isSem1 = month >= 9 || month === 1;
    const semester = isSem1 ? 1 : 2;

    // Season Logic
    let season = 'Winter';
    let SeasonIcon = Snowflake;
    if (month >= 3 && month <= 5) { season = 'Spring'; SeasonIcon = Leaf; } 
    else if (month >= 6 && month <= 8) { season = 'Summer'; SeasonIcon = Sun; } 
    else if (month >= 9 && month <= 11) { season = 'Autumn'; SeasonIcon = CloudRain; }

    return { 
        year, 
        month, 
        date, 
        dateString: `${year}年${month.toString().padStart(2, '0')}月${date.toString().padStart(2, '0')}日`, 
        semester,
        semesterString: `${year}年 第${semester}学期`,
        season,
        SeasonIcon
    };
};

export const getUniversityLabel = (colleges: ActiveCollege[]): string => {
    if (colleges.length === 0) return '未定性';
    const types = new Set(colleges.map(c => c.type));
    const hasArts = types.has(CollegeType.ARTS);
    if (types.size === 1 && types.has(CollegeType.MEDICINE)) return '医科大学';
    if (types.size === 1 && types.has(CollegeType.LANG)) return '外国语大学';
    if (types.size === 1 && types.has(CollegeType.LAW)) return '政法大学';
    if (Array.from(types).every(t => [CollegeType.TRADE, CollegeType.ECON, CollegeType.ARTS].includes(t)) && (types.has(CollegeType.TRADE) || types.has(CollegeType.ECON))) return '财经大学';
    const newEng = [CollegeType.CS, CollegeType.IC, CollegeType.ROBOTICS];
    const tradEng = [CollegeType.CIVIL, CollegeType.ARCH, CollegeType.MECH, CollegeType.ELEC];
    const allEng = [...newEng, ...tradEng];
    const hasOnlyNewEng = Array.from(types).every(t => newEng.includes(t) || t === CollegeType.SCIENCE); 
    if (hasOnlyNewEng && types.size > 0 && !hasArts) return '电子科技大学';
    const hasOnlyEng = Array.from(types).every(t => allEng.includes(t) || t === CollegeType.SCIENCE);
    if (hasOnlyEng && types.size > 0 && !hasArts) return '理工大学';
    return '综合性大学';
};

export const calculateScale = (students: number, campusCount: number): UniversityScale => {
    if (students <= 6000) return UniversityScale.ACADEMY;
    if (students <= 10000) return UniversityScale.SMALL;
    if (students <= 15000) return UniversityScale.MEDIUM;
    if (students <= 25000) return UniversityScale.LARGE;
    if (students > 25000 && campusCount >= 2) return UniversityScale.MEGA;
    return UniversityScale.LARGE;
};

export const calculateRank = (gameState: GameState): { rank: UniversityRank, cap: number } => {
    const { students, socialRecognition, ministryRecognition, scale } = gameState;
    const soc = socialRecognition;
    const min = ministryRecognition;
    if (soc > 1000 && min > 2000 && (scale === UniversityScale.LARGE || scale === UniversityScale.MEGA)) return { rank: UniversityRank.PROJECT_985, cap: 999999 };
    if (soc > 800 && min > 1000 && (scale === UniversityScale.LARGE || scale === UniversityScale.MEGA)) return { rank: UniversityRank.PROJECT_211, cap: 999999 };
    if (soc > 400 && min > 400 && (scale === UniversityScale.MEDIUM || scale === UniversityScale.LARGE || scale === UniversityScale.MEGA)) return { rank: UniversityRank.TIER_1, cap: 25000 };
    if (soc > 300 && min > 300 && scale !== UniversityScale.ACADEMY && scale !== UniversityScale.SMALL) return { rank: UniversityRank.TIER_2, cap: 15000 };
    if (soc > 100 && min > 100 && scale !== UniversityScale.ACADEMY) return { rank: UniversityRank.TIER_3, cap: 10000 };
    return { rank: UniversityRank.STARTUP, cap: 6000 };
};

export const calculateDailyIncome = (state: GameState): number => {
    const J = state.ministryRecognition;
    let base = 0;
    if (state.uniType1 === UniType1.PUBLIC) {
        switch (state.rank) {
            case UniversityRank.STARTUP: base = 300000 * (Math.max(1, J) / 30); break;
            case UniversityRank.TIER_3: base = 1000000 * (Math.max(1, J) / 150); break;
            case UniversityRank.TIER_2: base = 2000000 * (Math.max(1, J) / 200); break;
            case UniversityRank.TIER_1: base = 4000000 * (Math.max(1, J) / 500); break;
            case UniversityRank.PROJECT_211: base = 8000000 * (Math.max(1, J) / 1000); break;
            case UniversityRank.PROJECT_985: base = 10000000 * (Math.max(1, J) / 1500); break;
        }
    } else if (state.uniType1 === UniType1.PRIVATE) {
        // Private universities get smaller government grants but rely more on tuition
        switch (state.rank) {
            case UniversityRank.STARTUP: base = 100000 * (Math.max(1, J) / 30); break;
            case UniversityRank.TIER_3: base = 300000 * (Math.max(1, J) / 150); break;
            case UniversityRank.TIER_2: base = 600000 * (Math.max(1, J) / 200); break;
            case UniversityRank.TIER_1: base = 1200000 * (Math.max(1, J) / 500); break;
            case UniversityRank.PROJECT_211: base = 2500000 * (Math.max(1, J) / 1000); break;
            case UniversityRank.PROJECT_985: base = 3500000 * (Math.max(1, J) / 1500); break;
        }
    }
    if (state.badges.includes('市重点')) base += 200000; 
    if (state.badges.includes('省重点')) base += 2000000; 
    if (state.badges.includes('国家重点')) base += 4000000; 
    
    if (state.ministryPenaltyEndDay && state.day <= state.ministryPenaltyEndDay) {
        base = Math.floor(base * 0.75);
    }
    return Math.floor(base);
};

export const getDeanManagementAbility = (collegeType: CollegeType, colleges: ActiveCollege[], facultyList: Faculty[]): number => {
    const college = colleges.find(c => c.type === collegeType);
    if (!college || !college.deanId) return 0;
    const dean = facultyList.find(f => f.id === college.deanId);
    return dean ? dean.managementAbility : 0;
};

export const calculateStats = (grid: CellData[][], currentStudents: number, currentHappiness: number, gameState: GameState) => {
    let maintenanceRequiredMonthly = 0, buildingRevenueMonthly = 0, capacity = 0, happyPoints = 0, buildingCount = 0, hasGate = false, labCount = 0, lectureHallCount = 0, libraryCount = 0;
    let disconnectedCount = 0; // 未连通道路的建筑数
    let serviceCoverageBonus = 0; // 服务覆盖带来的幸福度加成
    const currentDate = getGameDate(gameState.day);

    // Prep period: 2026-02-01 to 2027-09-01
    const prepEndDate = new Date('2027-09-01T00:00:00Z').getTime();
    const currentGameDateObj = new Date(GAME_START_TIMESTAMP + (gameState.day - 1) * MILLISECONDS_PER_DAY);
    const isPrepPeriod = currentGameDateObj.getTime() < prepEndDate;

    grid.forEach(row => row.forEach(cell => {
      if (cell.building === BuildingType.NONE || cell.building === BuildingType.FENCE) return;
      if (cell.building === BuildingType.SCHOOL_GATE) hasGate = true;
      const isFunctional = cell.constructionStatus === ConstructionStatus.COMPLETED || cell.building === BuildingType.CITY_ROAD || cell.building === BuildingType.ROAD;
      if (!isFunctional) return;

      let stats: VariantDef | BuildingDef | null = null;
      if (cell.buildingId) {
         if (cell.isOrigin) {
             const variants = VARIANTS[cell.building];
             if (variants && cell.variantId) stats = variants.find(v => v.id === cell.variantId) || null;
             if (!stats) stats = BUILDINGS[cell.building];

             // 检查道路连通性：未连通建筑不计入容量和收入
             const def = BUILDINGS[cell.building];
             const needsRoad = def.requiresRoadConnection !== false;
             const isConnected = !needsRoad || checkConnectedRoadAdjacency(grid, cell.x, cell.y,
               (() => { const v = variants?.find(v2 => v2.id === cell.variantId); const w = v ? v.width : (def.width || 1); const h = v ? v.height : (def.height || 1); return cell.rotation ? h : w; })(),
               (() => { const v = variants?.find(v2 => v2.id === cell.variantId); const w = v ? v.width : (def.width || 1); const h = v ? v.height : (def.height || 1); return cell.rotation ? w : h; })()
             ).valid;

             // Count logic
             if (cell.building !== BuildingType.ROAD && cell.building !== BuildingType.CITY_ROAD && cell.building !== BuildingType.PARK) {
                 buildingCount++;
                 if (!isConnected) disconnectedCount++;
             }
             if (cell.building === BuildingType.LABORATORY) labCount++;
             if (cell.building === BuildingType.LECTURE_HALL) lectureHallCount++;
             if (cell.building === BuildingType.LIBRARY) libraryCount++;

             // 服务覆盖对有capacity建筑的加成
             if (isConnected && stats && cell.constructionStatus === ConstructionStatus.COMPLETED) {
               const svc = getBuildingServiceInfo(grid, cell.x, cell.y);
               if (cell.building === BuildingType.DORMITORY) {
                 if (svc.food) serviceCoverageBonus += 5;
                 if (svc.study) serviceCoverageBonus += 3;
                 if (svc.recreation) serviceCoverageBonus += 3;
                 if (!svc.food && !svc.study && !svc.recreation) serviceCoverageBonus -= 8;
               }
               if (cell.building === BuildingType.LECTURE_HALL) {
                 if (svc.food) serviceCoverageBonus += 2;
                 if (svc.recreation) serviceCoverageBonus += 1;
               }
             }

             // 未连通建筑不贡献容量和收入
             if (isConnected && stats) {
               capacity += (stats.capacity || 0);
               buildingRevenueMonthly += (stats.revenue || 0);
             }
         }
      } else {
         stats = BUILDINGS[cell.building];
      }

      if (stats) {
         maintenanceRequiredMonthly += stats.maintenance;
         if (!cell.buildingId) {
           // 道路等无buildingId的直接加收入
           buildingRevenueMonthly += (stats.revenue || 0);
         }
         happyPoints += (stats.happiness || 0);
      }
    }));

    const fs = gameState.financeSettings;
    const totalDailyBudget = fs.totalDailyBudget;
    const w = fs.allocationWeights;
    const totalWeight = w.research + w.cafeteria + w.maintenance + w.student + w.faculty;
    const getRatio = (weight: number) => totalWeight === 0 ? 0 : weight / totalWeight;
    
    let maintenanceAllocated = totalDailyBudget * getRatio(w.maintenance);
    let maintenanceCostActual = maintenanceAllocated;
    let isMaintenanceFree = false;
    if (maintenanceRequiredMonthly === 0) { maintenanceCostActual = 0; isMaintenanceFree = true; }

    const researchAllocated = totalDailyBudget * getRatio(w.research);
    const cafeteriaAllocated = totalDailyBudget * getRatio(w.cafeteria);
    const studentAllocated = totalDailyBudget * getRatio(w.student);
    let facultyAllocated = totalDailyBudget * getRatio(w.faculty);

    let salaryRequiredMonthly = gameState.faculty.reduce((acc: number, f) => acc + f.salary, 0); 
    let salaryRequiredDaily = salaryRequiredMonthly / 30;
    
    // In Prep Period, salary is paid but maybe grant is different? 
    // Usually prep period assumes full grant or seed money burn.
    // Keeping logic simple: Prep period might not have students but has expenses.

    const totalExpense = researchAllocated + cafeteriaAllocated + studentAllocated + facultyAllocated + maintenanceCostActual + salaryRequiredDaily;
    const annualizedTuition = (currentStudents * fs.tuitionFeePerYear * 1000) / 365;
    const isOperational = currentStudents > 0 && gameState.faculty.length > 0;
    const potentialDailyGrant = calculateDailyIncome(gameState);
    const dailyGrant = isOperational ? potentialDailyGrant : (isPrepPeriod && gameState.uniType1 === UniType1.PUBLIC ? potentialDailyGrant * 0.5 : 0); // Reduced grant during prep if no students
    
    const buildingRevenueDaily = buildingRevenueMonthly / 30;
    const totalRevenue = buildingRevenueDaily + dailyGrant + annualizedTuition; 
    const netIncome = totalRevenue - totalExpense; 
    const maintenanceRatio = maintenanceRequiredMonthly > 0 ? (maintenanceAllocated * 30) / maintenanceRequiredMonthly : 1;
    
    let happinessFactors: { label: string; value: number; type: 'positive' | 'negative' }[] = [];
    
    // Happiness Calculation Split
    let studentSatisfaction = 50;
    let facultySatisfaction = 50;

    // Base happiness from Environment
    let envHappiness = buildingCount > 0 ? (happyPoints / buildingCount) : 0;
    if (envHappiness > 0) happinessFactors.push({ label: '校园环境', value: Math.round(envHappiness), type: 'positive' });

    // 服务覆盖加成
    let svcBonus = buildingCount > 0 ? serviceCoverageBonus / buildingCount : 0;
    if (svcBonus > 0) happinessFactors.push({ label: '设施覆盖', value: Math.round(svcBonus), type: 'positive' });
    if (svcBonus < 0) happinessFactors.push({ label: '缺乏配套', value: Math.round(svcBonus), type: 'negative' });

    // 道路断连惩罚
    if (disconnectedCount > 0) {
      const penalty = -Math.min(15, disconnectedCount * 3);
      happinessFactors.push({ label: '建筑未连通', value: penalty, type: 'negative' });
      envHappiness += penalty;
    }

    // Student Factors
    let sHapp = 50 + envHappiness + svcBonus;
    if (fs.tuitionFeePerYear > 20) { const penalty = (fs.tuitionFeePerYear - 20) * 0.5; sHapp -= penalty; }
    if (maintenanceRatio < 0.8) { sHapp -= 10; }
    if (cafeteriaAllocated > currentStudents * 5) { sHapp += 5; }
    if (studentAllocated > currentStudents * 2) { sHapp += 5; }
    studentSatisfaction = Math.min(100, Math.max(0, sHapp));

    // Faculty Factors
    let fHapp = 50 + envHappiness + svcBonus;
    if (maintenanceRatio < 0.8) { fHapp -= 5; }
    // 教职工薪资预算是否充足
    if (salaryRequiredDaily > 0 && facultyAllocated < salaryRequiredDaily * 0.8) { fHapp -= 10; happinessFactors.push({ label: '薪资预算不足', value: -10, type: 'negative' }); }
    // 科研经费充足加成
    if (researchAllocated > 5000) { fHapp += 3; }
    facultySatisfaction = Math.min(100, Math.max(0, fHapp));

    let avgHappiness = (studentSatisfaction * (currentStudents || 1) + facultySatisfaction * (gameState.faculty.length || 1)) / ((currentStudents || 1) + (gameState.faculty.length || 1));
    if (currentStudents === 0 && gameState.faculty.length === 0) avgHappiness = 50;

    const researchScore = (labCount * 10 + lectureHallCount * 2) * (researchAllocated > 1000 ? 1 : 0.5);
    const socialRecognition = Math.floor((currentStudents * (avgHappiness / 100)) + (buildingCount * 2) + (researchScore));
    const infraScore = (labCount * 50) + (lectureHallCount * 20) + (libraryCount * 100);
    const ministryRecognition = Math.floor(infraScore);

    return { 
        maintenanceRequiredMonthly, maintenanceAllocated, maintenanceRatio, salaryRequiredDaily, facultyAllocated,
        researchAllocated, cafeteriaAllocated, studentAllocated, buildingRevenueDaily,
        potentialDailyGrant, dailyGrant, totalRevenue, totalExpense, netIncome, capacity, happiness: avgHappiness, 
        studentSatisfaction, facultySatisfaction,
        hasGate, buildingCount, socialRecognition, ministryRecognition, labCount, lectureHallCount, isOperational,
        annualizedTuition, maintenanceCostActual, isMaintenanceFree, isPrepPeriod, happinessFactors
    };
};

/** @deprecated 使用 checkConnectedRoadAdjacency 代替 */
export const checkRoadAdjacency = (grid: CellData[][], x: number, y: number, width: number, height: number): boolean => {
    const result = checkConnectedRoadAdjacency(grid, x, y, width, height);
    return result.valid;
};

export const calculateZones = (grid: CellData[][]): CellData[][] => {
    for(let y=0; y<GRID_SIZE; y++) for(let x=0; x<GRID_SIZE; x++) if(grid[y][x].building === BuildingType.NONE) grid[y][x].isZoned = false;
    const zoneRadius = 3;
    for(let y=0; y<GRID_SIZE; y++) {
        for(let x=0; x<GRID_SIZE; x++) {
            const cell = grid[y][x];
            // 只有连通到校园的道路才产生可建区域
            const isValidRoad = (cell.building === BuildingType.ROAD || cell.building === BuildingType.CITY_ROAD || cell.building === BuildingType.SCHOOL_GATE)
                                && cell.isConnectedToCampus !== false;
            if (isValidRoad) {
                for(let dy=-zoneRadius; dy<=zoneRadius; dy++) {
                    for(let dx=-zoneRadius; dx<=zoneRadius; dx++) {
                        const ny = y + dy, nx = x + dx;
                        if(ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE && grid[ny][nx].building === BuildingType.NONE) grid[ny][nx].isZoned = true;
                    }
                }
            }
        }
    }
    return grid;
};

/**
 * 统一网格更新：路网拓扑 → 区域标记 → 服务覆盖
 * 每次道路或建筑增删后调用
 */
export const updateFullGrid = (grid: CellData[][]): void => {
    updateRoadNetwork(grid);
    calculateZones(grid);
    calculateServiceCoverage(grid);
};

// Re-export for convenience
export { checkConnectedRoadAdjacency, updateRoadNetwork } from './roadNetwork';
export { calculateServiceCoverage, getBuildingServiceInfo } from './serviceRadius';

export const getThickLinePoints = (x0: number, y0: number, x1: number, y1: number, width: number) => {
    const points: {x: number, y: number}[] = [];
    const radius = width / 2;
    const minX = Math.floor(Math.min(x0, x1) - radius), maxX = Math.ceil(Math.max(x0, x1) + radius);
    const minY = Math.floor(Math.min(y0, y1) - radius), maxY = Math.ceil(Math.max(y0, y1) + radius);
    const dx = x1 - x0, dy = y1 - y0, lenSq = dx*dx + dy*dy;
    for (let cy = minY; cy <= maxY; cy++) {
        for (let cx = minX; cx <= maxX; cx++) {
            if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE) continue;
            let t = 0;
            if (lenSq !== 0) t = ((cx - x0) * dx + (cy - y0) * dy) / lenSq;
            t = Math.max(0, Math.min(1, t));
            if (Math.sqrt((cx - (x0 + t * dx)) ** 2 + (cy - (y0 + t * dy)) ** 2) <= Math.max(0.6, radius)) points.push({x: cx, y: cy});
        }
    }
    return points;
}
