# 建筑系统重写计划 - 城市天际线风格

## 核心改动概览

将现有的简单放置系统重写为以**路网拓扑**为核心的建筑系统：
- 道路形成有向连通图，必须连接到城市道路才有效
- 建筑必须紧邻**已连通**的道路才能放置
- 路口自动检测（T字/十字/弯道/直道），纹理自动适配
- 建筑服务半径覆盖系统（食堂、图书馆、公园等辐射周围区域）
- 已连通/未连通道路视觉区分

---

## 第一步：类型系统扩展 (`src/types.ts`)

### 1.1 新增 RoadConnection 类型
```typescript
// 道路连接方向
interface RoadConnections {
  north: boolean;  // y-1
  south: boolean;  // y+1
  east: boolean;   // x+1
  west: boolean;   // x-1
}

// 道路形态类型
type RoadShape =
  | 'straight_h' | 'straight_v'     // 直道
  | 'corner_ne' | 'corner_nw' | 'corner_se' | 'corner_sw'  // 弯道
  | 't_north' | 't_south' | 't_east' | 't_west'  // T字路口
  | 'cross'       // 十字路口
  | 'dead_end_n' | 'dead_end_s' | 'dead_end_e' | 'dead_end_w'  // 死胡同
  | 'isolated'    // 孤立
```

### 1.2 扩展 CellData
```typescript
interface CellData {
  // ...现有字段保留...
  roadConnections?: RoadConnections;  // 道路连接状态
  roadShape?: RoadShape;             // 道路形态（自动计算）
  isConnectedToCity?: boolean;       // 是否连通到城市道路网
  servicecoverage?: {               // 被哪些服务覆盖
    food?: boolean;                  // 食堂覆盖
    study?: boolean;                 // 图书馆覆盖
    recreation?: boolean;            // 公园/休闲覆盖
  };
}
```

### 1.3 扩展 BuildingDef
```typescript
interface BuildingDef {
  // ...现有字段保留...
  serviceRadius?: number;     // 服务辐射半径（格子数）
  serviceType?: 'food' | 'study' | 'recreation';  // 服务类型
  requiresRoadConnection?: boolean;  // 是否需要道路连接（默认true，PARK/FENCE除外）
}
```

---

## 第二步：路网拓扑引擎 (`src/utils/roadNetwork.ts` - 新文件)

### 2.1 连通性计算 (BFS)
```typescript
function calculateRoadConnectivity(grid: CellData[][]): CellData[][]
```
- 从所有 CITY_ROAD 单元格出发做 BFS
- 沿相邻（上下左右）的 ROAD/CITY_ROAD 单元格扩散
- 标记所有可达单元格的 `isConnectedToCity = true`
- 不可达的标记为 `false`

### 2.2 道路形态检测
```typescript
function calculateRoadShapes(grid: CellData[][]): CellData[][]
```
- 对每个 ROAD/CITY_ROAD 单元格，检查上下左右四方向是否有相邻道路
- 根据连接数和方向判断 RoadShape：
  - 0个连接 → isolated
  - 1个连接 → dead_end_x
  - 2个连接（对向）→ straight_h/v
  - 2个连接（相邻）→ corner_xx
  - 3个连接 → t_xxx
  - 4个连接 → cross

### 2.3 统一更新函数
```typescript
function updateRoadNetwork(grid: CellData[][]): CellData[][]
```
- 按顺序调用：calculateRoadShapes → calculateRoadConnectivity → calculateZones
- 在每次道路增删后调用

---

## 第三步：服务半径系统 (`src/utils/serviceRadius.ts` - 新文件)

### 3.1 计算服务覆盖
```typescript
function calculateServiceCoverage(grid: CellData[][]): CellData[][]
```
- 遍历所有 COMPLETED 且有 serviceType 的建筑（仅 isOrigin 格）
- 以建筑中心为圆心，serviceRadius 为半径，用曼哈顿距离标记覆盖
- 设置被覆盖格子的 `serviceCoverage` 对应字段

### 3.2 服务半径配置
| 建筑 | serviceType | serviceRadius |
|------|-------------|---------------|
| CAFETERIA | food | 12 |
| LIBRARY | study | 15 |
| PARK | recreation | 8 |

### 3.3 服务覆盖影响
- 在 calculateStats 中：
  - 宿舍如果被 food 覆盖，幸福度 +5
  - 宿舍如果被 study 覆盖，幸福度 +3
  - 宿舍如果被 recreation 覆盖，幸福度 +3
  - 教学楼如果被 food 覆盖，幸福度 +2
  - 未被任何服务覆盖的建筑，幸福度 -10

---

## 第四步：重写建筑放置逻辑 (`src/utils/gameUtils.ts`)

### 4.1 强化 checkRoadAdjacency
```typescript
function checkRoadAdjacency(grid, x, y, width, height):
  { valid: boolean; reason?: string }
```
- 不仅检查相邻是否有道路，还检查该道路是否 `isConnectedToCity`
- 返回具体失败原因：'no_road' | 'road_not_connected'

### 4.2 修改 placeBuilding
- 调用新的 checkRoadAdjacency，使用连通性检查
- 放置后触发 `calculateServiceCoverage` 更新
- PARK 和 FENCE 豁免道路要求（保持不变）

### 4.3 修改 commitRoad
- 放置后调用 `updateRoadNetwork` 代替原来的 `calculateZones`
- 新道路可能连通之前断开的道路 → 需要全局重算

### 4.4 修改 removeBuilding
- 删除道路后调用 `updateRoadNetwork`
- 可能导致其他道路/建筑断开连接 → 需要标记警告

---

## 第五步：道路纹理系统 (`src/components/game/Visuals.tsx`)

### 5.1 新增 getRoadTextureStyle
```typescript
function getRoadTextureStyle(cell: CellData): CSSProperties
```
- 根据 `roadShape` 返回不同的 CSS 背景：
  - straight: 纵向或横向车道线
  - corner: 弧形转弯纹理（CSS gradient 实现）
  - t_junction: T字路口标记
  - cross: 十字路口标记
  - dead_end: 尽头标记

### 5.2 连通状态视觉
- 已连通道路：正常颜色
- 未连通道路：暗红色/灰色高亮 + 断开图标警告

---

## 第六步：渲染系统更新 (`src/components/game/GameViewport.tsx`)

### 6.1 道路纹理渲染
- 替换现有的 getTextureStyle 中道路处理部分
- 使用新的 getRoadTextureStyle 根据 roadShape 渲染

### 6.2 服务半径可视化
- 当选中建筑或悬浮在有 serviceRadius 的建筑时：
  - 显示半透明圆形覆盖区域
  - food: 橙色圈
  - study: 蓝色圈
  - recreation: 绿色圈

### 6.3 连通状态指示
- 未连通的道路格子显示红色叉号或虚线边框
- 未连通道路旁的建筑显示警告图标（⚠️无道路连接）

### 6.4 Ghost 预览增强
- 放置预览时同时显示服务半径预览圈
- 红色/绿色更明确地标示放置有效性

---

## 第七步：统计系统更新 (`src/utils/gameUtils.ts` - calculateStats)

### 7.1 服务覆盖加入幸福度计算
- 遍历所有已完成建筑的 servicesCoverage
- 根据覆盖情况调整幸福度（见第三步 3.3）

### 7.2 道路连通性惩罚
- 如果有建筑旁边的道路未连通到城市，该建筑不计入容量和收入
- 建筑本身可以渲染，但"无法正常运作"

---

## 第八步：游戏循环更新 (`src/components/game/hooks/useGameLogic.ts`)

### 8.1 建筑完工时触发服务覆盖重算
- 建筑从 CONSTRUCTING → COMPLETED 时，调用 calculateServiceCoverage

### 8.2 道路修改后全局更新
- placeBuilding / commitRoad / removeBuilding 后统一调用 updateRoadNetwork + calculateServiceCoverage

---

## 第九步：UI 更新 (`src/components/game/ui/`)

### 9.1 BuildingInspector 增强
- 显示服务半径信息（覆盖了多少建筑）
- 显示道路连接状态
- 如果未连通，显示红色警告

### 9.2 GameHUD 信息面板
- 显示总体服务覆盖率（食堂覆盖率、图书馆覆盖率等）
- 可能加入覆盖率目标提示

---

## 实施顺序

1. **类型扩展** - 修改 types.ts
2. **路网引擎** - 新建 roadNetwork.ts，实现 BFS + 形态检测
3. **服务半径** - 新建 serviceRadius.ts
4. **建筑数据** - 修改 gameData.ts 添加 serviceRadius/serviceType
5. **放置逻辑** - 重写 gameUtils.ts 的放置/删除/统计函数
6. **游戏循环** - 更新 useGameLogic.ts 集成新系统
7. **道路纹理** - 更新 Visuals.tsx 路口纹理
8. **渲染系统** - 更新 GameViewport.tsx 服务圈 + 连通指示
9. **UI 面板** - 更新 Inspector 和 HUD

---

## 不改动的部分

- 3D 等距渲染引擎（保留 Cube3D、Building3DBox）
- 建筑变体系统（保留 VARIANTS 结构）
- 施工进度系统（保留 CONSTRUCTING → COMPLETED 流程）
- 触摸手势系统（保留缩放/旋转/长按删除）
- 财务/学术/招生等非建筑相关系统
