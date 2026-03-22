import Foundation

// MARK: - Money Formatting
func formatMoney(_ amount: Double) -> String {
    let abs = Swift.abs(amount)
    if abs >= 1_000_000 { return String(format: "%.2fM", amount / 1_000_000) }
    if abs >= 1000 { return String(format: "%.1fK", amount / 1000) }
    return String(format: "%.0f", amount)
}

// MARK: - Game Date
private let gameStartTimestamp: TimeInterval = {
    var cal = Calendar(identifier: .gregorian)
    cal.timeZone = TimeZone(identifier: "UTC")!
    let components = DateComponents(year: 2026, month: 2, day: 1)
    return cal.date(from: components)!.timeIntervalSince1970
}()

func getGameDate(_ day: Int) -> GameDate {
    let timestamp = gameStartTimestamp + Double(day - 1) * 86400
    let date = Date(timeIntervalSince1970: timestamp)
    var cal = Calendar(identifier: .gregorian)
    cal.timeZone = TimeZone(identifier: "UTC")!
    let year = cal.component(.year, from: date)
    let month = cal.component(.month, from: date)
    let dayOfMonth = cal.component(.day, from: date)

    let isSem1 = month >= 9 || month == 1
    let semester = isSem1 ? 1 : 2

    let season: String
    let seasonEmoji: String
    if month >= 3 && month <= 5 { season = "春"; seasonEmoji = "🌱" }
    else if month >= 6 && month <= 8 { season = "夏"; seasonEmoji = "☀️" }
    else if month >= 9 && month <= 11 { season = "秋"; seasonEmoji = "🍂" }
    else { season = "冬"; seasonEmoji = "❄️" }

    let dateString = "\(year)年\(String(format: "%02d", month))月\(String(format: "%02d", dayOfMonth))日"
    let semesterString = "\(year)年 第\(semester)学期"

    return GameDate(year: year, month: month, date: dayOfMonth, dateString: dateString,
                    semester: semester, semesterString: semesterString,
                    season: season, seasonEmoji: seasonEmoji)
}

// MARK: - Initial Grid
func createInitialGrid() -> [[CellData]] {
    var grid = (0..<GRID_SIZE).map { y in
        (0..<GRID_SIZE).map { x in
            var building: BuildingType = .none
            let isOuterRim = x == 0 || x == GRID_SIZE - 1 || y == 0 || y == GRID_SIZE - 1
            if isOuterRim {
                let mid = GRID_SIZE / 2
                if (x > mid - 5 && x < mid + 5) || (y > mid - 5 && y < mid + 5) || Double.random(in: 0...1) > 0.4 {
                    building = .cityRoad
                }
            }
            let status: ConstructionStatus? = building == .cityRoad ? .completed : nil
            return CellData(x: x, y: y, building: building, constructionStatus: status)
        }
    }
    RoadNetwork.updateRoadNetwork(&grid)
    calculateZones(&grid)
    return grid
}

// MARK: - University Label
func getUniversityLabel(_ colleges: [ActiveCollege]) -> String {
    if colleges.isEmpty { return "未定性" }
    let types = Set(colleges.map { $0.type })

    if types.count == 1 && types.contains(.medicine) { return "医科大学" }
    if types.count == 1 && types.contains(.lang) { return "外国语大学" }
    if types.count == 1 && types.contains(.law) { return "政法大学" }

    let finTypes: Set<CollegeType> = [.trade, .econ, .arts]
    if types.isSubset(of: finTypes) && (types.contains(.trade) || types.contains(.econ)) { return "财经大学" }

    let newEng: Set<CollegeType> = [.cs, .ic, .robotics]
    let tradEng: Set<CollegeType> = [.civil, .arch, .mech, .elec]
    let allEng = newEng.union(tradEng)
    let hasArts = types.contains(.arts)

    if types.isSubset(of: newEng.union([.science])) && !types.isEmpty && !hasArts { return "电子科技大学" }
    if types.isSubset(of: allEng.union([.science])) && !types.isEmpty && !hasArts { return "理工大学" }

    return "综合性大学"
}

// MARK: - Scale & Rank
func calculateScale(_ students: Int, _ campusCount: Int) -> UniversityScale {
    if students <= 6000 { return .academy }
    if students <= 10000 { return .small }
    if students <= 15000 { return .medium }
    if students <= 25000 { return .large }
    if students > 25000 && campusCount >= 2 { return .mega }
    return .large
}

func calculateRank(_ state: GameState) -> (rank: UniversityRank, cap: Int) {
    let soc = state.socialRecognition
    let min = state.ministryRecognition
    let scale = state.scale

    if soc > 1000 && min > 2000 && (scale == .large || scale == .mega) { return (.project985, 999999) }
    if soc > 800 && min > 1000 && (scale == .large || scale == .mega) { return (.project211, 999999) }
    if soc > 400 && min > 400 && (scale == .medium || scale == .large || scale == .mega) { return (.tier1, 25000) }
    if soc > 300 && min > 300 && scale != .academy && scale != .small { return (.tier2, 15000) }
    if soc > 100 && min > 100 && scale != .academy { return (.tier3, 10000) }
    return (.startup, 6000)
}

// MARK: - Daily Income
func calculateDailyIncome(_ state: GameState) -> Double {
    let j = state.ministryRecognition
    var base: Double = 0

    if state.uniType1 == .publicUni {
        switch state.rank {
        case .startup: base = 300000 * (max(1, j) / 30)
        case .tier3: base = 1_000_000 * (max(1, j) / 150)
        case .tier2: base = 2_000_000 * (max(1, j) / 200)
        case .tier1: base = 4_000_000 * (max(1, j) / 500)
        case .project211: base = 8_000_000 * (max(1, j) / 1000)
        case .project985: base = 10_000_000 * (max(1, j) / 1500)
        }
    } else {
        switch state.rank {
        case .startup: base = 100000 * (max(1, j) / 30)
        case .tier3: base = 300000 * (max(1, j) / 150)
        case .tier2: base = 600000 * (max(1, j) / 200)
        case .tier1: base = 1_200_000 * (max(1, j) / 500)
        case .project211: base = 2_500_000 * (max(1, j) / 1000)
        case .project985: base = 3_500_000 * (max(1, j) / 1500)
        }
    }

    if state.badges.contains("市重点") { base += 200000 }
    if state.badges.contains("省重点") { base += 2_000_000 }
    if state.badges.contains("国家重点") { base += 4_000_000 }

    if let penaltyEnd = state.ministryPenaltyEndDay, state.day <= penaltyEnd {
        base = base * 0.75
    }

    return floor(base)
}

// MARK: - Stats Calculation
func calculateStats(grid: [[CellData]], currentStudents: Int, currentHappiness: Double, gameState: GameState) -> GameStats {
    var stats = GameStats()
    var maintenanceRequiredMonthly: Double = 0
    var buildingRevenueMonthly: Double = 0
    var capacity = 0
    var happyPoints: Double = 0
    var buildingCount = 0
    var hasGate = false
    var labCount = 0
    var lectureHallCount = 0
    var libraryCount = 0
    var disconnectedCount = 0
    var serviceCoverageBonus: Double = 0

    let currentDate = getGameDate(gameState.day)
    var cal = Calendar(identifier: .gregorian)
    cal.timeZone = TimeZone(identifier: "UTC")!
    let prepEnd = cal.date(from: DateComponents(year: 2027, month: 9, day: 1))!
    let currentGameDate = Date(timeIntervalSince1970: 1738368000 + Double(gameState.day - 1) * 86400) // 2026-02-01
    let isPrepPeriod = currentGameDate < prepEnd

    for row in grid {
        for cell in row {
            if cell.building == .none || cell.building == .fence { continue }
            if cell.building == .schoolGate { hasGate = true }

            let isFunctional = cell.constructionStatus == .completed || cell.building == .cityRoad || cell.building == .road
            if !isFunctional { continue }

            if let _ = cell.buildingId, cell.isOrigin {
                let def = BUILDINGS[cell.building]!
                let variants = VARIANTS[cell.building]
                let variant = variants?.first(where: { $0.id == cell.variantId })

                let statCapacity = variant?.capacity ?? def.capacity
                let statRevenue = variant?.revenue ?? def.revenue
                let statMaintenance = variant?.maintenance ?? def.maintenance
                let statHappiness = variant?.happiness ?? def.happiness

                let needsRoad = def.requiresRoadConnection
                let bw = variant?.width ?? def.width
                let bh = variant?.height ?? def.height
                let w = cell.rotation != 0 ? bh : bw
                let h = cell.rotation != 0 ? bw : bh

                var isConnected = !needsRoad
                if !isConnected {
                    outerLoop: for dy2 in 0..<h {
                        for dx2 in 0..<w {
                            if dy2 > 0 && dy2 < h - 1 && dx2 > 0 && dx2 < w - 1 { continue }
                            let adjCells = [
                                (cell.x + dx2, cell.y + dy2 - 1),
                                (cell.x + dx2, cell.y + dy2 + 1),
                                (cell.x + dx2 - 1, cell.y + dy2),
                                (cell.x + dx2 + 1, cell.y + dy2)
                            ]
                            for (ax, ay) in adjCells {
                                if ax < 0 || ax >= GRID_SIZE || ay < 0 || ay >= GRID_SIZE { continue }
                                if ax >= cell.x && ax < cell.x + w && ay >= cell.y && ay < cell.y + h { continue }
                                if grid[ay][ax].isConnectedToCampus == true {
                                    isConnected = true
                                    break outerLoop
                                }
                            }
                        }
                    }
                }

                if cell.building != .road && cell.building != .cityRoad && cell.building != .park {
                    buildingCount += 1
                    if !isConnected { disconnectedCount += 1 }
                }
                if cell.building == .laboratory { labCount += 1 }
                if cell.building == .lectureHall { lectureHallCount += 1 }
                if cell.building == .library { libraryCount += 1 }

                if isConnected && cell.constructionStatus == .completed {
                    if let cov = cell.serviceCoverage {
                        if cell.building == .dormitory {
                            if cov.food { serviceCoverageBonus += 5 }
                            if cov.study { serviceCoverageBonus += 3 }
                            if cov.recreation { serviceCoverageBonus += 3 }
                            if !cov.food && !cov.study && !cov.recreation { serviceCoverageBonus -= 8 }
                        }
                        if cell.building == .lectureHall {
                            if cov.food { serviceCoverageBonus += 2 }
                            if cov.recreation { serviceCoverageBonus += 1 }
                        }
                    }
                }

                if isConnected {
                    capacity += statCapacity
                    buildingRevenueMonthly += statRevenue
                }
                maintenanceRequiredMonthly += statMaintenance
                happyPoints += statHappiness
            } else if cell.buildingId == nil {
                let def = BUILDINGS[cell.building]!
                maintenanceRequiredMonthly += def.maintenance
                buildingRevenueMonthly += def.revenue
            }
        }
    }

    let fs = gameState.financeSettings
    let totalDailyBudget = fs.totalDailyBudget
    let w = fs.allocationWeights

    let maintenanceAllocated = totalDailyBudget * w.ratio(for: w.maintenance)
    var maintenanceCostActual = maintenanceAllocated
    var isMaintenanceFree = false
    if maintenanceRequiredMonthly == 0 { maintenanceCostActual = 0; isMaintenanceFree = true }

    let researchAllocated = totalDailyBudget * w.ratio(for: w.research)
    let cafeteriaAllocated = totalDailyBudget * w.ratio(for: w.cafeteria)
    let studentAllocated = totalDailyBudget * w.ratio(for: w.student)
    let facultyAllocated = totalDailyBudget * w.ratio(for: w.faculty)

    let salaryRequiredMonthly = gameState.faculty.reduce(0.0) { $0 + $1.salary }
    let salaryRequiredDaily = salaryRequiredMonthly / 30

    let totalExpense = researchAllocated + cafeteriaAllocated + studentAllocated + facultyAllocated + maintenanceCostActual + salaryRequiredDaily
    let annualizedTuition = (Double(currentStudents) * fs.tuitionFeePerYear * 1000) / 365
    let isOperational = currentStudents > 0 && !gameState.faculty.isEmpty
    let potentialDailyGrant = calculateDailyIncome(gameState)
    let dailyGrant: Double
    if isOperational {
        dailyGrant = potentialDailyGrant
    } else if isPrepPeriod && gameState.uniType1 == .publicUni {
        dailyGrant = potentialDailyGrant * 0.5
    } else {
        dailyGrant = 0
    }

    let buildingRevenueDaily = buildingRevenueMonthly / 30
    let totalRevenue = buildingRevenueDaily + dailyGrant + annualizedTuition
    let netIncome = totalRevenue - totalExpense
    let maintenanceRatio = maintenanceRequiredMonthly > 0 ? (maintenanceAllocated * 30) / maintenanceRequiredMonthly : 1.0

    // Happiness
    var envHappiness = buildingCount > 0 ? happyPoints / Double(buildingCount) : 0
    let svcBonus = buildingCount > 0 ? serviceCoverageBonus / Double(buildingCount) : 0

    if disconnectedCount > 0 {
        let penalty = -min(15, Double(disconnectedCount) * 3)
        envHappiness += penalty
    }

    var sHapp = 50.0 + envHappiness + svcBonus
    if fs.tuitionFeePerYear > 20 { sHapp -= (fs.tuitionFeePerYear - 20) * 0.5 }
    if maintenanceRatio < 0.8 { sHapp -= 10 }
    if cafeteriaAllocated > Double(currentStudents) * 5 { sHapp += 5 }
    if studentAllocated > Double(currentStudents) * 2 { sHapp += 5 }
    let studentSatisfaction = min(100, max(0, sHapp))

    var fHapp = 50.0 + envHappiness + svcBonus
    if maintenanceRatio < 0.8 { fHapp -= 5 }
    if salaryRequiredDaily > 0 && facultyAllocated < salaryRequiredDaily * 0.8 { fHapp -= 10 }
    if researchAllocated > 5000 { fHapp += 3 }
    let facultySatisfaction = min(100, max(0, fHapp))

    var avgHappiness: Double
    if currentStudents == 0 && gameState.faculty.isEmpty {
        avgHappiness = 50
    } else {
        avgHappiness = (studentSatisfaction * Double(max(1, currentStudents)) + facultySatisfaction * Double(max(1, gameState.faculty.count))) / Double(max(1, currentStudents) + max(1, gameState.faculty.count))
    }

    let researchScore = (Double(labCount) * 10 + Double(lectureHallCount) * 2) * (researchAllocated > 1000 ? 1 : 0.5)
    let socialRecognition = floor(Double(currentStudents) * (avgHappiness / 100) + Double(buildingCount) * 2 + researchScore)
    let infraScore = Double(labCount) * 50 + Double(lectureHallCount) * 20 + Double(libraryCount) * 100
    let ministryRecognition = floor(infraScore)

    stats.maintenanceRequiredMonthly = maintenanceRequiredMonthly
    stats.maintenanceAllocated = maintenanceAllocated
    stats.maintenanceRatio = maintenanceRatio
    stats.salaryRequiredDaily = salaryRequiredDaily
    stats.facultyAllocated = facultyAllocated
    stats.researchAllocated = researchAllocated
    stats.cafeteriaAllocated = cafeteriaAllocated
    stats.studentAllocated = studentAllocated
    stats.buildingRevenueDaily = buildingRevenueDaily
    stats.potentialDailyGrant = potentialDailyGrant
    stats.dailyGrant = dailyGrant
    stats.totalRevenue = totalRevenue
    stats.totalExpense = totalExpense
    stats.netIncome = netIncome
    stats.capacity = capacity
    stats.happiness = avgHappiness
    stats.studentSatisfaction = studentSatisfaction
    stats.facultySatisfaction = facultySatisfaction
    stats.hasGate = hasGate
    stats.buildingCount = buildingCount
    stats.socialRecognition = socialRecognition
    stats.ministryRecognition = ministryRecognition
    stats.labCount = labCount
    stats.lectureHallCount = lectureHallCount
    stats.isOperational = isOperational
    stats.annualizedTuition = annualizedTuition
    stats.maintenanceCostActual = maintenanceCostActual
    stats.isMaintenanceFree = isMaintenanceFree
    stats.isPrepPeriod = isPrepPeriod

    return stats
}

// MARK: - Zone Calculation
func calculateZones(_ grid: inout [[CellData]]) {
    for y in 0..<GRID_SIZE {
        for x in 0..<GRID_SIZE {
            if grid[y][x].building == .none {
                grid[y][x].isZoned = false
            }
        }
    }
    let zoneRadius = 3
    for y in 0..<GRID_SIZE {
        for x in 0..<GRID_SIZE {
            let cell = grid[y][x]
            let isValidRoad = (cell.building == .road || cell.building == .cityRoad || cell.building == .schoolGate)
                && cell.isConnectedToCampus != false
            if isValidRoad {
                for dy in -zoneRadius...zoneRadius {
                    for dx in -zoneRadius...zoneRadius {
                        let ny = y + dy, nx = x + dx
                        if ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE && grid[ny][nx].building == .none {
                            grid[ny][nx].isZoned = true
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Full Grid Update
func updateFullGrid(_ grid: inout [[CellData]]) {
    RoadNetwork.updateRoadNetwork(&grid)
    calculateZones(&grid)
    ServiceRadius.calculateServiceCoverage(&grid)
}
