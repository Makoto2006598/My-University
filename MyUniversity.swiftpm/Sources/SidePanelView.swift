import SwiftUI

struct SidePanelView: View {
    @ObservedObject var viewModel: GameViewModel
    let tab: SidebarTab

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text(tabTitle)
                    .font(.headline)
                    .foregroundColor(.white)
                Spacer()
                Button {
                    viewModel.selectedTab = nil
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray)
                }
            }
            .padding()
            .background(Color.black.opacity(0.3))

            // Content
            ScrollView {
                switch tab {
                case .overview:
                    OverviewPanelContent(viewModel: viewModel)
                case .build:
                    BuildPanelView(viewModel: viewModel)
                case .academic:
                    AcademicPanelContent(viewModel: viewModel)
                case .hr:
                    HRPanelContent(viewModel: viewModel)
                case .finance:
                    FinancePanelContent(viewModel: viewModel)
                case .admissions:
                    AdmissionsPanelContent(viewModel: viewModel)
                case .publicity:
                    PublicityPanelContent(viewModel: viewModel)
                case .liaison:
                    LiaisonPanelContent(viewModel: viewModel)
                }
            }
        }
        .background(Color(red: 0.1, green: 0.12, blue: 0.18))
    }

    var tabTitle: String {
        switch tab {
        case .overview: return "大学总览"
        case .build: return "建造"
        case .academic: return "学院管理"
        case .hr: return "人事管理"
        case .finance: return "财务管理"
        case .admissions: return "招生管理"
        case .publicity: return "宣传公关"
        case .liaison: return "联络处"
        }
    }
}

// MARK: - Overview Panel
struct OverviewPanelContent: View {
    @ObservedObject var viewModel: GameViewModel

    var body: some View {
        let stats = viewModel.currentStats

        VStack(alignment: .leading, spacing: 16) {
            // Scale & Rank
            InfoCard(title: "大学规模") {
                InfoRow(label: "规模", value: viewModel.gameState.scale.rawValue)
                InfoRow(label: "排名", value: viewModel.gameState.rank.rawValue)
                InfoRow(label: "学生上限", value: "\(viewModel.gameState.studentCap)")
                InfoRow(label: "当前学生", value: "\(viewModel.gameState.students)")
                InfoRow(label: "容量", value: "\(stats.capacity)")
            }

            InfoCard(title: "认可度") {
                InfoRow(label: "社会认可", value: String(format: "%.0f", viewModel.gameState.socialRecognition))
                InfoRow(label: "部委认可", value: String(format: "%.0f", viewModel.gameState.ministryRecognition))
            }

            InfoCard(title: "满意度") {
                InfoRow(label: "综合幸福度", value: "\(Int(viewModel.gameState.happiness))")
                InfoRow(label: "学生满意度", value: String(format: "%.0f", stats.studentSatisfaction))
                InfoRow(label: "教师满意度", value: String(format: "%.0f", stats.facultySatisfaction))
            }

            InfoCard(title: "每日财务") {
                InfoRow(label: "收入", value: formatMoney(stats.totalRevenue), color: .green)
                InfoRow(label: "支出", value: formatMoney(stats.totalExpense), color: .red)
                InfoRow(label: "净收入", value: formatMoney(stats.netIncome), color: stats.netIncome >= 0 ? .green : .red)
            }

            InfoCard(title: "学院 (\(viewModel.gameState.colleges.count))") {
                ForEach(viewModel.gameState.colleges) { college in
                    if let def = COLLEGES_DEF[college.type] {
                        HStack {
                            Text(def.name)
                                .foregroundColor(.white)
                            Spacer()
                            if college.deanId != nil {
                                Text("有院长")
                                    .font(.caption)
                                    .foregroundColor(.green)
                            } else {
                                Text("无院长")
                                    .font(.caption)
                                    .foregroundColor(.orange)
                            }
                        }
                        .font(.caption)
                    }
                }
            }

            InfoCard(title: "教职工 (\(viewModel.gameState.faculty.count))") {
                let titleCounts = Dictionary(grouping: viewModel.gameState.faculty, by: { $0.title })
                ForEach(FacultyTitle.allCases, id: \.self) { title in
                    if let count = titleCounts[title]?.count, count > 0 {
                        InfoRow(label: title.rawValue, value: "\(count)人")
                    }
                }
            }
        }
        .padding()
    }
}

// MARK: - Academic Panel
struct AcademicPanelContent: View {
    @ObservedObject var viewModel: GameViewModel
    @State private var showAddCollege = false

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Button {
                showAddCollege.toggle()
            } label: {
                Label("开设新学院", systemImage: "plus.circle.fill")
                    .frame(maxWidth: .infinity)
                    .padding(10)
                    .background(Color.blue.opacity(0.3))
                    .cornerRadius(8)
                    .foregroundColor(.blue)
            }

            if showAddCollege {
                VStack(spacing: 6) {
                    ForEach(CollegeType.allCases, id: \.self) { type in
                        if let def = COLLEGES_DEF[type],
                           !viewModel.gameState.colleges.contains(where: { $0.type == type }) {
                            let hasDep = def.dependency == nil || viewModel.gameState.colleges.contains(where: { $0.type == def.dependency })
                            Button {
                                viewModel.addCollege(type: type)
                            } label: {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(def.name)
                                            .font(.subheadline.bold())
                                        Text(def.description)
                                            .font(.caption2)
                                            .foregroundColor(.gray)
                                        if let dep = def.dependency, let depDef = COLLEGES_DEF[dep] {
                                            Text("前置: \(depDef.name)")
                                                .font(.caption2)
                                                .foregroundColor(hasDep ? .green : .red)
                                        }
                                    }
                                    Spacer()
                                }
                                .padding(8)
                                .background(Color.white.opacity(0.05))
                                .cornerRadius(8)
                                .foregroundColor(.white)
                                .opacity(hasDep ? 1 : 0.5)
                            }
                            .disabled(!hasDep)
                        }
                    }
                }
            }

            // Existing colleges
            ForEach(viewModel.gameState.colleges) { college in
                if let def = COLLEGES_DEF[college.type] {
                    InfoCard(title: "\(def.name)") {
                        InfoRow(label: "类别", value: def.category.rawValue)
                        InfoRow(label: "专业数", value: "\(college.activeMajors.count)")

                        // Dean
                        HStack {
                            Text("院长:")
                                .foregroundColor(.gray)
                            if let deanId = college.deanId,
                               let dean = viewModel.gameState.faculty.first(where: { $0.id == deanId }) {
                                Text("\(dean.name) (\(dean.title.rawValue))")
                                    .foregroundColor(.green)
                            } else {
                                Text("未任命")
                                    .foregroundColor(.orange)
                            }
                            Spacer()
                        }
                        .font(.caption)

                        // Assign dean picker
                        let deptFaculty = viewModel.gameState.faculty.filter { $0.department == college.type }
                        if !deptFaculty.isEmpty {
                            Menu("任命院长") {
                                Button("无") { viewModel.assignDean(collegeType: college.type, facultyId: nil) }
                                ForEach(deptFaculty) { f in
                                    Button("\(f.name) - \(f.title.rawValue)") {
                                        viewModel.assignDean(collegeType: college.type, facultyId: f.id)
                                    }
                                }
                            }
                            .font(.caption)
                            .foregroundColor(.blue)
                        }
                    }
                }
            }
        }
        .padding()
    }
}

// MARK: - HR Panel
struct HRPanelContent: View {
    @ObservedObject var viewModel: GameViewModel
    @State private var showRecruit = false
    @State private var recruitDept: CollegeType = .arts
    @State private var recruitMethod: RecruitmentMethod = .social

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Recruit button
            Button {
                showRecruit.toggle()
            } label: {
                Label("招聘教职工", systemImage: "person.badge.plus")
                    .frame(maxWidth: .infinity)
                    .padding(10)
                    .background(Color.blue.opacity(0.3))
                    .cornerRadius(8)
                    .foregroundColor(.blue)
            }

            if showRecruit && !viewModel.gameState.colleges.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("选择学院")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Picker("学院", selection: $recruitDept) {
                        ForEach(viewModel.gameState.colleges) { c in
                            if let def = COLLEGES_DEF[c.type] {
                                Text(def.name).tag(c.type)
                            }
                        }
                    }
                    .pickerStyle(.menu)

                    Text("招聘渠道")
                        .font(.caption)
                        .foregroundColor(.gray)
                    ForEach([RecruitmentMethod.ministry, .social, .headhunterLow, .headhunterMid, .headhunterHigh], id: \.self) { method in
                        Button {
                            viewModel.recruitFaculty(method: method, department: recruitDept)
                        } label: {
                            HStack {
                                Text(method.label)
                                Spacer()
                                Text(formatMoney(method.cost))
                                    .foregroundColor(.green)
                            }
                            .padding(8)
                            .background(Color.white.opacity(0.05))
                            .cornerRadius(6)
                            .foregroundColor(.white)
                            .font(.caption)
                        }
                    }
                }
                .padding(8)
                .background(Color.white.opacity(0.03))
                .cornerRadius(8)
            }

            // Faculty list
            Text("教职工列表 (\(viewModel.gameState.faculty.count)人)")
                .font(.subheadline.bold())
                .foregroundColor(.white)

            ForEach(viewModel.gameState.faculty) { f in
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(f.name) - \(f.title.rawValue)")
                            .font(.caption.bold())
                            .foregroundColor(.white)
                        HStack {
                            if let dept = COLLEGES_DEF[f.department] {
                                Text(dept.name)
                                    .foregroundColor(.cyan)
                            }
                            Text("薪资:\(formatMoney(f.salary))")
                                .foregroundColor(.green)
                            Text("满意:\(Int(f.satisfaction))")
                                .foregroundColor(f.satisfaction > 50 ? .green : .red)
                        }
                        .font(.caption2)
                    }
                    Spacer()
                    Button {
                        viewModel.fireFaculty(id: f.id)
                    } label: {
                        Image(systemName: "xmark.circle")
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
                .padding(8)
                .background(Color.white.opacity(0.05))
                .cornerRadius(8)
            }
        }
        .padding()
    }
}

// MARK: - Finance Panel
struct FinancePanelContent: View {
    @ObservedObject var viewModel: GameViewModel

    var body: some View {
        let stats = viewModel.currentStats
        let fs = viewModel.gameState.financeSettings

        VStack(alignment: .leading, spacing: 16) {
            InfoCard(title: "每日收支") {
                InfoRow(label: "政府拨款", value: formatMoney(stats.dailyGrant), color: .green)
                InfoRow(label: "学费收入", value: formatMoney(stats.annualizedTuition), color: .green)
                InfoRow(label: "建筑收入", value: formatMoney(stats.buildingRevenueDaily), color: .green)
                Divider()
                InfoRow(label: "维护费用", value: formatMoney(stats.maintenanceCostActual), color: .red)
                InfoRow(label: "教师薪资", value: formatMoney(stats.salaryRequiredDaily), color: .red)
                InfoRow(label: "科研经费", value: formatMoney(stats.researchAllocated), color: .red)
                InfoRow(label: "食堂补贴", value: formatMoney(stats.cafeteriaAllocated), color: .red)
                InfoRow(label: "学生补贴", value: formatMoney(stats.studentAllocated), color: .red)
                Divider()
                InfoRow(label: "净收入", value: formatMoney(stats.netIncome), color: stats.netIncome >= 0 ? .green : .red)
            }

            InfoCard(title: "预算设置") {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("学费(千/年/生)")
                            .font(.caption)
                            .foregroundColor(.gray)
                        Spacer()
                        Text(String(format: "%.0f", fs.tuitionFeePerYear))
                            .foregroundColor(.white)
                            .font(.caption)
                    }
                    Slider(value: Binding(
                        get: { fs.tuitionFeePerYear },
                        set: { viewModel.gameState.financeSettings.tuitionFeePerYear = $0 }
                    ), in: 5...50, step: 1)

                    HStack {
                        Text("日预算总额")
                            .font(.caption)
                            .foregroundColor(.gray)
                        Spacer()
                        Text(formatMoney(fs.totalDailyBudget))
                            .foregroundColor(.white)
                            .font(.caption)
                    }
                    Slider(value: Binding(
                        get: { fs.totalDailyBudget },
                        set: { viewModel.gameState.financeSettings.totalDailyBudget = $0 }
                    ), in: 10000...5000000, step: 10000)
                }
            }

            InfoCard(title: "预算分配 (权重)") {
                budgetSlider("科研", weight: \.research)
                budgetSlider("食堂", weight: \.cafeteria)
                budgetSlider("维护", weight: \.maintenance)
                budgetSlider("学生", weight: \.student)
                budgetSlider("教师", weight: \.faculty)
            }

            if !viewModel.gameState.budgetConfirmed {
                Button {
                    viewModel.confirmBudget()
                } label: {
                    Text("确认本月预算")
                        .frame(maxWidth: .infinity)
                        .padding(10)
                        .background(Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                        .font(.headline)
                }
            }
        }
        .padding()
    }

    @ViewBuilder
    private func budgetSlider(_ label: String, weight: WritableKeyPath<AllocationWeights, Double>) -> some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)
                .frame(width: 40, alignment: .leading)
            Slider(value: Binding(
                get: { viewModel.gameState.financeSettings.allocationWeights[keyPath: weight] },
                set: { viewModel.gameState.financeSettings.allocationWeights[keyPath: weight] = $0 }
            ), in: 0...100, step: 5)
            Text("\(Int(viewModel.gameState.financeSettings.allocationWeights[keyPath: weight]))")
                .font(.caption)
                .foregroundColor(.white)
                .frame(width: 30)
        }
    }
}

// MARK: - Admissions Panel
struct AdmissionsPanelContent: View {
    @ObservedObject var viewModel: GameViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            let phase = viewModel.gameState.admissionsPhase

            InfoCard(title: "招生状态") {
                InfoRow(label: "阶段", value: phaseLabel(phase))
                InfoRow(label: "当前学生", value: "\(viewModel.gameState.students)")
                InfoRow(label: "待入学", value: "\(viewModel.gameState.incomingStudents.count)")
                InfoRow(label: "学生上限", value: "\(viewModel.gameState.studentCap)")
            }

            InfoCard(title: "招生计划") {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("目标总数")
                            .font(.caption)
                            .foregroundColor(.gray)
                        Spacer()
                        Text("\(viewModel.gameState.admissionPolicy.totalTarget)")
                            .foregroundColor(.white)
                            .font(.caption)
                    }
                    Slider(value: Binding(
                        get: { Double(viewModel.gameState.admissionPolicy.totalTarget) },
                        set: { viewModel.gameState.admissionPolicy.totalTarget = Int($0) }
                    ), in: 0...Double(viewModel.gameState.studentCap), step: 100)

                    HStack {
                        Text("最低分数线")
                            .font(.caption)
                            .foregroundColor(.gray)
                        Spacer()
                        Text("\(viewModel.gameState.admissionPolicy.minScore)")
                            .foregroundColor(.white)
                            .font(.caption)
                    }
                    Slider(value: Binding(
                        get: { Double(viewModel.gameState.admissionPolicy.minScore) },
                        set: { viewModel.gameState.admissionPolicy.minScore = Int($0) }
                    ), in: 300...700, step: 10)
                }
            }

            // College targets
            if !viewModel.gameState.colleges.isEmpty {
                InfoCard(title: "各学院招生名额") {
                    ForEach(viewModel.gameState.colleges) { college in
                        if let def = COLLEGES_DEF[college.type] {
                            HStack {
                                Text(def.name)
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                    .frame(width: 80, alignment: .leading)
                                Slider(value: Binding(
                                    get: { Double(viewModel.gameState.admissionPolicy.collegeTargets[college.type.rawValue] ?? 0) },
                                    set: { viewModel.gameState.admissionPolicy.collegeTargets[college.type.rawValue] = Int($0) }
                                ), in: 0...Double(viewModel.gameState.admissionPolicy.totalTarget), step: 50)
                                Text("\(viewModel.gameState.admissionPolicy.collegeTargets[college.type.rawValue] ?? 0)")
                                    .font(.caption)
                                    .foregroundColor(.white)
                                    .frame(width: 40)
                            }
                        }
                    }
                }
            }
        }
        .padding()
    }

    func phaseLabel(_ phase: AdmissionsPhase) -> String {
        switch phase {
        case .idle: return "空闲"
        case .prep: return "准备期 (7月1-15日)"
        case .recruiting: return "招生中 (7月15-8月5日)"
        }
    }
}

// MARK: - Publicity Panel
struct PublicityPanelContent: View {
    @ObservedObject var viewModel: GameViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            InfoCard(title: "认可度") {
                InfoRow(label: "社会认可", value: String(format: "%.0f", viewModel.gameState.socialRecognition))
                InfoRow(label: "部委认可", value: String(format: "%.0f", viewModel.gameState.ministryRecognition))
            }

            // Active campaigns
            if !viewModel.gameState.publicity.activeCampaigns.isEmpty {
                InfoCard(title: "进行中的宣传") {
                    ForEach(viewModel.gameState.publicity.activeCampaigns) { camp in
                        InfoRow(label: camp.tier.label, value: "剩余\(camp.daysLeft)天")
                    }
                }
            }

            // Buffs/Debuffs
            if !viewModel.gameState.publicity.activeBuffs.isEmpty {
                InfoCard(title: "状态效果") {
                    ForEach(viewModel.gameState.publicity.activeBuffs) { buff in
                        InfoRow(label: buff.type.label, value: "剩余\(buff.daysLeft)天",
                               color: buff.type == .recentPublicity ? .yellow : .red)
                    }
                }
            }

            // Start campaigns
            InfoCard(title: "社会宣传") {
                ForEach([SocialPublicityTier.standard, .premium, .massive], id: \.self) { tier in
                    Button {
                        viewModel.startSocialCampaign(tier)
                    } label: {
                        HStack {
                            Text(tier.label)
                            Spacer()
                            Text("\(tier.duration)天")
                                .foregroundColor(.gray)
                            Text(formatMoney(tier.dailyCost * Double(tier.duration)))
                                .foregroundColor(.green)
                        }
                        .padding(8)
                        .background(Color.white.opacity(0.05))
                        .cornerRadius(6)
                        .foregroundColor(.white)
                        .font(.caption)
                    }
                }
            }

            InfoCard(title: "部委公关") {
                Button {
                    viewModel.startMinistryCampaign()
                } label: {
                    HStack {
                        Text("部委公关")
                        Spacer()
                        Text("5M")
                            .foregroundColor(.green)
                    }
                    .padding(8)
                    .background(Color.white.opacity(0.05))
                    .cornerRadius(6)
                    .foregroundColor(.white)
                    .font(.caption)
                }
            }
        }
        .padding()
    }
}

// MARK: - Liaison Panel
struct LiaisonPanelContent: View {
    @ObservedObject var viewModel: GameViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Active missions
            if !viewModel.gameState.liaison.activeMissions.isEmpty {
                InfoCard(title: "进行中的任务") {
                    ForEach(viewModel.gameState.liaison.activeMissions) { mission in
                        if let def = MISSIONS_DEF[mission.id] {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(def.title)
                                    .font(.caption.bold())
                                    .foregroundColor(.white)
                                HStack {
                                    Button("完成") { viewModel.claimMission(mission.id) }
                                        .foregroundColor(.green)
                                        .font(.caption2)
                                    Button("放弃") { viewModel.cancelMission(mission.id) }
                                        .foregroundColor(.red)
                                        .font(.caption2)
                                }
                            }
                            .padding(6)
                            .background(Color.white.opacity(0.05))
                            .cornerRadius(6)
                        }
                    }
                }
            }

            // Available missions
            InfoCard(title: "可用任务") {
                ForEach(Array(MISSIONS_DEF.keys.sorted()), id: \.self) { id in
                    let status = viewModel.gameState.liaison.missions[id] ?? .locked
                    if status == .available, let def = MISSIONS_DEF[id] {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(def.title)
                                .font(.caption.bold())
                                .foregroundColor(.white)
                            Text(def.description)
                                .font(.caption2)
                                .foregroundColor(.gray)
                                .lineLimit(2)

                            if let rewards = def.rewards.title {
                                Text("奖励: \(rewards)")
                                    .font(.caption2)
                                    .foregroundColor(.yellow)
                            }

                            Button("接受任务") {
                                viewModel.acceptMission(id)
                            }
                            .font(.caption)
                            .foregroundColor(.blue)
                        }
                        .padding(6)
                        .background(Color.white.opacity(0.05))
                        .cornerRadius(6)
                    }
                }
            }

            // Grant info
            if viewModel.gameState.liaison.grantDaysLeft > 0 {
                InfoCard(title: "任务补助") {
                    InfoRow(label: "日补助", value: formatMoney(viewModel.gameState.liaison.grantDailyAmount), color: .green)
                    InfoRow(label: "剩余天数", value: "\(viewModel.gameState.liaison.grantDaysLeft)")
                }
            }
        }
        .padding()
    }
}

// MARK: - Reusable Components
struct InfoCard<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.subheadline.bold())
                .foregroundColor(.white)
            content()
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
    }
}

struct InfoRow: View {
    let label: String
    let value: String
    var color: Color = .white

    var body: some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)
            Spacer()
            Text(value)
                .font(.caption.bold())
                .foregroundColor(color)
        }
    }
}
