
import { CellData, BuildingType, RoadConnections, RoadShape, GRID_SIZE } from '../types';

/** 判断一个格子是否算作"道路"（用于连通性和形态检测） */
const isRoadCell = (cell: CellData): boolean =>
  cell.building === BuildingType.ROAD ||
  cell.building === BuildingType.CITY_ROAD;

/** 判断一个格子是否算作"校园入口"（BFS起点） */
const isCampusEntrance = (cell: CellData): boolean =>
  cell.building === BuildingType.CITY_ROAD ||
  cell.building === BuildingType.SCHOOL_GATE;

/**
 * 计算道路连接方向：检查上下左右是否有相邻道路/校门
 */
const getRoadConnections = (grid: CellData[][], x: number, y: number): RoadConnections => {
  const check = (nx: number, ny: number): boolean => {
    if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return false;
    const c = grid[ny][nx];
    return isRoadCell(c) || c.building === BuildingType.SCHOOL_GATE;
  };
  return {
    north: check(x, y - 1),
    south: check(x, y + 1),
    east: check(x + 1, y),
    west: check(x - 1, y),
  };
};

/**
 * 根据四方向连接推断道路形态
 */
const deriveRoadShape = (conn: RoadConnections): RoadShape => {
  const { north, south, east, west } = conn;
  const count = [north, south, east, west].filter(Boolean).length;

  if (count === 0) return 'isolated';

  if (count === 1) {
    if (north) return 'dead_end_n';
    if (south) return 'dead_end_s';
    if (east) return 'dead_end_e';
    return 'dead_end_w';
  }

  if (count === 2) {
    if (north && south) return 'straight_v';
    if (east && west) return 'straight_h';
    if (north && east) return 'corner_ne';
    if (north && west) return 'corner_nw';
    if (south && east) return 'corner_se';
    return 'corner_sw';
  }

  if (count === 3) {
    if (!north) return 't_south'; // 缺北 → 朝南的T
    if (!south) return 't_north'; // 缺南 → 朝北的T
    if (!east) return 't_west';
    return 't_east';
  }

  return 'cross';
};

/**
 * 计算所有道路的连接形态（roadConnections + roadShape）
 */
export const calculateRoadShapes = (grid: CellData[][]): void => {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = grid[y][x];
      if (isRoadCell(cell)) {
        const conn = getRoadConnections(grid, x, y);
        cell.roadConnections = conn;
        cell.roadShape = deriveRoadShape(conn);
      } else {
        cell.roadConnections = undefined;
        cell.roadShape = undefined;
      }
    }
  }
};

/**
 * BFS计算道路连通性：从校门/城市道路出发，标记所有可达道路
 * 连通的道路和紧邻连通道路的建筑才能正常运作
 */
export const calculateRoadConnectivity = (grid: CellData[][]): void => {
  // 先清除所有连通标记
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      grid[y][x].isConnectedToCampus = undefined;
    }
  }

  // BFS 从所有校园入口出发
  const queue: [number, number][] = [];
  const visited = new Set<string>();

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (isCampusEntrance(grid[y][x])) {
        const key = `${x},${y}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push([x, y]);
          grid[y][x].isConnectedToCampus = true;
        }
      }
    }
  }

  // BFS 沿道路扩展
  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) continue;
      const key = `${nx},${ny}`;
      if (visited.has(key)) continue;

      const neighbor = grid[ny][nx];
      // 道路和校门可以传播连通性
      if (isRoadCell(neighbor) || neighbor.building === BuildingType.SCHOOL_GATE) {
        visited.add(key);
        neighbor.isConnectedToCampus = true;
        queue.push([nx, ny]);
      }
    }
  }

  // 标记未连通的道路
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = grid[y][x];
      if (isRoadCell(cell) && !cell.isConnectedToCampus) {
        cell.isConnectedToCampus = false;
      }
    }
  }
};

/**
 * 检查建筑是否紧邻已连通的道路
 * 返回详细结果而非简单布尔值
 */
export const checkConnectedRoadAdjacency = (
  grid: CellData[][], x: number, y: number, width: number, height: number
): { valid: boolean; reason?: string } => {
  let hasAdjacentRoad = false;
  let hasConnectedRoad = false;

  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (const [ddx, ddy] of dirs) {
        const nx = x + dx + ddx;
        const ny = y + dy + ddy;
        if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) continue;
        // 不检查建筑自身占地范围内的格子
        if (nx >= x && nx < x + width && ny >= y && ny < y + height) continue;
        const neighbor = grid[ny][nx];
        if (isRoadCell(neighbor) || neighbor.building === BuildingType.SCHOOL_GATE) {
          hasAdjacentRoad = true;
          if (neighbor.isConnectedToCampus) {
            hasConnectedRoad = true;
          }
        }
      }
    }
  }

  if (!hasAdjacentRoad) return { valid: false, reason: '需要紧邻道路' };
  if (!hasConnectedRoad) return { valid: false, reason: '道路未连通校门' };
  return { valid: true };
};

/**
 * 一体化更新：形态 → 连通性 → 区域标记
 * 每次道路增删后调用
 */
export const updateRoadNetwork = (grid: CellData[][]): void => {
  calculateRoadShapes(grid);
  calculateRoadConnectivity(grid);
};
