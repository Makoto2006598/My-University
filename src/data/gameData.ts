
import { BuildingType, BuildingDef, VariantDef, CollegeType, CollegeDef, MajorDef, MissionDef } from '../types';

export const SURNAMES = "李王张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段雷钱汤尹黎葛墨";
export const NAMES = "明华国平文强志伟东海燕红军建平博文洋阳建华颖灵慧巧娜静敏刚勇军磊涛斌强巍帅秀英丽霞敏燕萍婷玉兰桂芳云杰柳新宇恩泽浩然子轩梓涵一诺依诺诗涵欣怡梓萱浩宇宇轩子墨雨泽";

export const generateName = (): string => {
    const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    const nameLen = Math.random() > 0.5 ? 1 : 2;
    let name = "";
    for(let i=0; i<nameLen; i++) name += NAMES[Math.floor(Math.random() * NAMES.length)];
    return surname + name;
};

export const COLLEGES_DEF: Record<CollegeType, CollegeDef> = {
    [CollegeType.ARTS]: { type: CollegeType.ARTS, name: '文学院', category: 'BASE', description: '涵盖中文、历史、哲学与新媒体等学科，是人文精神与校园文化底蕴的根基，也是开设文科类学院的前置条件。' },
    [CollegeType.SCIENCE]: { type: CollegeType.SCIENCE, name: '理学院', category: 'BASE', description: '数学、物理、化学三大基础学科的摇篮，为工科和医学提供理论支撑，是开设工程类学院的前置条件。' },
    [CollegeType.MEDICINE]: { type: CollegeType.MEDICINE, name: '医学院', category: 'BASE', description: '设有临床医学、基础医学与口腔医学专业，培养周期长、投入高，但能显著提升学校声望与社会认可度。' },
    [CollegeType.CS]: { type: CollegeType.CS, name: '计算机学院', category: 'NEW_ENG', dependency: CollegeType.SCIENCE, description: '新工科旗舰学院，涵盖人工智能、软件工程与网络安全方向，招生热门，科研产出高，企业合作机会丰富。' },
    [CollegeType.IC]: { type: CollegeType.IC, name: '集成电路学院', category: 'NEW_ENG', dependency: CollegeType.SCIENCE, description: '聚焦芯片设计、半导体工艺与EDA工具开发，属国家战略急需学科，可获额外科研经费与政策支持。' },
    [CollegeType.ROBOTICS]: { type: CollegeType.ROBOTICS, name: '机器人学院', category: 'NEW_ENG', dependency: CollegeType.SCIENCE, description: '融合机械、电子与人工智能的交叉学科，面向智能制造与无人系统，产学研合作前景广阔。' },
    [CollegeType.CIVIL]: { type: CollegeType.CIVIL, name: '土木学院', category: 'TRAD_ENG', dependency: CollegeType.SCIENCE, description: '研究结构工程、岩土力学与交通规划，虽为传统工科但就业稳定，承担大量横向课题与工程咨询项目。' },
    [CollegeType.ARCH]: { type: CollegeType.ARCH, name: '建筑学院', category: 'TRAD_ENG', dependency: CollegeType.SCIENCE, description: '培养建筑设计、城市规划与景观设计人才，五年制本科教育，注重艺术素养与工程技术的结合。' },
    [CollegeType.MECH]: { type: CollegeType.MECH, name: '机械学院', category: 'TRAD_ENG', dependency: CollegeType.SCIENCE, description: '涵盖机械设计、制造自动化与车辆工程方向，实验设备投入大，但与制造业企业合作紧密，实习就业率高。' },
    [CollegeType.ELEC]: { type: CollegeType.ELEC, name: '电气学院', category: 'TRAD_ENG', dependency: CollegeType.SCIENCE, description: '专注电力系统、电机驱动与新能源技术，毕业生就业面向国家电网与能源企业，行业需求稳定。' },
    [CollegeType.LANG]: { type: CollegeType.LANG, name: '外国语学院', category: 'LIB_ARTS', dependency: CollegeType.ARTS, description: '开设英语、日语、法语等语种专业，承担全校大学外语教学任务，是国际交流合作与留学生项目的核心支撑。' },
    [CollegeType.LAW]: { type: CollegeType.LAW, name: '法学院', category: 'LIB_ARTS', dependency: CollegeType.ARTS, description: '培养法官、律师与法务人才，设有模拟法庭与法律援助中心，司法考试通过率直接影响学院声望。' },
    [CollegeType.TRADE]: { type: CollegeType.TRADE, name: '贸易学院', category: 'LIB_ARTS', dependency: CollegeType.ARTS, description: '聚焦国际贸易实务、跨境电商与供应链管理，与海关、港口及外贸企业建立实训基地，就业导向鲜明。' },
    [CollegeType.ECON]: { type: CollegeType.ECON, name: '经济学院', category: 'LIB_ARTS', dependency: CollegeType.ARTS, description: '研究宏观经济、金融学与计量分析，学术氛围浓厚，论文产出高，优秀毕业生多进入央行、券商与智库。' },
};

export const MAJORS_DEF: MajorDef[] = [
    { id: 'math', name: '数学与应用数学', collegeType: CollegeType.SCIENCE }, { id: 'phys', name: '物理学', collegeType: CollegeType.SCIENCE }, { id: 'chem', name: '化学', collegeType: CollegeType.SCIENCE },
    { id: 'lit', name: '汉语言文学', collegeType: CollegeType.ARTS }, { id: 'art', name: '影视戏剧艺术', collegeType: CollegeType.ARTS }, { id: 'media', name: '网络与新媒体', collegeType: CollegeType.ARTS },
    { id: 'clin', name: '临床医学', collegeType: CollegeType.MEDICINE }, { id: 'basic_med', name: '基础医学', collegeType: CollegeType.MEDICINE }, { id: 'oral', name: '口腔医学', collegeType: CollegeType.MEDICINE },
    { id: 'cs', name: '计算机科学与技术', collegeType: CollegeType.CS }, { id: 'ic_design', name: '集成电路设计', collegeType: CollegeType.IC }, { id: 'control', name: '控制科学与工程', collegeType: CollegeType.ROBOTICS },
    { id: 'civil_eng', name: '土木工程', collegeType: CollegeType.CIVIL }, { id: 'arch_des', name: '建筑设计', collegeType: CollegeType.ARCH }, { id: 'mech_eng', name: '机械设计制造', collegeType: CollegeType.MECH }, { id: 'elec_eng', name: '电气工程', collegeType: CollegeType.ELEC },
    { id: 'eng', name: '英语', collegeType: CollegeType.LANG }, { id: 'poli', name: '政治学', collegeType: CollegeType.LAW }, { id: 'law', name: '法律学', collegeType: CollegeType.LAW },
    { id: 'int_trade', name: '国际贸易', collegeType: CollegeType.TRADE }, { id: 'econ', name: '经济学', collegeType: CollegeType.ECON },
];

export const BUILDINGS: Record<BuildingType, BuildingDef> = {
  [BuildingType.NONE]: { type: BuildingType.NONE, name: '空地', cost: 0, maintenance: 0, constructionTime: 0, color: 'bg-transparent', icon: '' },
  [BuildingType.ROAD]: { type: BuildingType.ROAD, name: '道路修建', cost: 5000, maintenance: 150, constructionTime: 0, color: 'bg-stone-600', icon: '', description: '基础设施。', textureType: 'asphalt' },
  [BuildingType.SCHOOL_GATE]: { type: BuildingType.SCHOOL_GATE, name: '校门', cost: 5000000, maintenance: 5000, constructionTime: 10, color: 'bg-orange-600', icon: '⛩️', description: '校园入口。', textureType: 'concrete' },
  [BuildingType.DORMITORY]: { type: BuildingType.DORMITORY, name: '学生宿舍', cost: 2000000, maintenance: 15000, capacity: 50, happiness: 5, constructionTime: 20, color: 'bg-amber-500', icon: '🏠', textureType: 'brick' },
  [BuildingType.LECTURE_HALL]: { type: BuildingType.LECTURE_HALL, name: '教学楼', cost: 8000000, maintenance: 30000, capacity: 100, happiness: -2, revenue: 1000, constructionTime: 40, color: 'bg-blue-600', icon: '📚', textureType: 'glass' },
  [BuildingType.CAFETERIA]: { type: BuildingType.CAFETERIA, name: '食堂', cost: 3000000, maintenance: 20000, happiness: 15, revenue: 50000, constructionTime: 15, color: 'bg-rose-500', icon: '🍔', textureType: 'concrete', serviceRadius: 12, serviceType: 'food' },
  [BuildingType.LABORATORY]: { type: BuildingType.LABORATORY, name: '科研实验楼', cost: 15000000, maintenance: 100000, capacity: 20, revenue: 30000, happiness: -5, constructionTime: 60, color: 'bg-purple-600', icon: '🔬', textureType: 'tech' },
  [BuildingType.LIBRARY]: { type: BuildingType.LIBRARY, name: '图书馆', cost: 10000000, maintenance: 50000, happiness: 30, constructionTime: 45, color: 'bg-teal-600', icon: '🏛️', description: '标志性建筑。', textureType: 'glass', serviceRadius: 15, serviceType: 'study' },
  [BuildingType.PARK]: { type: BuildingType.PARK, name: '景观与绿化', cost: 500000, maintenance: 5000, happiness: 10, constructionTime: 5, color: 'bg-emerald-500', icon: '🌳', textureType: 'grass', serviceRadius: 8, serviceType: 'recreation', requiresRoadConnection: false },
  [BuildingType.FENCE]: { type: BuildingType.FENCE, name: '围墙', cost: 1000, maintenance: 0, constructionTime: 0, color: 'bg-stone-800', icon: '', description: '校园边界。', requiresRoadConnection: false },
  [BuildingType.CITY_ROAD]: { type: BuildingType.CITY_ROAD, name: '城市公路', cost: 0, maintenance: 0, constructionTime: 0, color: 'bg-stone-500', icon: '', description: '市政设施。', textureType: 'asphalt' },
};

export const VARIANTS: Partial<Record<BuildingType, VariantDef[]>> = {
  [BuildingType.ROAD]: [{ id: 'road_walk', label: '步道 (1格)', width: 1, height: 1, cost: 2000, maintenance: 50, texture: 'paved' }, { id: 'road_1', label: '单车道 (2格)', width: 2, height: 1, cost: 5000, maintenance: 150, texture: 'asphalt_1' }, { id: 'road_2', label: '双车道 (4格)', width: 4, height: 1, cost: 12000, maintenance: 300, texture: 'asphalt_2' }, { id: 'road_4', label: '大道 (8格)', width: 8, height: 1, cost: 30000, maintenance: 800, texture: 'asphalt_4' }],
  [BuildingType.SCHOOL_GATE]: [{ id: 'gate_s', label: '标准校门 (2x3)', width: 2, height: 3, cost: 5000000, maintenance: 5000 }, { id: 'gate_m', label: '宏伟校门 (2x5)', width: 2, height: 5, cost: 12000000, maintenance: 12000 }, { id: 'gate_l', label: '地标级校门 (3x6)', width: 3, height: 6, cost: 25000000, maintenance: 25000 }],
  [BuildingType.DORMITORY]: [{ id: 'dorm_s', label: '小型公寓 (4x4)', width: 4, height: 4, cost: 3000000, maintenance: 10000, capacity: 100, happiness: 5 }, { id: 'dorm_m', label: '标准宿舍楼 (4x6)', width: 4, height: 6, cost: 5000000, maintenance: 15000, capacity: 160, happiness: 5 }, { id: 'dorm_l', label: '高层公寓区 (5x8)', width: 5, height: 8, cost: 12000000, maintenance: 25000, capacity: 300, happiness: 10 }],
  [BuildingType.LECTURE_HALL]: [{ id: 'hall_s', label: '综合教学楼 (4x6)', width: 4, height: 6, cost: 6000000, maintenance: 25000, capacity: 120, revenue: 1000 }, { id: 'hall_m', label: '阶梯教室群 (5x5)', width: 5, height: 5, cost: 6500000, maintenance: 30000, capacity: 150, revenue: 1500 }, { id: 'hall_l', label: '第一教学楼 (6x8)', width: 6, height: 8, cost: 12000000, maintenance: 50000, capacity: 300, revenue: 3000 }],
  [BuildingType.LABORATORY]: [{ id: 'lab_s', label: '基础实验室 (4x8)', width: 4, height: 8, cost: 16000000, maintenance: 80000, capacity: 30, revenue: 25000 }, { id: 'lab_m', label: '科研中心 (6x6)', width: 6, height: 6, cost: 18000000, maintenance: 100000, capacity: 40, revenue: 40000 }, { id: 'lab_l', label: '国家重点实验室 (5x10)', width: 5, height: 10, cost: 25000000, maintenance: 150000, capacity: 60, revenue: 80000 }],
  [BuildingType.CAFETERIA]: [{ id: 'cafe_s', label: '社区食堂 (5x5)', width: 5, height: 5, cost: 3000000, maintenance: 15000, happiness: 15, revenue: 30000 }, { id: 'cafe_m', label: '风味餐厅 (3x10)', width: 3, height: 10, cost: 3500000, maintenance: 20000, happiness: 20, revenue: 45000 }, { id: 'cafe_l', label: '综合餐饮中心 (4x8)', width: 4, height: 8, cost: 4000000, maintenance: 30000, happiness: 25, revenue: 60000 }]
};

export const MISSIONS_DEF: Record<string, MissionDef> = {
    'root_comprehensive': {
        id: 'root_comprehensive',
        title: '确认设立综合性大学',
        description: '在现代高等教育体系中，综合性大学承担着培养全面人才的重任。向教育部申请确立学校发展方向为综合性大学，将奠定我校文理并重、多学科协调发展的基调。',
        requirements: {
            colleges: [CollegeType.ARTS, CollegeType.SCIENCE],
            minBuildingsPerCollege: { type: BuildingType.LECTURE_HALL, count: 1 },
            needDean: true
        },
        rewards: {
            title: '综合性大学',
            socialRec: 10,
            ministryRec: 10,
            grant: { amount: 20000, days: 240 },
            unlocks: ['dev_comprehensive']
        },
        exclusiveWith: ['root_medical', 'root_poly', 'root_liberal'],
        nextMissions: ['dev_comprehensive'],
        position: { x: 300, y: 50 }
    },
    'root_medical': {
        id: 'root_medical',
        title: '确认设立医科大学',
        description: '医学是关乎人类健康的崇高事业。向教育部申请确立学校发展方向为医科大学，集中资源建设一流的医学教育与科研平台，为社会输送优秀的医疗人才。',
        requirements: {
            colleges: [CollegeType.MEDICINE],
            minBuildingsPerCollege: { type: BuildingType.LECTURE_HALL, count: 1 },
            needDean: true
        },
        rewards: {
            title: '医科大学',
            socialRec: 10,
            ministryRec: 10,
            grant: { amount: 20000, days: 240 },
            unlocks: ['dev_medical']
        },
        exclusiveWith: ['root_comprehensive', 'root_poly', 'root_liberal'],
        nextMissions: ['dev_medical'],
        position: { x: 100, y: 50 }
    },
    'root_poly': {
        id: 'root_poly',
        title: '确认设立理工类大学',
        description: '科技是第一生产力。向教育部申请确立学校发展方向为理工类大学，以理学为基础，工学为主干，致力于解决关键技术难题，推动工业进步。',
        requirements: {
            colleges: [CollegeType.SCIENCE],
            anyOneCategory: ['NEW_ENG', 'TRAD_ENG'], // At least one engineering college (new or traditional)
            minBuildingsPerCollege: { type: BuildingType.LECTURE_HALL, count: 1 },
            needDean: true
        },
        rewards: {
            title: '理工类大学',
            socialRec: 10,
            ministryRec: 10,
            grant: { amount: 20000, days: 240 },
            unlocks: ['dev_poly']
        },
        exclusiveWith: ['root_comprehensive', 'root_medical', 'root_liberal'],
        nextMissions: ['dev_poly'],
        position: { x: 500, y: 50 }
    },
    'root_liberal': {
        id: 'root_liberal',
        title: '确认设立文经类大学',
        description: '人文社科是社会的灵魂。向教育部申请确立学校发展方向为文经类大学，深耕文学、经济、法律等领域，培养具有深厚人文素养和国际视野的精英。',
        requirements: {
            colleges: [CollegeType.ARTS],
            categories: ['LIB_ARTS'],
            minBuildingsPerCollege: { type: BuildingType.LECTURE_HALL, count: 1 },
            needDean: true
        },
        rewards: {
            title: '文经类大学',
            socialRec: 10,
            ministryRec: 10,
            grant: { amount: 20000, days: 240 },
            unlocks: ['dev_liberal']
        },
        exclusiveWith: ['root_comprehensive', 'root_medical', 'root_poly'],
        nextMissions: ['dev_liberal'],
        position: { x: 700, y: 50 }
    },
    // Placeholders for next stage
    'dev_comprehensive': { id: 'dev_comprehensive', title: '综合建设 (开发中)', description: '下一阶段任务...', requirements: {}, rewards: {}, parentId: 'root_comprehensive', position: { x: 300, y: 250 } },
    'dev_medical': { id: 'dev_medical', title: '医学建设 (开发中)', description: '下一阶段任务...', requirements: {}, rewards: {}, parentId: 'root_medical', position: { x: 100, y: 250 } },
    'dev_poly': { id: 'dev_poly', title: '理工建设 (开发中)', description: '下一阶段任务...', requirements: {}, rewards: {}, parentId: 'root_poly', position: { x: 500, y: 250 } },
    'dev_liberal': { id: 'dev_liberal', title: '文经建设 (开发中)', description: '下一阶段任务...', requirements: {}, rewards: {}, parentId: 'root_liberal', position: { x: 700, y: 250 } },
};
