import Foundation

// MARK: - Name Generation
let surnames = "李王张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段雷钱汤尹黎葛墨"
let givenNames = "明华国平文强志伟东海燕红军建平博文洋阳建华颖灵慧巧娜静敏刚勇军磊涛斌强巍帅秀英丽霞敏燕萍婷玉兰桂芳云杰柳新宇恩泽浩然子轩梓涵一诺依诺诗涵欣怡梓萱浩宇宇轩子墨雨泽"

func generateName() -> String {
    let surnameArray = Array(surnames)
    let nameArray = Array(givenNames)
    let surname = String(surnameArray[Int.random(in: 0..<surnameArray.count)])
    let nameLen = Bool.random() ? 1 : 2
    var name = ""
    for _ in 0..<nameLen {
        name += String(nameArray[Int.random(in: 0..<nameArray.count)])
    }
    return surname + name
}

func generateId() -> String {
    let letters = "abcdefghijklmnopqrstuvwxyz0123456789"
    let randomPart = String((0..<7).map { _ in letters.randomElement()! })
    return randomPart + String(Int(Date().timeIntervalSince1970 * 1000), radix: 36)
}

// MARK: - Building Definitions
let BUILDINGS: [BuildingType: BuildingDef] = [
    .none: BuildingDef(type: .none, name: "空地", cost: 0, maintenance: 0, capacity: 0, happiness: 0, revenue: 0, constructionTime: 0, icon: "", description: "", width: 1, height: 1, requiresRoadConnection: false),
    .road: BuildingDef(type: .road, name: "道路修建", cost: 5000, maintenance: 150, capacity: 0, happiness: 0, revenue: 0, constructionTime: 0, icon: "🛤", description: "基础设施", width: 1, height: 1, requiresRoadConnection: false),
    .schoolGate: BuildingDef(type: .schoolGate, name: "校门", cost: 5_000_000, maintenance: 5000, capacity: 0, happiness: 0, revenue: 0, constructionTime: 10, icon: "⛩️", description: "校园入口", width: 2, height: 3, requiresRoadConnection: true),
    .dormitory: BuildingDef(type: .dormitory, name: "学生宿舍", cost: 2_000_000, maintenance: 15000, capacity: 50, happiness: 5, revenue: 0, constructionTime: 20, icon: "🏠", description: "学生住宿", width: 4, height: 4, requiresRoadConnection: true),
    .lectureHall: BuildingDef(type: .lectureHall, name: "教学楼", cost: 8_000_000, maintenance: 30000, capacity: 100, happiness: -2, revenue: 1000, constructionTime: 40, icon: "📚", description: "教学设施", width: 4, height: 6, requiresRoadConnection: true),
    .cafeteria: BuildingDef(type: .cafeteria, name: "食堂", cost: 3_000_000, maintenance: 20000, capacity: 0, happiness: 15, revenue: 50000, constructionTime: 15, icon: "🍔", description: "餐饮服务", width: 5, height: 5, requiresRoadConnection: true, serviceRadius: 12, serviceType: .food),
    .laboratory: BuildingDef(type: .laboratory, name: "科研实验楼", cost: 15_000_000, maintenance: 100000, capacity: 20, happiness: -5, revenue: 30000, constructionTime: 60, icon: "🔬", description: "科研设施", width: 4, height: 8, requiresRoadConnection: true),
    .library: BuildingDef(type: .library, name: "图书馆", cost: 10_000_000, maintenance: 50000, capacity: 0, happiness: 30, revenue: 0, constructionTime: 45, icon: "🏛️", description: "标志性建筑", width: 5, height: 5, requiresRoadConnection: true, serviceRadius: 15, serviceType: .study),
    .park: BuildingDef(type: .park, name: "景观与绿化", cost: 500_000, maintenance: 5000, capacity: 0, happiness: 10, revenue: 0, constructionTime: 5, icon: "🌳", description: "休闲绿化", width: 2, height: 2, requiresRoadConnection: false, serviceRadius: 8, serviceType: .recreation),
    .fence: BuildingDef(type: .fence, name: "围墙", cost: 1000, maintenance: 0, capacity: 0, happiness: 0, revenue: 0, constructionTime: 0, icon: "🧱", description: "校园边界", width: 1, height: 1, requiresRoadConnection: false),
    .cityRoad: BuildingDef(type: .cityRoad, name: "城市公路", cost: 0, maintenance: 0, capacity: 0, happiness: 0, revenue: 0, constructionTime: 0, icon: "", description: "市政设施", width: 1, height: 1, requiresRoadConnection: false),
]

// MARK: - Variant Definitions
let VARIANTS: [BuildingType: [VariantDef]] = [
    .road: [
        VariantDef(id: "road_walk", label: "步道 (1格)", width: 1, height: 1, cost: 2000, maintenance: 50, capacity: 0, happiness: 0, revenue: 0, description: ""),
        VariantDef(id: "road_1", label: "单车道 (2格)", width: 2, height: 1, cost: 5000, maintenance: 150, capacity: 0, happiness: 0, revenue: 0, description: ""),
        VariantDef(id: "road_2", label: "双车道 (4格)", width: 4, height: 1, cost: 12000, maintenance: 300, capacity: 0, happiness: 0, revenue: 0, description: ""),
        VariantDef(id: "road_4", label: "大道 (8格)", width: 8, height: 1, cost: 30000, maintenance: 800, capacity: 0, happiness: 0, revenue: 0, description: ""),
    ],
    .schoolGate: [
        VariantDef(id: "gate_s", label: "标准校门 (2x3)", width: 2, height: 3, cost: 5_000_000, maintenance: 5000, capacity: 0, happiness: 0, revenue: 0, description: ""),
        VariantDef(id: "gate_m", label: "宏伟校门 (2x5)", width: 2, height: 5, cost: 12_000_000, maintenance: 12000, capacity: 0, happiness: 0, revenue: 0, description: ""),
        VariantDef(id: "gate_l", label: "地标级校门 (3x6)", width: 3, height: 6, cost: 25_000_000, maintenance: 25000, capacity: 0, happiness: 0, revenue: 0, description: ""),
    ],
    .dormitory: [
        VariantDef(id: "dorm_s", label: "小型公寓 (4x4)", width: 4, height: 4, cost: 3_000_000, maintenance: 10000, capacity: 100, happiness: 5, revenue: 0, description: ""),
        VariantDef(id: "dorm_m", label: "标准宿舍楼 (4x6)", width: 4, height: 6, cost: 5_000_000, maintenance: 15000, capacity: 160, happiness: 5, revenue: 0, description: ""),
        VariantDef(id: "dorm_l", label: "高层公寓区 (5x8)", width: 5, height: 8, cost: 12_000_000, maintenance: 25000, capacity: 300, happiness: 10, revenue: 0, description: ""),
    ],
    .lectureHall: [
        VariantDef(id: "hall_s", label: "综合教学楼 (4x6)", width: 4, height: 6, cost: 6_000_000, maintenance: 25000, capacity: 120, happiness: 0, revenue: 1000, description: ""),
        VariantDef(id: "hall_m", label: "阶梯教室群 (5x5)", width: 5, height: 5, cost: 6_500_000, maintenance: 30000, capacity: 150, happiness: 0, revenue: 1500, description: ""),
        VariantDef(id: "hall_l", label: "第一教学楼 (6x8)", width: 6, height: 8, cost: 12_000_000, maintenance: 50000, capacity: 300, happiness: 0, revenue: 3000, description: ""),
    ],
    .laboratory: [
        VariantDef(id: "lab_s", label: "基础实验室 (4x8)", width: 4, height: 8, cost: 16_000_000, maintenance: 80000, capacity: 30, happiness: 0, revenue: 25000, description: ""),
        VariantDef(id: "lab_m", label: "科研中心 (6x6)", width: 6, height: 6, cost: 18_000_000, maintenance: 100000, capacity: 40, happiness: 0, revenue: 40000, description: ""),
        VariantDef(id: "lab_l", label: "国家重点实验室 (5x10)", width: 5, height: 10, cost: 25_000_000, maintenance: 150000, capacity: 60, happiness: 0, revenue: 80000, description: ""),
    ],
    .cafeteria: [
        VariantDef(id: "cafe_s", label: "社区食堂 (5x5)", width: 5, height: 5, cost: 3_000_000, maintenance: 15000, capacity: 0, happiness: 15, revenue: 30000, description: ""),
        VariantDef(id: "cafe_m", label: "风味餐厅 (3x10)", width: 3, height: 10, cost: 3_500_000, maintenance: 20000, capacity: 0, happiness: 20, revenue: 45000, description: ""),
        VariantDef(id: "cafe_l", label: "综合餐饮中心 (4x8)", width: 4, height: 8, cost: 4_000_000, maintenance: 30000, capacity: 0, happiness: 25, revenue: 60000, description: ""),
    ],
]

// MARK: - College Definitions
let COLLEGES_DEF: [CollegeType: CollegeDef] = [
    .arts: CollegeDef(type: .arts, name: "文学院", category: .base, description: "涵盖中文、历史、哲学与新媒体等学科"),
    .science: CollegeDef(type: .science, name: "理学院", category: .base, description: "数学、物理、化学三大基础学科的摇篮"),
    .medicine: CollegeDef(type: .medicine, name: "医学院", category: .base, description: "临床医学、基础医学与口腔医学"),
    .cs: CollegeDef(type: .cs, name: "计算机学院", category: .newEng, dependency: .science, description: "人工智能、软件工程与网络安全"),
    .ic: CollegeDef(type: .ic, name: "集成电路学院", category: .newEng, dependency: .science, description: "芯片设计、半导体工艺"),
    .robotics: CollegeDef(type: .robotics, name: "机器人学院", category: .newEng, dependency: .science, description: "智能制造与无人系统"),
    .civil: CollegeDef(type: .civil, name: "土木学院", category: .tradEng, dependency: .science, description: "结构工程、岩土力学"),
    .arch: CollegeDef(type: .arch, name: "建筑学院", category: .tradEng, dependency: .science, description: "建筑设计、城市规划"),
    .mech: CollegeDef(type: .mech, name: "机械学院", category: .tradEng, dependency: .science, description: "机械设计、制造自动化"),
    .elec: CollegeDef(type: .elec, name: "电气学院", category: .tradEng, dependency: .science, description: "电力系统、新能源技术"),
    .lang: CollegeDef(type: .lang, name: "外国语学院", category: .libArts, dependency: .arts, description: "英语、日语、法语等"),
    .law: CollegeDef(type: .law, name: "法学院", category: .libArts, dependency: .arts, description: "法律人才培养"),
    .trade: CollegeDef(type: .trade, name: "贸易学院", category: .libArts, dependency: .arts, description: "国际贸易实务"),
    .econ: CollegeDef(type: .econ, name: "经济学院", category: .libArts, dependency: .arts, description: "宏观经济、金融学"),
]

// MARK: - Major Definitions
let MAJORS_DEF: [MajorDef] = [
    MajorDef(id: "math", name: "数学与应用数学", collegeType: .science),
    MajorDef(id: "phys", name: "物理学", collegeType: .science),
    MajorDef(id: "chem", name: "化学", collegeType: .science),
    MajorDef(id: "lit", name: "汉语言文学", collegeType: .arts),
    MajorDef(id: "art", name: "影视戏剧艺术", collegeType: .arts),
    MajorDef(id: "media", name: "网络与新媒体", collegeType: .arts),
    MajorDef(id: "clin", name: "临床医学", collegeType: .medicine),
    MajorDef(id: "basic_med", name: "基础医学", collegeType: .medicine),
    MajorDef(id: "oral", name: "口腔医学", collegeType: .medicine),
    MajorDef(id: "cs", name: "计算机科学与技术", collegeType: .cs),
    MajorDef(id: "ic_design", name: "集成电路设计", collegeType: .ic),
    MajorDef(id: "control", name: "控制科学与工程", collegeType: .robotics),
    MajorDef(id: "civil_eng", name: "土木工程", collegeType: .civil),
    MajorDef(id: "arch_des", name: "建筑设计", collegeType: .arch),
    MajorDef(id: "mech_eng", name: "机械设计制造", collegeType: .mech),
    MajorDef(id: "elec_eng", name: "电气工程", collegeType: .elec),
    MajorDef(id: "eng", name: "英语", collegeType: .lang),
    MajorDef(id: "poli", name: "政治学", collegeType: .law),
    MajorDef(id: "law_major", name: "法律学", collegeType: .law),
    MajorDef(id: "int_trade", name: "国际贸易", collegeType: .trade),
    MajorDef(id: "econ_major", name: "经济学", collegeType: .econ),
]

// MARK: - Mission Definitions
let MISSIONS_DEF: [String: MissionDef] = [
    "root_comprehensive": MissionDef(
        id: "root_comprehensive",
        title: "确认设立综合性大学",
        description: "向教育部申请确立学校发展方向为综合性大学，文理并重、多学科协调发展。",
        requirements: MissionRequirements(colleges: [.arts, .science], minBuildingsPerCollege: (.lectureHall, 1), needDean: true),
        rewards: MissionRewards(title: "综合性大学", socialRec: 10, ministryRec: 10, grant: (20000, 240), unlocks: ["dev_comprehensive"]),
        exclusiveWith: ["root_medical", "root_poly", "root_liberal"],
        nextMissions: ["dev_comprehensive"],
        position: (300, 50)
    ),
    "root_medical": MissionDef(
        id: "root_medical",
        title: "确认设立医科大学",
        description: "向教育部申请确立学校发展方向为医科大学，建设一流医学教育平台。",
        requirements: MissionRequirements(colleges: [.medicine], minBuildingsPerCollege: (.lectureHall, 1), needDean: true),
        rewards: MissionRewards(title: "医科大学", socialRec: 10, ministryRec: 10, grant: (20000, 240), unlocks: ["dev_medical"]),
        exclusiveWith: ["root_comprehensive", "root_poly", "root_liberal"],
        nextMissions: ["dev_medical"],
        position: (100, 50)
    ),
    "root_poly": MissionDef(
        id: "root_poly",
        title: "确认设立理工类大学",
        description: "向教育部申请确立学校发展方向为理工类大学，以理学为基础、工学为主干。",
        requirements: MissionRequirements(colleges: [.science], categories: ["NEW_ENG", "TRAD_ENG"], minBuildingsPerCollege: (.lectureHall, 1), needDean: true),
        rewards: MissionRewards(title: "理工类大学", socialRec: 10, ministryRec: 10, grant: (20000, 240), unlocks: ["dev_poly"]),
        exclusiveWith: ["root_comprehensive", "root_medical", "root_liberal"],
        nextMissions: ["dev_poly"],
        position: (500, 50)
    ),
    "root_liberal": MissionDef(
        id: "root_liberal",
        title: "确认设立文经类大学",
        description: "向教育部申请确立学校发展方向为文经类大学，深耕文学、经济、法律等领域。",
        requirements: MissionRequirements(colleges: [.arts], categories: ["LIB_ARTS"], minBuildingsPerCollege: (.lectureHall, 1), needDean: true),
        rewards: MissionRewards(title: "文经类大学", socialRec: 10, ministryRec: 10, grant: (20000, 240), unlocks: ["dev_liberal"]),
        exclusiveWith: ["root_comprehensive", "root_medical", "root_poly"],
        nextMissions: ["dev_liberal"],
        position: (700, 50)
    ),
    "dev_comprehensive": MissionDef(
        id: "dev_comprehensive", title: "综合建设 (开发中)", description: "下一阶段任务...",
        requirements: MissionRequirements(needDean: false), rewards: MissionRewards(),
        exclusiveWith: [], nextMissions: [], parentId: "root_comprehensive", position: (300, 250)
    ),
    "dev_medical": MissionDef(
        id: "dev_medical", title: "医学建设 (开发中)", description: "下一阶段任务...",
        requirements: MissionRequirements(needDean: false), rewards: MissionRewards(),
        exclusiveWith: [], nextMissions: [], parentId: "root_medical", position: (100, 250)
    ),
    "dev_poly": MissionDef(
        id: "dev_poly", title: "理工建设 (开发中)", description: "下一阶段任务...",
        requirements: MissionRequirements(needDean: false), rewards: MissionRewards(),
        exclusiveWith: [], nextMissions: [], parentId: "root_poly", position: (500, 250)
    ),
    "dev_liberal": MissionDef(
        id: "dev_liberal", title: "文经建设 (开发中)", description: "下一阶段任务...",
        requirements: MissionRequirements(needDean: false), rewards: MissionRewards(),
        exclusiveWith: [], nextMissions: [], parentId: "root_liberal", position: (700, 250)
    ),
]
