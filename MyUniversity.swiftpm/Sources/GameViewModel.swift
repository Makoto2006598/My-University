import SwiftUI
import Combine

@Observable
class GameViewModel {
    var gameState: GameState
    var gameSpeed: Int = 1
    var previousSpeed: Int = 1

    // UI State
    var selectedTab: SidebarTab? = nil
    var selectedBuildingType: BuildingType? = nil
    var selectedVariantIndex: Int = 0
    var isRotated: Bool = false
    var selectedCellOrigin: (x: Int, y: Int)? = nil
    var showBudgetAlert: Bool = false
    var alertMessage: String = ""
    var showAlert: Bool = false
    var currentSlot: Int? = nil
    var showServiceOverlay: Bool = false

    private var gameTimer: Timer?
    private let setupName: String
    private let setupType1: UniType1
    private let setupType2: UniType2

    init(name: String, type1: UniType1, type2: UniType2) {
        self.setupName = name
        self.setupType1 = type1
        self.setupType2 = type2

        // Initialize mission states
        var initialMissions: [String: MissionStatus] = [:]
        for key in MISSIONS_DEF.keys {
            initialMissions[key] = key.hasPrefix("root") ? .available : .locked
        }

        self.gameState = GameState(
            money: type1 == .publicUni ? INITIAL_MONEY_PUBLIC : INITIAL_MONEY_PRIVATE,
            grid: createInitialGrid(),
            universityName: name,
            uniType1: type1,
            uniType2: type2,
            liaison: LiaisonState(missions: initialMissions)
        )

        startGameLoop()
    }

    // MARK: - Game Loop
    func startGameLoop() {
        stopGameLoop()
        guard gameSpeed > 0 else { return }
        let interval = 8.0 / Double(gameSpeed)
        gameTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            self?.tick()
        }
    }

    func stopGameLoop() {
        gameTimer?.invalidate()
        gameTimer = nil
    }

    func setSpeed(_ speed: Int) {
        if speed > 0 {
            let date = getGameDate(gameState.day)
            if date.date == 1 && !gameState.budgetConfirmed && gameState.day > 1 {
                showBudgetAlert = true
                return
            }
            previousSpeed = speed
        }
        gameSpeed = speed
        startGameLoop()
    }

    // MARK: - Game Tick
    func tick() {
        let currentDate = getGameDate(gameState.day)
        var newBudgetConfirmed = gameState.budgetConfirmed

        // Monthly budget reset
        if currentDate.date == 1 && gameState.day > 1 {
            newBudgetConfirmed = false
        }

        // Block game on 1st if budget not confirmed
        if currentDate.date == 1 && !newBudgetConfirmed && gameState.day > 1 {
            gameState.budgetConfirmed = false
            showBudgetAlert = true
            setSpeed(0)
            return
        }

        // Admissions Phase
        var newAdmissionsPhase = gameState.admissionsPhase
        var newIncoming = gameState.incomingStudents

        if currentDate.year >= 2027 && currentDate.month == 7 && currentDate.date == 1 && newAdmissionsPhase == .idle {
            newAdmissionsPhase = .prep
        }
        if currentDate.year >= 2027 && currentDate.month == 7 && currentDate.date == 15 && newAdmissionsPhase == .prep {
            newAdmissionsPhase = .recruiting
        }

        if newAdmissionsPhase == .recruiting &&
            ((currentDate.month == 7 && currentDate.date >= 15) || (currentDate.month == 8 && currentDate.date <= 5)) {
            if !gameState.colleges.isEmpty && gameState.admissionPolicy.totalTarget > 0 {
                let happinessModifier = 0.7 + 0.6 * (gameState.happiness / 100)
                let newStudents = generateDailyStudents(
                    policy: gameState.admissionPolicy,
                    colleges: gameState.colleges,
                    currentIncomingCount: newIncoming.count,
                    happinessModifier: happinessModifier
                )
                newIncoming.append(contentsOf: newStudents)
            }
        }

        if currentDate.month == 8 && currentDate.date == 6 && newAdmissionsPhase == .recruiting {
            newAdmissionsPhase = .idle
        }

        // Enroll students on Sep 1
        if currentDate.month == 9 && currentDate.date == 1 && !newIncoming.isEmpty {
            gameState.studentList.append(contentsOf: newIncoming)
            gameState.students += newIncoming.count
            newIncoming = []
        }

        // Publicity
        var activeBuffs = gameState.publicity.activeBuffs.map { ActiveBuff(type: $0.type, daysLeft: $0.daysLeft - 1) }.filter { $0.daysLeft > 0 }
        let hasOverPublicity = activeBuffs.contains { $0.type == .overPublicity }
        let hasBackroom = activeBuffs.contains { $0.type == .backroomDeal }

        var dailyPublicityCost: Double = 0
        var dailySocialRecGain: Double = 0
        var newActiveCampaigns: [ActiveCampaign] = []

        for camp in gameState.publicity.activeCampaigns {
            let daysLeft = camp.daysLeft - 1
            let range = camp.tier.gainRange
            dailyPublicityCost += camp.tier.dailyCost

            var gain = Double.random(in: range.min...range.max)
            if hasOverPublicity { gain *= 0.85 }
            if hasBackroom { gain *= 0.1 }
            dailySocialRecGain += gain

            if daysLeft > 0 {
                newActiveCampaigns.append(ActiveCampaign(tier: camp.tier, daysLeft: daysLeft))
            }
        }

        // Liaison grants
        var liaisonGrant: Double = 0
        var newGrantDaysLeft = gameState.liaison.grantDaysLeft
        if newGrantDaysLeft > 0 {
            liaisonGrant = gameState.liaison.grantDailyAmount
            newGrantDaysLeft -= 1
        }

        // Cooldowns
        var newCooldowns = gameState.liaison.cooldowns
        var newMissionStatuses = gameState.liaison.missions
        for (id, day) in newCooldowns {
            if day <= gameState.day {
                newCooldowns.removeValue(forKey: id)
                newMissionStatuses[id] = .available
            }
        }

        // Construction progress
        var anyCompleted = false
        var gridChanged = false
        var newGrid = gameState.grid

        for y in 0..<GRID_SIZE {
            for x in 0..<GRID_SIZE {
                if newGrid[y][x].constructionStatus == .constructing, let left = newGrid[y][x].constructionLeft {
                    gridChanged = true
                    let newLeft = left - 1
                    if newLeft <= 0 {
                        anyCompleted = true
                        newGrid[y][x].constructionStatus = .completed
                        newGrid[y][x].constructionLeft = 0
                    } else {
                        newGrid[y][x].constructionLeft = newLeft
                    }
                }
            }
        }

        if anyCompleted {
            updateFullGrid(&newGrid)
        }

        // Calculate stats
        let stats = calculateStats(grid: newGrid, currentStudents: gameState.students, currentHappiness: gameState.happiness, gameState: gameState)
        let netIncome = stats.netIncome - dailyPublicityCost + liaisonGrant
        let totalMinistryRec = stats.ministryRecognition + gameState.publicity.ministryBonus

        // Finance history
        let historyPoint = FinanceHistoryPoint(
            day: gameState.day,
            totalMoney: gameState.money + netIncome,
            income: stats.totalRevenue + liaisonGrant,
            expense: stats.totalExpense + dailyPublicityCost,
            balance: netIncome,
            maintenance: stats.maintenanceAllocated,
            cafeteriaSubsidy: stats.cafeteriaAllocated,
            researchCost: stats.researchAllocated,
            studentSubsidy: stats.studentAllocated,
            ministryGrant: stats.dailyGrant,
            facultySalaries: stats.salaryRequiredDaily,
            publicityCost: dailyPublicityCost,
            liaisonIncome: liaisonGrant
        )

        // Faculty satisfaction & resignation
        let baseFacSat = stats.facultySatisfaction
        var resignedIds: [String] = []
        var updatedFaculty = gameState.faculty.map { f -> Faculty in
            var f = f
            let expected = f.title.expectedSalary
            let salaryRatio = min(1.5, f.salary / expected)
            let salaryBonus = (salaryRatio - 1) * 20

            let tenure = Double(gameState.day - f.hireDate) / 365
            let tenurePenalty: Double = (tenure > 2 && salaryRatio < 0.9) ? -5 : 0

            let facultyBudgetRatio = stats.facultyAllocated > 0 ? min(1, stats.facultyAllocated / max(1, stats.salaryRequiredDaily)) : 1
            let budgetBonus = (facultyBudgetRatio - 1) * 10

            let newSat = min(100, max(0, baseFacSat + salaryBonus + tenurePenalty + budgetBonus))

            if newSat < 20 && Double.random(in: 0...1) < 0.02 {
                resignedIds.append(f.id)
            } else if newSat < 35 && Double.random(in: 0...1) < 0.005 {
                resignedIds.append(f.id)
            }

            f.satisfaction = newSat.rounded()
            return f
        }
        updatedFaculty.removeAll { resignedIds.contains($0.id) }

        // Update state
        gameState.day += 1
        gameState.money += netIncome
        gameState.happiness = stats.happiness.rounded()
        gameState.faculty = updatedFaculty
        gameState.grid = newGrid
        gameState.incomingStudents = newIncoming
        gameState.budgetConfirmed = newBudgetConfirmed
        gameState.admissionsPhase = newAdmissionsPhase
        gameState.socialRecognition += dailySocialRecGain
        gameState.ministryRecognition = totalMinistryRec
        gameState.publicity.activeCampaigns = newActiveCampaigns
        gameState.publicity.activeBuffs = activeBuffs
        gameState.liaison.missions = newMissionStatuses
        gameState.liaison.cooldowns = newCooldowns
        gameState.liaison.grantDaysLeft = newGrantDaysLeft

        // Update scale & rank
        gameState.scale = calculateScale(gameState.students, 1)
        let rankResult = calculateRank(gameState)
        gameState.rank = rankResult.rank
        gameState.studentCap = rankResult.cap
        gameState.universityLabel = getUniversityLabel(gameState.colleges)

        // Append history
        gameState.financeHistory.append(historyPoint)
        if gameState.financeHistory.count > 60 {
            gameState.financeHistory = Array(gameState.financeHistory.suffix(60))
        }
    }

    // MARK: - Building Actions
    func placeBuilding(x: Int, y: Int) {
        guard let tool = selectedBuildingType else { return }
        let variants = VARIANTS[tool]
        let variant = variants != nil && !variants!.isEmpty ? variants![min(selectedVariantIndex, variants!.count - 1)] : nil
        var width = variant?.width ?? (BUILDINGS[tool]?.width ?? 1)
        var height = variant?.height ?? (BUILDINGS[tool]?.height ?? 1)
        if isRotated { swap(&width, &height) }
        let cost = variant?.cost ?? (BUILDINGS[tool]?.cost ?? 0)

        guard gameState.money >= cost else {
            showAlertMsg("资金不足！")
            return
        }
        guard x + width <= GRID_SIZE && y + height <= GRID_SIZE else { return }

        let def = BUILDINGS[tool]!
        let needsRoad = def.requiresRoadConnection && tool != .road && tool != .cityRoad
        if needsRoad && tool != .schoolGate {
            let check = RoadNetwork.checkConnectedRoadAdjacency(gameState.grid, x: x, y: y, width: width, height: height)
            if !check.valid {
                showAlertMsg(check.reason ?? "建筑必须连接道路！")
                return
            }
        }

        // Check occupied
        for dy in 0..<height {
            for dx in 0..<width {
                let cell = gameState.grid[y + dy][x + dx]
                if cell.building != .none && cell.building != .fence { return }
            }
        }

        let bid = generateId()
        for dy in 0..<height {
            for dx in 0..<width {
                gameState.grid[y + dy][x + dx].building = tool
                gameState.grid[y + dy][x + dx].buildingId = bid
                gameState.grid[y + dy][x + dx].variantId = variant?.id
                gameState.grid[y + dy][x + dx].isOrigin = (dx == 0 && dy == 0)
                gameState.grid[y + dy][x + dx].rotation = isRotated ? 1 : 0
                gameState.grid[y + dy][x + dx].constructionStatus = def.constructionTime > 0 ? .constructing : .completed
                gameState.grid[y + dy][x + dx].constructionLeft = def.constructionTime
            }
        }
        updateFullGrid(&gameState.grid)
        gameState.money -= cost
    }

    func placeRoad(path: [(Int, Int)]) {
        guard !path.isEmpty, let tool = selectedBuildingType, tool == .road else { return }
        let variants = VARIANTS[.road]
        let variant = variants?[min(selectedVariantIndex, (variants?.count ?? 1) - 1)]
        let costPerCell = variant?.cost ?? (BUILDINGS[.road]?.cost ?? 5000)
        let totalCost = costPerCell * Double(path.count)

        guard gameState.money >= totalCost else {
            showAlertMsg("资金不足！")
            return
        }

        for (px, py) in path {
            let current = gameState.grid[py][px]
            if current.building == .none || current.building == .fence {
                gameState.grid[py][px] = CellData(
                    x: px, y: py, building: .road,
                    variantId: variant?.id,
                    constructionStatus: .completed,
                    isZoned: false,
                    roadZoneDepth: 3
                )
            }
        }
        updateFullGrid(&gameState.grid)
        gameState.money -= totalCost
    }

    func removeBuilding(buildingId: String) {
        for y in 0..<GRID_SIZE {
            for x in 0..<GRID_SIZE {
                if gameState.grid[y][x].buildingId == buildingId {
                    gameState.grid[y][x] = CellData(x: x, y: y)
                }
            }
        }
        updateFullGrid(&gameState.grid)
        selectedCellOrigin = nil
    }

    func renameBuilding(buildingId: String, newName: String) {
        for y in 0..<GRID_SIZE {
            for x in 0..<GRID_SIZE {
                if gameState.grid[y][x].buildingId == buildingId {
                    gameState.grid[y][x].customName = newName
                }
            }
        }
    }

    // MARK: - College Actions
    func addCollege(type: CollegeType) {
        guard COLLEGES_DEF[type] != nil else { return }
        guard !gameState.colleges.contains(where: { $0.type == type }) else { return }

        // Check dependency
        if let dep = COLLEGES_DEF[type]?.dependency {
            guard gameState.colleges.contains(where: { $0.type == dep }) else {
                showAlertMsg("需要先建立前置学院！")
                return
            }
        }

        let college = ActiveCollege(
            id: generateId(), type: type,
            activeMajors: MAJORS_DEF.filter { $0.collegeType == type }.map { $0.id },
            foundingDay: gameState.day
        )
        gameState.colleges.append(college)
    }

    func assignDean(collegeType: CollegeType, facultyId: String?) {
        guard let idx = gameState.colleges.firstIndex(where: { $0.type == collegeType }) else { return }
        gameState.colleges[idx].deanId = facultyId
    }

    func assignViceDean(collegeType: CollegeType, facultyId: String?) {
        guard let idx = gameState.colleges.firstIndex(where: { $0.type == collegeType }) else { return }
        gameState.colleges[idx].viceDeanId = facultyId
    }

    // MARK: - HR Actions
    func recruitFaculty(method: RecruitmentMethod, department: CollegeType) {
        let cost = method.cost
        guard gameState.money >= cost else {
            showAlertMsg("资金不足！")
            return
        }

        let titlePool: [(FacultyTitle, Double)]
        switch method {
        case .ministry:
            titlePool = [(.ta, 0.6), (.lecturer, 0.3), (.assocProf, 0.1)]
        case .social:
            titlePool = [(.ta, 0.3), (.lecturer, 0.4), (.assocProf, 0.2), (.prof, 0.1)]
        case .headhunterLow:
            titlePool = [(.lecturer, 0.3), (.assocProf, 0.4), (.prof, 0.3)]
        case .headhunterMid:
            titlePool = [(.assocProf, 0.3), (.prof, 0.5), (.academician, 0.2)]
        case .headhunterHigh:
            titlePool = [(.prof, 0.4), (.academician, 0.6)]
        }

        var roll = Double.random(in: 0...1)
        var selectedTitle: FacultyTitle = .ta
        for (title, prob) in titlePool {
            roll -= prob
            if roll <= 0 {
                selectedTitle = title
                break
            }
        }

        let salary = selectedTitle.expectedSalary * Double.random(in: 0.8...1.2)
        let research = Double.random(in: 20...100)
        let management = Double.random(in: 20...100)

        let faculty = Faculty(
            id: generateId(), name: generateName(),
            title: selectedTitle, salary: salary,
            department: department,
            researchAbility: research,
            managementAbility: management,
            hireDate: gameState.day,
            satisfaction: 70
        )

        gameState.faculty.append(faculty)
        gameState.money -= cost
    }

    func fireFaculty(id: String) {
        gameState.faculty.removeAll { $0.id == id }
        // Remove from dean/vice dean positions
        for i in 0..<gameState.colleges.count {
            if gameState.colleges[i].deanId == id { gameState.colleges[i].deanId = nil }
            if gameState.colleges[i].viceDeanId == id { gameState.colleges[i].viceDeanId = nil }
        }
    }

    // MARK: - Finance
    func confirmBudget() {
        gameState.budgetConfirmed = true
        showBudgetAlert = false
        if gameSpeed == 0 {
            setSpeed(previousSpeed)
        }
    }

    // MARK: - Publicity
    func startSocialCampaign(_ tier: SocialPublicityTier) {
        let hasOver = gameState.publicity.activeBuffs.contains { $0.type == .overPublicity }
        if hasOver || !gameState.publicity.activeCampaigns.isEmpty {
            showAlertMsg("当前无法开始宣传活动")
            return
        }

        let newCampaign = ActiveCampaign(tier: tier, daysLeft: tier.duration)
        let hasRecent = gameState.publicity.activeBuffs.contains { $0.type == .recentPublicity }

        if hasRecent {
            gameState.publicity.activeBuffs.append(ActiveBuff(type: .overPublicity, daysLeft: 90))
        } else {
            gameState.publicity.activeBuffs.append(ActiveBuff(type: .recentPublicity, daysLeft: 180))
        }

        gameState.publicity.activeCampaigns = [newCampaign]
    }

    func startMinistryCampaign() {
        let cost: Double = 5_000_000
        guard gameState.money >= cost else {
            showAlertMsg("资金不足 (需要 5M)")
            return
        }

        let hasOver = gameState.publicity.activeBuffs.contains { $0.type == .overPublicity }
        if hasOver {
            showAlertMsg("处于过度宣传状态，无法公关")
            return
        }

        let stats = calculateStats(grid: gameState.grid, currentStudents: gameState.students, currentHappiness: gameState.happiness, gameState: gameState)
        let facSat = stats.facultySatisfaction

        let gainBase = 10 + Double.random(in: 0...40)
        var gain = gainBase * (0.5 + 0.5 * (facSat / 100))

        let hasRecent = gameState.publicity.activeBuffs.contains { $0.type == .recentPublicity }
        let hasBackroom = gameState.publicity.activeBuffs.contains { $0.type == .backroomDeal }

        if hasRecent { gain *= 0.9 }
        if hasOver { gain *= 0.7 }
        if hasBackroom { gain *= 0.2 }

        let hasContact = gameState.publicity.activeBuffs.contains { $0.type == .ministryContact }
        if hasContact {
            gameState.publicity.activeBuffs.append(ActiveBuff(type: .backroomDeal, daysLeft: 360))
        } else {
            gameState.publicity.activeBuffs.append(ActiveBuff(type: .ministryContact, daysLeft: 180))
        }

        gameState.money -= cost
        gameState.ministryRecognition += gain
        gameState.publicity.ministryBonus += gain
    }

    // MARK: - Liaison / Missions
    func acceptMission(_ id: String) {
        guard gameState.liaison.activeMissions.count < 3 else {
            showAlertMsg("任务已满")
            return
        }

        guard let def = MISSIONS_DEF[id] else { return }
        let activeIds = gameState.liaison.activeMissions.map { $0.id }

        if !def.exclusiveWith.isEmpty {
            if let conflict = def.exclusiveWith.first(where: { activeIds.contains($0) }) {
                showAlertMsg("互斥任务冲突：\(MISSIONS_DEF[conflict]?.title ?? conflict)")
                return
            }
        }

        gameState.liaison.missions[id] = .active
        gameState.liaison.activeMissions.append(ActiveMission(id: id, acceptedDay: gameState.day))
    }

    func cancelMission(_ id: String) {
        gameState.liaison.missions[id] = .cooldown
        gameState.liaison.cooldowns[id] = gameState.day + 30
        gameState.liaison.activeMissions.removeAll { $0.id == id }
    }

    func claimMission(_ id: String) {
        guard checkMissionRequirements(id) else {
            showAlertMsg("未满足任务完成条件！")
            return
        }

        guard let def = MISSIONS_DEF[id] else { return }
        gameState.liaison.missions[id] = .completed

        if !def.exclusiveWith.isEmpty {
            for exId in def.exclusiveWith {
                gameState.liaison.missions[exId] = .locked
            }
        }

        if let unlocks = def.rewards.unlocks {
            for unId in unlocks {
                gameState.liaison.missions[unId] = .available
            }
        }

        if let title = def.rewards.title {
            gameState.universityLabel = title
        }
        if let soc = def.rewards.socialRec {
            gameState.socialRecognition += soc
        }
        if let min = def.rewards.ministryRec {
            gameState.ministryRecognition += min
            gameState.publicity.ministryBonus += min
        }
        if let grant = def.rewards.grant {
            gameState.liaison.grantDailyAmount += grant.amount
            gameState.liaison.grantDaysLeft += grant.days
        }

        gameState.liaison.activeMissions.removeAll { $0.id == id }
    }

    func checkMissionRequirements(_ id: String) -> Bool {
        guard let def = MISSIONS_DEF[id] else { return false }
        let req = def.requirements

        if let colleges = req.colleges {
            for cType in colleges {
                if !gameState.colleges.contains(where: { $0.type == cType }) { return false }
            }
        }

        if let categories = req.categories {
            for cat in categories {
                let found = gameState.colleges.contains { c in
                    COLLEGES_DEF[c.type]?.category.rawValue == cat
                }
                if !found { return false }
            }
        }

        if req.needDean {
            var requiredColleges = Set<CollegeType>()
            if let cols = req.colleges { cols.forEach { requiredColleges.insert($0) } }
            if let cats = req.categories {
                for c in gameState.colleges {
                    if let def = COLLEGES_DEF[c.type], cats.contains(def.category.rawValue) {
                        requiredColleges.insert(c.type)
                    }
                }
            }
            for cType in requiredColleges {
                if let col = gameState.colleges.first(where: { $0.type == cType }), col.deanId == nil {
                    return false
                }
            }
        }

        if let buildReq = req.minBuildingsPerCollege {
            var reqCount = (req.colleges?.count ?? 0)
            if let cats = req.categories { reqCount += cats.count }

            var count = 0
            for row in gameState.grid {
                for cell in row {
                    if cell.building == buildReq.type && cell.isOrigin && cell.constructionStatus == .completed {
                        count += 1
                    }
                }
            }
            if count < reqCount * buildReq.count { return false }
        }

        return true
    }

    // MARK: - Save/Load
    func saveGame(slot: Int) -> Bool {
        currentSlot = slot
        return SaveManager.save(slot: slot, gameState: gameState, name: setupName, type1: setupType1, type2: setupType2)
    }

    func loadGame(slot: Int) -> Bool {
        guard let data = SaveManager.load(slot: slot) else { return false }
        gameState = data.gameState
        currentSlot = slot
        return true
    }

    // MARK: - Helpers
    func showAlertMsg(_ msg: String) {
        alertMessage = msg
        showAlert = true
    }

    func getBuildingAt(_ x: Int, _ y: Int) -> CellData? {
        guard x >= 0, x < GRID_SIZE, y >= 0, y < GRID_SIZE else { return nil }
        return gameState.grid[y][x]
    }

    func findBuildingOrigin(_ buildingId: String) -> (x: Int, y: Int)? {
        for y in 0..<GRID_SIZE {
            for x in 0..<GRID_SIZE {
                if gameState.grid[y][x].buildingId == buildingId && gameState.grid[y][x].isOrigin {
                    return (x, y)
                }
            }
        }
        return nil
    }

    var currentStats: GameStats {
        calculateStats(grid: gameState.grid, currentStudents: gameState.students, currentHappiness: gameState.happiness, gameState: gameState)
    }

    var currentDate: GameDate {
        getGameDate(gameState.day)
    }
}
