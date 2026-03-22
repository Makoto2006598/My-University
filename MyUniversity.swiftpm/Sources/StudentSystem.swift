import Foundation

func getStudentTags(gaokaoScore: Int, talent: Int, effort: Int, wealth: Int) -> [String] {
    var tags: [String] = []

    if gaokaoScore <= 450 { tags.append("差等生") }
    else if gaokaoScore <= 550 { tags.append("普通生") }
    else if gaokaoScore <= 600 { tags.append("良好生") }
    else if gaokaoScore <= 650 { tags.append("优等生") }
    else { tags.append("天才生") }

    if talent <= 30 { tags.append("迟钝") }
    else if talent <= 60 { tags.append("常人") }
    else if talent <= 80 { tags.append("聪明") }
    else if talent <= 95 { tags.append("人才") }
    else { tags.append("天才") }

    if effort <= 30 { tags.append("懒惰") }
    else if effort <= 70 { tags.append("碌碌") }
    else { tags.append("勤奋") }

    if wealth <= 30 { tags.append("贫穷") }
    else if wealth <= 60 { tags.append("小康") }
    else if wealth <= 90 { tags.append("优渥") }
    else { tags.append("富豪") }

    return tags
}

func generateSingleStudent(targetCollege: CollegeType, minScore: Int) -> Student {
    let gender: Gender = Bool.random() ? .male : .female
    let name = generateName()

    let baseScore = Double(minScore)
    let bonus = Double.random(in: 0...Double(750 - minScore))
    let bias = pow(Double.random(in: 0...1), 2)
    var gaokaoScore = Int(baseScore + bonus * (1 - bias))
    gaokaoScore = min(750, max(0, gaokaoScore))

    let wealth = Int.random(in: 0...100)
    let scoreRatio = Double(gaokaoScore) / 750.0
    let minTalent = Int(scoreRatio * 40)
    let talent = min(100, minTalent + Int.random(in: 0...59))
    let effort = Int.random(in: 0...99)

    let tags = getStudentTags(gaokaoScore: gaokaoScore, talent: talent, effort: effort, wealth: wealth)

    return Student(
        id: generateId(), name: name, gender: gender,
        gaokaoScore: gaokaoScore, talent: talent, effort: effort, wealth: wealth,
        tags: tags, satisfaction: 80, college: targetCollege
    )
}

func generateDailyStudents(policy: AdmissionPolicy, colleges: [ActiveCollege], currentIncomingCount: Int, happinessModifier: Double = 1) -> [Student] {
    let totalTarget = policy.totalTarget
    guard totalTarget > 0, !colleges.isEmpty else { return [] }

    let baseDailyQuota = Int(ceil(Double(totalTarget) / 20.0))
    let dailyQuota = max(1, Int(round(Double(baseDailyQuota) * happinessModifier)))
    let remainingNeeded = totalTarget - currentIncomingCount
    let countToGen = min(dailyQuota, remainingNeeded)
    guard countToGen > 0 else { return [] }

    var newStudents: [Student] = []

    for _ in 0..<countToGen {
        var randomPoint = Double.random(in: 0..<Double(totalTarget))
        var selectedCollegeType: CollegeType = colleges[0].type

        var cumulative: Double = 0
        for (type, count) in policy.collegeTargets {
            cumulative += Double(count)
            if randomPoint <= cumulative {
                if let ct = CollegeType(rawValue: type) {
                    selectedCollegeType = ct
                }
                break
            }
        }

        let scoreBonus = Int((happinessModifier - 1) * 30)
        let adjustedMinScore = max(300, min(700, policy.minScore + scoreBonus))
        newStudents.append(generateSingleStudent(targetCollege: selectedCollegeType, minScore: adjustedMinScore))
    }

    return newStudents
}
