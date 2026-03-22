import Foundation

// MARK: - Building Types
enum BuildingType: String, Codable, CaseIterable {
    case none = "NONE"
    case dormitory = "DORMITORY"
    case lectureHall = "LECTURE_HALL"
    case cafeteria = "CAFETERIA"
    case laboratory = "LABORATORY"
    case library = "LIBRARY"
    case park = "PARK"
    case road = "ROAD"
    case schoolGate = "SCHOOL_GATE"
    case fence = "FENCE"
    case cityRoad = "CITY_ROAD"
}

// MARK: - University Types
enum UniType1: String, Codable {
    case publicUni = "公立大学"
    case privateUni = "民办大学"
}

enum UniType2: String, Codable {
    case research = "研究型"
    case appliedResearch = "研究应用型"
}

// MARK: - College Types
enum CollegeType: String, Codable, CaseIterable, Hashable {
    case arts = "ARTS"
    case science = "SCIENCE"
    case medicine = "MEDICINE"
    case cs = "CS"
    case ic = "IC"
    case robotics = "ROBOTICS"
    case civil = "CIVIL"
    case arch = "ARCH"
    case mech = "MECH"
    case elec = "ELEC"
    case lang = "LANG"
    case law = "LAW"
    case trade = "TRADE"
    case econ = "ECON"
}

enum CollegeCategory: String, Codable {
    case base = "BASE"
    case newEng = "NEW_ENG"
    case tradEng = "TRAD_ENG"
    case libArts = "LIB_ARTS"
}

// MARK: - Construction
enum ConstructionStatus: String, Codable {
    case planned = "PLANNED"
    case constructing = "CONSTRUCTING"
    case completed = "COMPLETED"
}

// MARK: - Faculty
enum FacultyTitle: String, Codable, CaseIterable {
    case ta = "助教"
    case lecturer = "讲师"
    case assocProf = "副教授"
    case prof = "教授"
    case academician = "院士"

    var expectedSalary: Double {
        switch self {
        case .ta: return 8000
        case .lecturer: return 12000
        case .assocProf: return 20000
        case .prof: return 30000
        case .academician: return 50000
        }
    }
}

enum RecruitmentMethod: String, Codable {
    case ministry = "MINISTRY"
    case social = "SOCIAL"
    case headhunterLow = "HEADHUNTER_LOW"
    case headhunterMid = "HEADHUNTER_MID"
    case headhunterHigh = "HEADHUNTER_HIGH"

    var cost: Double {
        switch self {
        case .ministry: return 0
        case .social: return 50000
        case .headhunterLow: return 100000
        case .headhunterMid: return 500000
        case .headhunterHigh: return 1000000
        }
    }

    var label: String {
        switch self {
        case .ministry: return "教育部分配"
        case .social: return "社会招聘"
        case .headhunterLow: return "猎头(低)"
        case .headhunterMid: return "猎头(中)"
        case .headhunterHigh: return "猎头(高)"
        }
    }
}

// MARK: - Gender
enum Gender: String, Codable {
    case male = "男"
    case female = "女"
}

// MARK: - University Scale & Rank
enum UniversityScale: String, Codable {
    case academy = "学院"
    case small = "小型大学"
    case medium = "中型大学"
    case large = "大型大学"
    case mega = "多校区大型大学"
}

enum UniversityRank: String, Codable {
    case startup = "初创大学"
    case tier3 = "三本院校"
    case tier2 = "二本院校"
    case tier1 = "一本院校"
    case project211 = "211院校"
    case project985 = "985院校"
}

// MARK: - Admissions
enum AdmissionsPhase: String, Codable {
    case idle = "IDLE"
    case prep = "PREP"
    case recruiting = "RECRUITING"
}

// MARK: - Publicity
enum SocialPublicityTier: String, Codable {
    case standard = "STANDARD"
    case premium = "PREMIUM"
    case massive = "MASSIVE"

    var duration: Int {
        switch self {
        case .standard: return 20
        case .premium: return 30
        case .massive: return 50
        }
    }

    var dailyCost: Double {
        switch self {
        case .standard: return 10000
        case .premium: return 80000
        case .massive: return 150000
        }
    }

    var gainRange: (min: Double, max: Double) {
        switch self {
        case .standard: return (0, 1.5)
        case .premium: return (0, 5)
        case .massive: return (1, 10)
        }
    }

    var label: String {
        switch self {
        case .standard: return "标准宣传"
        case .premium: return "高端宣传"
        case .massive: return "大规模宣传"
        }
    }
}

enum PublicityBuffType: String, Codable {
    case recentPublicity = "RECENT_PUBLICITY"
    case overPublicity = "OVER_PUBLICITY"
    case ministryContact = "MINISTRY_CONTACT"
    case backroomDeal = "BACKROOM_DEAL"

    var label: String {
        switch self {
        case .recentPublicity: return "近期宣传"
        case .overPublicity: return "过度宣传"
        case .ministryContact: return "部委接触"
        case .backroomDeal: return "暗箱操作"
        }
    }
}

enum MissionStatus: String, Codable {
    case locked = "LOCKED"
    case available = "AVAILABLE"
    case active = "ACTIVE"
    case completed = "COMPLETED"
    case cooldown = "COOLDOWN"
}

// MARK: - Service Types
enum ServiceType: String, Codable {
    case food
    case study
    case recreation
}

// MARK: - Road Shape
enum RoadShape: String, Codable {
    case straightH = "straight_h"
    case straightV = "straight_v"
    case cornerNE = "corner_ne"
    case cornerNW = "corner_nw"
    case cornerSE = "corner_se"
    case cornerSW = "corner_sw"
    case tNorth = "t_north"
    case tSouth = "t_south"
    case tEast = "t_east"
    case tWest = "t_west"
    case cross
    case deadEndN = "dead_end_n"
    case deadEndS = "dead_end_s"
    case deadEndE = "dead_end_e"
    case deadEndW = "dead_end_w"
    case isolated
}

// MARK: - Sidebar Tab
enum SidebarTab: String, CaseIterable {
    case overview = "OVERVIEW"
    case build = "BUILD"
    case academic = "ACADEMIC"
    case hr = "HR"
    case publicity = "PUBLICITY"
    case liaison = "LIAISON"
    case admissions = "ADMISSIONS"
    case finance = "FINANCE"
}

// MARK: - Data Structures

struct RoadConnections: Codable {
    var north: Bool = false
    var south: Bool = false
    var east: Bool = false
    var west: Bool = false
}

struct ServiceCoverage: Codable {
    var food: Bool = false
    var study: Bool = false
    var recreation: Bool = false
}

struct CellData: Codable, Identifiable {
    var id: String { "\(x)-\(y)" }
    var x: Int
    var y: Int
    var building: BuildingType = .none
    var buildingId: String?
    var isOrigin: Bool = false
    var variantId: String?
    var constructionStatus: ConstructionStatus?
    var constructionLeft: Int?
    var rotation: Int = 0
    var customName: String?
    var isZoned: Bool = false
    var roadZoneDepth: Int?
    var roadConnections: RoadConnections?
    var roadShape: RoadShape?
    var isConnectedToCampus: Bool?
    var serviceCoverage: ServiceCoverage?
}

struct Faculty: Codable, Identifiable {
    var id: String
    var name: String
    var title: FacultyTitle
    var salary: Double
    var department: CollegeType
    var researchAbility: Double
    var managementAbility: Double
    var hireDate: Int
    var satisfaction: Double = 50
}

struct ActiveCollege: Codable, Identifiable {
    var id: String
    var type: CollegeType
    var deanId: String?
    var viceDeanId: String?
    var activeMajors: [String] = []
    var foundingDay: Int?
    var assignedBuildingIds: [String] = []
}

struct Student: Codable, Identifiable {
    var id: String
    var name: String
    var gender: Gender
    var gaokaoScore: Int
    var talent: Int
    var effort: Int
    var wealth: Int
    var tags: [String]
    var satisfaction: Double = 80
    var college: CollegeType
}

struct FinanceSettings: Codable {
    var tuitionFeePerYear: Double = 10
    var totalDailyBudget: Double = 100000
    var allocationWeights: AllocationWeights = AllocationWeights()
}

struct AllocationWeights: Codable {
    var research: Double = 20
    var cafeteria: Double = 20
    var maintenance: Double = 20
    var student: Double = 20
    var faculty: Double = 20

    var total: Double { research + cafeteria + maintenance + student + faculty }
    func ratio(for weight: Double) -> Double {
        total == 0 ? 0 : weight / total
    }
}

struct FinanceHistoryPoint: Codable, Identifiable {
    var id: Int { day }
    var day: Int
    var totalMoney: Double
    var income: Double
    var expense: Double
    var balance: Double
    var maintenance: Double
    var cafeteriaSubsidy: Double
    var researchCost: Double
    var studentSubsidy: Double
    var ministryGrant: Double
    var facultySalaries: Double
    var publicityCost: Double = 0
    var liaisonIncome: Double = 0
}

struct AdmissionPolicy: Codable {
    var totalTarget: Int = 0
    var minScore: Int = 500
    var collegeTargets: [String: Int] = [:]
    var lastPlanUpdateYear: Int = 0
}

struct ActiveCampaign: Codable, Identifiable {
    var id: String { "\(tier.rawValue)-\(daysLeft)" }
    var tier: SocialPublicityTier
    var daysLeft: Int
}

struct ActiveBuff: Codable, Identifiable {
    var id: String { "\(type.rawValue)-\(daysLeft)" }
    var type: PublicityBuffType
    var daysLeft: Int
}

struct PublicityState: Codable {
    var activeCampaigns: [ActiveCampaign] = []
    var activeBuffs: [ActiveBuff] = []
    var ministryBonus: Double = 30
}

struct ActiveMission: Codable, Identifiable {
    var id: String
    var acceptedDay: Int
}

struct LiaisonState: Codable {
    var missions: [String: MissionStatus] = [:]
    var activeMissions: [ActiveMission] = []
    var cooldowns: [String: Int] = [:]
    var grantDaysLeft: Int = 0
    var grantDailyAmount: Double = 0
}

// MARK: - Definition Types

struct BuildingDef {
    var type: BuildingType
    var name: String
    var cost: Double
    var maintenance: Double
    var capacity: Int
    var happiness: Double
    var revenue: Double
    var constructionTime: Int
    var icon: String
    var description: String
    var width: Int
    var height: Int
    var requiresRoadConnection: Bool
    var serviceRadius: Int?
    var serviceType: ServiceType?
}

struct VariantDef: Identifiable {
    var id: String
    var label: String
    var width: Int
    var height: Int
    var cost: Double
    var maintenance: Double
    var capacity: Int
    var happiness: Double
    var revenue: Double
    var description: String
}

struct CollegeDef {
    var type: CollegeType
    var name: String
    var category: CollegeCategory
    var dependency: CollegeType?
    var description: String
}

struct MajorDef: Identifiable {
    var id: String
    var name: String
    var collegeType: CollegeType
}

struct MissionDef {
    var id: String
    var title: String
    var description: String
    var requirements: MissionRequirements
    var rewards: MissionRewards
    var exclusiveWith: [String]
    var nextMissions: [String]
    var parentId: String?
    var position: (x: Double, y: Double)
}

struct MissionRequirements {
    var colleges: [CollegeType]?
    var categories: [String]?
    var minBuildingsPerCollege: (type: BuildingType, count: Int)?
    var needDean: Bool
}

struct MissionRewards {
    var title: String?
    var socialRec: Double?
    var ministryRec: Double?
    var grant: (amount: Double, days: Int)?
    var unlocks: [String]?
}

// MARK: - Stats Result
struct GameStats {
    var maintenanceRequiredMonthly: Double = 0
    var maintenanceAllocated: Double = 0
    var maintenanceRatio: Double = 1
    var salaryRequiredDaily: Double = 0
    var facultyAllocated: Double = 0
    var researchAllocated: Double = 0
    var cafeteriaAllocated: Double = 0
    var studentAllocated: Double = 0
    var buildingRevenueDaily: Double = 0
    var potentialDailyGrant: Double = 0
    var dailyGrant: Double = 0
    var totalRevenue: Double = 0
    var totalExpense: Double = 0
    var netIncome: Double = 0
    var capacity: Int = 0
    var happiness: Double = 50
    var studentSatisfaction: Double = 50
    var facultySatisfaction: Double = 50
    var hasGate: Bool = false
    var buildingCount: Int = 0
    var socialRecognition: Double = 0
    var ministryRecognition: Double = 0
    var labCount: Int = 0
    var lectureHallCount: Int = 0
    var isOperational: Bool = false
    var annualizedTuition: Double = 0
    var maintenanceCostActual: Double = 0
    var isMaintenanceFree: Bool = false
    var isPrepPeriod: Bool = false
}

// MARK: - Game Date
struct GameDate {
    var year: Int
    var month: Int
    var date: Int
    var dateString: String
    var semester: Int
    var semesterString: String
    var season: String
    var seasonEmoji: String
}

// MARK: - Constants
let GRID_SIZE = 54
let INITIAL_MONEY_PUBLIC: Double = 200_000_000
let INITIAL_MONEY_PRIVATE: Double = 1_000_000_000

// MARK: - Game State
struct GameState: Codable {
    var money: Double
    var students: Int = 0
    var studentCap: Int = 6000
    var happiness: Double = 50
    var grid: [[CellData]]
    var day: Int = 1
    var semester: Int = 1

    var universityName: String
    var universityLabel: String = "初创大学"
    var uniType1: UniType1
    var uniType2: UniType2
    var scale: UniversityScale = .academy
    var rank: UniversityRank = .startup

    var socialRecognition: Double = 0
    var ministryRecognition: Double = 30

    var badges: [String] = []
    var startDate: Double = Date().timeIntervalSince1970

    var faculty: [Faculty] = []
    var colleges: [ActiveCollege] = []
    var studentList: [Student] = []
    var incomingStudents: [Student] = []

    var recruitAvailable: Bool = true
    var pityUsed: Bool = false

    var financeSettings: FinanceSettings = FinanceSettings()
    var financeHistory: [FinanceHistoryPoint] = []

    var admissionPolicy: AdmissionPolicy = AdmissionPolicy()
    var admissionsPhase: AdmissionsPhase = .idle

    var publicity: PublicityState = PublicityState()
    var liaison: LiaisonState = LiaisonState()

    var budgetConfirmed: Bool = false
    var lastLowSatWarningDay: Int?
    var ministryPenaltyEndDay: Int?
}
