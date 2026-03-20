
export type SidebarTab = 'OVERVIEW' | 'BUILD' | 'ACADEMIC' | 'HR' | 'PUBLICITY' | 'LIAISON' | 'ADMISSIONS' | 'FINANCE' | null;

export enum BuildingType {
  NONE = 'NONE',
  DORMITORY = 'DORMITORY',
  LECTURE_HALL = 'LECTURE_HALL',
  CAFETERIA = 'CAFETERIA',
  LABORATORY = 'LABORATORY',
  LIBRARY = 'LIBRARY',
  PARK = 'PARK',
  ROAD = 'ROAD',
  SCHOOL_GATE = 'SCHOOL_GATE',
  FENCE = 'FENCE',
  CITY_ROAD = 'CITY_ROAD'
}

export enum UniType1 {
  PUBLIC = '公立大学',
  PRIVATE = '民办大学'
}

export enum UniType2 {
  RESEARCH = '研究型',
  APPLIED_RESEARCH = '研究应用型'
}

// College Categories
export enum CollegeType {
  // Base
  ARTS = 'ARTS', // 文学院
  SCIENCE = 'SCIENCE', // 理学院
  MEDICINE = 'MEDICINE', // 医学院
  // New Engineering (Needs Science)
  CS = 'CS', // 计算机
  IC = 'IC', // 集成电路
  ROBOTICS = 'ROBOTICS', // 机器人
  // Trad Engineering (Needs Science)
  CIVIL = 'CIVIL', // 土木
  ARCH = 'ARCH', // 建筑
  MECH = 'MECH', // 机械
  ELEC = 'ELEC', // 电气
  // Liberal Arts (Needs Arts)
  LANG = 'LANG', // 外国语
  LAW = 'LAW', // 法学
  TRADE = 'TRADE', // 贸易
  ECON = 'ECON', // 经济
}

export interface CollegeDef {
  type: CollegeType;
  name: string;
  category: 'BASE' | 'NEW_ENG' | 'TRAD_ENG' | 'LIB_ARTS';
  dependency?: CollegeType; // Prerequisite college
  description: string;
}

export interface MajorDef {
  id: string;
  name: string;
  collegeType: CollegeType;
}

export type ServiceType = 'food' | 'study' | 'recreation';

export interface BuildingDef {
  type: BuildingType;
  name: string;
  cost: number;
  maintenance: number;
  capacity?: number; // Students
  happiness?: number;
  revenue?: number; // Per tick
  constructionTime: number; // Ticks required to build
  color: string;
  icon: string;
  description?: string;
  textureType?: 'asphalt' | 'paved' | 'grass' | 'floor' | 'brick' | 'glass' | 'concrete' | 'tech';
  width?: number;
  height?: number;
  // Road network
  requiresRoadConnection?: boolean; // 是否需要连通道路（默认true，PARK/FENCE除外）
  // Service radius
  serviceRadius?: number;    // 服务辐射半径（曼哈顿距离，格数）
  serviceType?: ServiceType; // 服务类型
}

export interface VariantDef {
  id: string;
  label: string;
  width: number;
  height: number;
  cost: number;
  maintenance: number;
  capacity?: number;
  happiness?: number;
  revenue?: number;
  texture?: string;
  description?: string;
}

export enum ConstructionStatus {
  PLANNED = 'PLANNED',
  CONSTRUCTING = 'CONSTRUCTING',
  COMPLETED = 'COMPLETED'
}

// 道路连接方向
export interface RoadConnections {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

// 道路形态类型（根据相邻道路自动计算）
export type RoadShape =
  | 'straight_h' | 'straight_v'
  | 'corner_ne' | 'corner_nw' | 'corner_se' | 'corner_sw'
  | 't_north' | 't_south' | 't_east' | 't_west'
  | 'cross'
  | 'dead_end_n' | 'dead_end_s' | 'dead_end_e' | 'dead_end_w'
  | 'isolated';

// 服务覆盖类型
export interface ServiceCoverage {
  food?: boolean;       // 食堂覆盖
  study?: boolean;      // 图书馆覆盖
  recreation?: boolean; // 公园/休闲覆盖
}

export interface CellData {
  x: number;
  y: number;
  building: BuildingType;
  buildingId?: string;
  isOrigin?: boolean;
  variantId?: string;
  // Construction
  constructionStatus?: ConstructionStatus;
  constructionLeft?: number;
  rotation?: number;
  customName?: string;
  // Zone
  isZoned?: boolean;
  roadZoneDepth?: number;
  // Road network topology
  roadConnections?: RoadConnections;
  roadShape?: RoadShape;
  isConnectedToCampus?: boolean; // 是否连通到校门/城市道路
  // Service radius
  serviceCoverage?: ServiceCoverage;
}

// HR Types
export enum FacultyTitle {
  TA = '助教',
  LECTURER = '讲师',
  ASSOC_PROF = '副教授',
  PROF = '教授',
  ACADEMICIAN = '院士'
}

export enum RecruitmentMethod {
  MINISTRY = 'MINISTRY', // 教育部分配
  SOCIAL = 'SOCIAL', // 社会招聘
  HEADHUNTER_LOW = 'HEADHUNTER_LOW', // 100k
  HEADHUNTER_MID = 'HEADHUNTER_MID', // 500k
  HEADHUNTER_HIGH = 'HEADHUNTER_HIGH' // 1M
}

export interface Faculty {
  id: string;
  name: string;
  title: FacultyTitle;
  salary: number; // Monthly
  department: CollegeType; // Changed from string
  researchAbility: number;
  managementAbility: number; // Replaced teachingAbility
  hireDate: number; // Game Day
  satisfaction: number; // 0-100, New Field
}

export interface ActiveCollege {
  id: string;
  type: CollegeType;
  deanId?: string; // Faculty ID
  viceDeanId?: string; // New: Vice Dean
  activeMajors: string[]; // Major IDs
  foundingDay?: number; // New: Founding Day
  assignedBuildingIds?: string[]; // New: Buildings assigned to this college
}

// Student System
export enum Gender {
  MALE = '男',
  FEMALE = '女'
}

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  gaokaoScore: number; // 0-750
  talent: number; // 0-100
  effort: number; // 0-100
  wealth: number; // 0-100
  tags: string[];
  satisfaction: number; // 0-100, New Field
  college: CollegeType; // New Field, for Dean management bonus
}

export enum UniversityScale {
  ACADEMY = '学院', // <= 6000
  SMALL = '小型大学', // 6000-10000
  MEDIUM = '中型大学', // 10000-15000
  LARGE = '大型大学', // 15000-25000
  MEGA = '多校区大型大学' // >25000 + 2 campuses (campuses simplified to logic check)
}

export enum UniversityRank {
  STARTUP = '初创大学',
  TIER_3 = '三本院校',
  TIER_2 = '二本院校',
  TIER_1 = '一本院校',
  PROJECT_211 = '211院校',
  PROJECT_985 = '985院校'
}

// Finance & Settings
export interface FinanceSettings {
  tuitionFeePerYear: number; // K￥ per student per YEAR
  totalDailyBudget: number; // Raw ￥ target for daily expenses
  // Weights for allocation (0-100 relative)
  allocationWeights: {
      research: number;
      cafeteria: number;
      maintenance: number;
      student: number;
      faculty: number;
  }
}

export interface FinanceHistoryPoint {
  day: number;
  totalMoney: number;
  income: number;
  expense: number;
  balance: number;
  // Details
  maintenance: number;
  cafeteriaSubsidy: number;
  researchCost: number;
  studentSubsidy: number;
  ministryGrant: number;
  facultySalaries: number;
  // New
  publicityCost?: number;
  liaisonIncome?: number;
}

export interface AdmissionPolicy {
  totalTarget: number;
  minScore: number; // New: Cutoff score
  collegeTargets: Record<string, number>; // CollegeType string -> count
  lastPlanUpdateYear: number; // The year this plan was made
}

export enum AdmissionsPhase {
  IDLE = 'IDLE',
  PREP = 'PREP', // July 1 - July 15
  RECRUITING = 'RECRUITING' // July 15 - Aug 5
}

// --- Publicity Types ---
export enum SocialPublicityTier {
  STANDARD = 'STANDARD', // 10k, 20d, 0-1.5
  PREMIUM = 'PREMIUM',   // 80k, 30d, 0-5
  MASSIVE = 'MASSIVE'    // 150k, 50d, 1-10
}

export enum MinistryPublicityType {
  RECOGNITION = 'RECOGNITION', // 5M, 10-50 rec
  CONNECTION = 'CONNECTION' // Under dev
}

export enum PublicityBuffType {
  RECENT_PUBLICITY = 'RECENT_PUBLICITY', // -10% Min Rec
  OVER_PUBLICITY = 'OVER_PUBLICITY', // -15% Soc Rec, -30% Min Rec, Block all
  MINISTRY_CONTACT = 'MINISTRY_CONTACT', // Pre-req for Backroom
  BACKROOM_DEAL = 'BACKROOM_DEAL' // -90% Soc, -80% Min
}

export interface ActiveCampaign {
  tier: SocialPublicityTier;
  daysLeft: number;
}

export interface ActiveBuff {
  type: PublicityBuffType;
  daysLeft: number;
}

export interface PublicityState {
  activeCampaigns: ActiveCampaign[];
  activeBuffs: ActiveBuff[];
  ministryBonus: number; // Persistent bonus from ministry campaigns
}

// --- Liaison / Mission System ---
export enum MissionStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  COOLDOWN = 'COOLDOWN'
}

export interface MissionDef {
  id: string;
  title: string;
  description: string;
  requirements: {
    colleges?: CollegeType[]; // Must have these colleges
    categories?: string[]; // Must have college of category (e.g. 'NEW_ENG')
    minBuildingsPerCollege?: { type: BuildingType; count: number };
    needDean?: boolean;
  };
  rewards: {
    title?: string;
    socialRec?: number;
    ministryRec?: number;
    grant?: { amount: number; days: number }; // Daily amount for X days
    unlocks?: string[]; // Child mission IDs
  };
  exclusiveWith?: string[]; // IDs of missions that become locked if this is completed
  nextMissions?: string[]; // Children to display in UI
  parentId?: string;
  position: { x: number, y: number }; // For UI tree layout
}

export interface ActiveMission {
  id: string;
  acceptedDay: number;
}

export interface LiaisonState {
  missions: Record<string, MissionStatus>; // ID -> Status
  activeMissions: ActiveMission[];
  cooldowns: Record<string, number>; // ID -> Day available again
  grantDaysLeft: number;
  grantDailyAmount: number;
}

export interface GameSettings {
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  brightness: number; // 0.5 - 1.5
  cameraPanSensitivity: number; // 0.5 - 3.0
  cameraZoomSensitivity: number; // 0.5 - 3.0
}

export interface GameState {
  money: number; // Stored as raw number, displayed as M/K
  students: number;
  studentCap: number; // Calculated based on Rank/Scale
  happiness: number; // 0-100
  grid: CellData[][];
  day: number;
  semester: number;
  
  // Metadata
  universityName: string;
  universityLabel: string; // e.g. 理工大学, 综合性大学
  uniType1: UniType1;
  uniType2: UniType2;
  scale: UniversityScale;
  rank: UniversityRank;
  
  // Scores
  socialRecognition: number;
  ministryRecognition: number;
  
  // Badges
  badges: string[]; // e.g. "国家重点", "省重点"

  startDate: number;
  
  // Lists
  faculty: Faculty[];
  colleges: ActiveCollege[]; // Replaces old simple list
  studentList: Student[]; // Detailed student entities (subset of total students count)
  incomingStudents: Student[]; // Students waiting to enroll in Sep
  
  // Recruitment Status
  recruitAvailable: boolean; // Can recruit this semester?
  pityUsed: boolean; // Has the first-time pity been used?

  // Systems
  financeSettings: FinanceSettings;
  financeHistory: FinanceHistoryPoint[]; // Last 30-60 ticks
  
  // Admission
  admissionPolicy: AdmissionPolicy;
  admissionsPhase: AdmissionsPhase; // New State

  // Publicity
  publicity: PublicityState;

  // Liaison
  liaison: LiaisonState;

  // Logic Flags
  budgetConfirmed: boolean; // Has the budget for the current month been confirmed?
  
  // Warnings & Penalties
  lastLowSatWarningDay?: number;
  ministryPenaltyEndDay?: number; // If set and > currentDay, income is reduced
}


export const GRID_SIZE = 54;
export const INITIAL_MONEY_PUBLIC = 200000000; // 200M
export const INITIAL_MONEY_PRIVATE = 1000000000; // 1000M
