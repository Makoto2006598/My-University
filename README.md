<br />
<div align="center">
  <a href="https://github.com/Makoto2006598/My-University">
    <img src="public/logo.png" alt="My University Logo" width="120" height="120">
  </a>

  <h3 align="center">My University | 我的大学</h3>

  <p align="center">
    打造你的梦想校园，培养未来的精英！<br>
    一款基于 Web 的大学建造与经营模拟游戏。
    <br />
    <br />
    <a href="https://makoto2006598.github.io/My-University/">在线试玩</a>
    ·
    <a href="https://github.com/Makoto2006598/My-University/issues">报告 Bug</a>
    ·
    <a href="https://github.com/Makoto2006598/My-University/issues">提出新功能</a>
  </p>
</div>

<div align="center">

![Status](https://img.shields.io/badge/Status-Development-yellow?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile-brightgreen?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)

</div>

<br />

## 项目介绍

**My University** 是一款受《双点校园》、《城市天际线》等经典游戏启发的模拟经营游戏。玩家扮演新上任的大学校长，从一片荒地开始，规划校园道路与建筑，招聘教授，设立学院，管理财务，最终将学校发展为全国顶尖大学。

游戏使用纯 Web 技术构建，支持 PC 和移动端浏览器，通过 GitHub Pages 部署即可在线游玩。

<br />

## 核心玩法

### 校园建设

- **54×54 网格地图**，自由规划校园布局
- **11 种建筑类型**：教学楼、宿舍、实验室、图书馆、食堂、公园、校门、道路等
- **建筑变体系统**：同一建筑有不同尺寸和造价可选
- **施工系统**：建筑需要建造时间，完工后才能投入使用
- **2D/3D 视角切换**：支持 3D 透视旋转和纯 2D 平面两种模式

### 道路拓扑引擎

- **路网连通性**：BFS 从校门出发计算道路连通性，未连通道路显示红色警告
- **道路形态检测**：自动识别直道、弯道、T 字路口、十字路口、死胡同并渲染对应纹理
- **建筑必须邻接已连通道路**，否则不贡献容量和收入

### 服务半径覆盖

- **食堂**（半径 12）、**图书馆**（半径 15）、**公园**（半径 8）各有服务覆盖范围
- 宿舍获得食物/学习/休闲覆盖时增加幸福度加成
- 未覆盖的宿舍会扣减幸福度
- 放置时预览服务半径范围

### 学院与教务

- **14 个学院**：文学院、理学院、医学院、计算机学院、集成电路学院、机器人学院、土木学院、建筑学院、机械学院、电气学院、外语学院、法学院、商学院、经济学院
- **学院前置条件**：工科需先设立理学院，文科需先设立文学院
- **院长/副院长任命**：影响学院管理能力和科研产出
- **19+ 个专业方向**

### 人事管理

- **教职工五级职称**：助教 → 讲师 → 副教授 → 教授 → 院士
- **四种招聘渠道**：部委分配、社会招聘、猎头（低/中/高端）
- **满意度系统**：薪资、环境、科研经费、预算充足度综合影响
- **离职机制**：满意度过低的教职工有概率离职

### 招生系统

- **高考分数制**：学生 0-750 分，设定最低录取线
- **招生阶段**：每年 7 月准备 → 7 月中旬开始录取 → 8 月初结束
- **满意度影响招生**：高满意度提升招生量（1.3x）和生源质量（+9 分），低满意度则相反
- **学生属性**：天赋、努力程度、家庭财富、个性标签

### 财务经营

- **收入来源**：学费、政府拨款、建筑收入、联络处拨款
- **支出项目**：教职工薪资、设施维护、食堂补贴、科研经费、学生补贴
- **预算分配**：五项权重自由调节，每月需确认预算
- **财务历史图表**：收支趋势可视化

### 宣传与公关

- **社会知名度**：通过社交媒体宣传提升（标准/高端/大规模三档）
- **部委认可度**：通过政府关系公关提升（花费 500 万/次）
- **过度宣传惩罚**：频繁宣传会触发减益效果

### 联络处任务

- **任务树系统**：互斥的发展路线（综合性大学 / 医科大学 / 理工大学 / 文经大学）
- **任务要求**：需要特定学院、建筑数量、院长任命等条件
- **任务奖励**：大学称号、知名度加成、专项拨款

### 大学发展

- **规模等级**：学院 → 小型 → 中型 → 大型 → 超大型
- **大学排名**：初创大学 → 三本 → 二本 → 一本 → 211 → 985

<br />

## 操作说明

| 操作 | PC | 移动端 |
|------|-----|--------|
| 平移视角 | 左键拖拽 / WASD | 单指拖拽 |
| 旋转视角（3D） | 鼠标中键拖拽 | 双指旋转 |
| 缩放 | 滚轮 | 双指缩放 |
| 放置建筑 | 左键点击 | 点击 |
| 拆除建筑 | 右键点击 | 长按 |
| 旋转建筑 | Q / E 键 | 旋转按钮 |
| 切换 2D/3D | 右下角按钮 | 右下角按钮 |

<br />

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript 5.8 |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS |
| 图标 | Lucide React |
| 状态管理 | React Hooks（无外部依赖） |
| 存档 | LocalStorage |
| 部署 | GitHub Pages（自动 CI/CD） |

<br />

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/Makoto2006598/My-University.git
cd My-University

# 安装依赖
npm install

# 启动开发服务器（端口 3000）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

<br />

## 项目结构

```
src/
├── components/game/
│   ├── CampusPlanner.tsx       # 主游戏界面与交互
│   ├── GameViewport.tsx        # 地图渲染视口（2D/3D）
│   ├── Visuals.tsx             # 纹理系统与 3D 建筑模型
│   ├── hooks/useGameLogic.ts   # 核心游戏循环与状态
│   ├── ui/                     # HUD、顶栏、建筑检查器
│   ├── panels/                 # 概况/教务/人事/财务/宣传/招生/联络
│   └── modals/                 # 设置、存档、事件弹窗
├── data/gameData.ts            # 建筑/学院/任务数据定义
├── utils/
│   ├── gameUtils.ts            # 统计计算、格子操作
│   ├── roadNetwork.ts          # 路网拓扑引擎（BFS 连通性 + 形态检测）
│   ├── serviceRadius.ts        # 服务半径覆盖系统
│   ├── studentSystem.ts        # 学生生成与属性系统
│   └── saveManager.ts          # 存档管理
└── types.ts                    # 全部 TypeScript 类型定义
```

<br />

## 性能优化

- **GridCell 独立 memo 组件**：自定义比较函数，只在 cell 数据变化时重渲染
- **空白格子跳过渲染**：减少 ~2000 个 DOM 节点
- **纹理样式缓存**：useMemo 按 cell 属性依赖
- **连通性预计算**：calculateStats 直接读缓存，不再每帧 BFS
- **BFS 用 Uint8Array**：替代 Set\<string\>
- **Grid 行级克隆**：无施工时保持引用不变

<br />

## 关于开发者

本项目由一名计算机专业大一学生独立发起。

- **初衷**：城市天际线玩太多了产生的奇妙想法
- **AI 辅助**：开发过程中深度使用 AI 辅助编程，探索 AI 赋能游戏开发的可能性

<br />

## License

[MIT License](LICENSE)
