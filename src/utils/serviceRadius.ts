
import { CellData, BuildingType, ConstructionStatus, ServiceCoverage, GRID_SIZE } from '../types';
import { BUILDINGS, VARIANTS } from '../data/gameData';

/**
 * 计算所有建筑的服务覆盖范围
 * 使用曼哈顿距离，以建筑中心为圆心辐射
 */
export const calculateServiceCoverage = (grid: CellData[][]): void => {
  // 清除所有服务覆盖标记
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      grid[y][x].serviceCoverage = undefined;
    }
  }

  // 遍历所有已完工且有服务半径的建筑
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = grid[y][x];
      if (!cell.isOrigin) continue;
      if (cell.constructionStatus !== ConstructionStatus.COMPLETED) continue;

      const def = BUILDINGS[cell.building];
      if (!def.serviceType || !def.serviceRadius) continue;

      // 获取建筑尺寸以计算中心点
      const variants = VARIANTS[cell.building];
      const variant = variants?.find(v => v.id === cell.variantId);
      const bw = variant ? variant.width : (def.width || 1);
      const bh = variant ? variant.height : (def.height || 1);
      const w = cell.rotation ? bh : bw;
      const h = cell.rotation ? bw : bh;

      const centerX = x + w / 2;
      const centerY = y + h / 2;
      const radius = def.serviceRadius;
      const serviceType = def.serviceType;

      // 曼哈顿距离覆盖
      const minY = Math.max(0, Math.floor(centerY - radius));
      const maxY = Math.min(GRID_SIZE - 1, Math.ceil(centerY + radius));
      const minX = Math.max(0, Math.floor(centerX - radius));
      const maxX = Math.min(GRID_SIZE - 1, Math.ceil(centerX + radius));

      for (let ty = minY; ty <= maxY; ty++) {
        for (let tx = minX; tx <= maxX; tx++) {
          const dist = Math.abs(tx + 0.5 - centerX) + Math.abs(ty + 0.5 - centerY);
          if (dist <= radius) {
            const target = grid[ty][tx];
            if (!target.serviceCoverage) {
              target.serviceCoverage = {};
            }
            target.serviceCoverage[serviceType] = true;
          }
        }
      }
    }
  }
};

/**
 * 获取某个建筑的服务覆盖统计
 */
export const getBuildingServiceInfo = (
  grid: CellData[][], originX: number, originY: number
): { food: boolean; study: boolean; recreation: boolean } => {
  const cell = grid[originY][originX];
  const def = BUILDINGS[cell.building];
  const variants = VARIANTS[cell.building];
  const variant = variants?.find(v => v.id === cell.variantId);
  const bw = variant ? variant.width : (def.width || 1);
  const bh = variant ? variant.height : (def.height || 1);
  const w = cell.rotation ? bh : bw;
  const h = cell.rotation ? bw : bh;

  let food = false, study = false, recreation = false;

  // 检查建筑占地范围内是否有服务覆盖
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const t = grid[originY + dy]?.[originX + dx];
      if (t?.serviceCoverage) {
        if (t.serviceCoverage.food) food = true;
        if (t.serviceCoverage.study) study = true;
        if (t.serviceCoverage.recreation) recreation = true;
      }
    }
  }

  return { food, study, recreation };
};
