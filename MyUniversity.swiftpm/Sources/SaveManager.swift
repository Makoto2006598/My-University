import Foundation

struct SaveSlotInfo: Identifiable {
    var id: Int { slot }
    var slot: Int
    var name: String
    var day: Int
    var money: Double
    var timestamp: Double
    var universityLabel: String
}

struct SaveData: Codable {
    var gameState: GameState
    var setupName: String
    var setupType1: UniType1
    var setupType2: UniType2
    var timestamp: Double
}

enum SaveManager {
    private static let prefix = "uniCity_v3_slot_"

    static func save(slot: Int, gameState: GameState, name: String, type1: UniType1, type2: UniType2) -> Bool {
        let data = SaveData(gameState: gameState, setupName: name, setupType1: type1, setupType2: type2, timestamp: Date().timeIntervalSince1970)
        do {
            let encoded = try JSONEncoder().encode(data)
            UserDefaults.standard.set(encoded, forKey: "\(prefix)\(slot)")
            return true
        } catch {
            print("Save failed: \(error)")
            return false
        }
    }

    static func load(slot: Int) -> SaveData? {
        guard let data = UserDefaults.standard.data(forKey: "\(prefix)\(slot)") else { return nil }
        do {
            var saveData = try JSONDecoder().decode(SaveData.self, from: data)
            // Migration
            if saveData.gameState.publicity.ministryBonus == 0 {
                saveData.gameState.publicity.ministryBonus = 30
            }
            return saveData
        } catch {
            print("Load failed: \(error)")
            return nil
        }
    }

    static func delete(slot: Int) {
        UserDefaults.standard.removeObject(forKey: "\(prefix)\(slot)")
    }

    static func getSlotInfo(slot: Int) -> SaveSlotInfo? {
        guard let saveData = load(slot: slot) else { return nil }
        return SaveSlotInfo(
            slot: slot,
            name: saveData.gameState.universityName,
            day: saveData.gameState.day,
            money: saveData.gameState.money,
            timestamp: saveData.timestamp,
            universityLabel: saveData.gameState.universityLabel
        )
    }

    static func getLatestSlot() -> Int? {
        var latestTime: Double = 0
        var latestSlot: Int?
        for slot in 1...3 {
            if let info = getSlotInfo(slot: slot), info.timestamp > latestTime {
                latestTime = info.timestamp
                latestSlot = slot
            }
        }
        return latestSlot
    }
}
