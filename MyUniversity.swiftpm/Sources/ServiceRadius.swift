import Foundation

enum ServiceRadius {
    static func calculateServiceCoverage(_ grid: inout [[CellData]]) {
        // Clear
        for y in 0..<GRID_SIZE {
            for x in 0..<GRID_SIZE {
                grid[y][x].serviceCoverage = nil
            }
        }

        // Find service buildings
        for y in 0..<GRID_SIZE {
            for x in 0..<GRID_SIZE {
                let cell = grid[y][x]
                guard cell.isOrigin else { continue }
                guard cell.constructionStatus == .completed else { continue }

                guard let def = BUILDINGS[cell.building] else { continue }
                guard let serviceType = def.serviceType, let serviceRadius = def.serviceRadius else { continue }

                let variants = VARIANTS[cell.building]
                let variant = variants?.first(where: { $0.id == cell.variantId })
                let bw = variant?.width ?? def.width
                let bh = variant?.height ?? def.height
                let w = cell.rotation != 0 ? bh : bw
                let h = cell.rotation != 0 ? bw : bh

                let centerX = Double(x) + Double(w) / 2.0
                let centerY = Double(y) + Double(h) / 2.0
                let radius = Double(serviceRadius)

                let minY = max(0, Int(floor(centerY - radius)))
                let maxY = min(GRID_SIZE - 1, Int(ceil(centerY + radius)))
                let minX = max(0, Int(floor(centerX - radius)))
                let maxX = min(GRID_SIZE - 1, Int(ceil(centerX + radius)))

                for ty in minY...maxY {
                    for tx in minX...maxX {
                        let dist = abs(Double(tx) + 0.5 - centerX) + abs(Double(ty) + 0.5 - centerY)
                        if dist <= radius {
                            if grid[ty][tx].serviceCoverage == nil {
                                grid[ty][tx].serviceCoverage = ServiceCoverage()
                            }
                            switch serviceType {
                            case .food: grid[ty][tx].serviceCoverage?.food = true
                            case .study: grid[ty][tx].serviceCoverage?.study = true
                            case .recreation: grid[ty][tx].serviceCoverage?.recreation = true
                            }
                        }
                    }
                }
            }
        }
    }

    static func getBuildingServiceInfo(_ grid: [[CellData]], originX: Int, originY: Int) -> ServiceCoverage {
        let cell = grid[originY][originX]
        guard let def = BUILDINGS[cell.building] else { return ServiceCoverage() }
        let variants = VARIANTS[cell.building]
        let variant = variants?.first(where: { $0.id == cell.variantId })
        let bw = variant?.width ?? def.width
        let bh = variant?.height ?? def.height
        let w = cell.rotation != 0 ? bh : bw
        let h = cell.rotation != 0 ? bw : bh

        var result = ServiceCoverage()
        for dy in 0..<h {
            for dx in 0..<w {
                let ny = originY + dy
                let nx = originX + dx
                guard ny < GRID_SIZE, nx < GRID_SIZE else { continue }
                if let cov = grid[ny][nx].serviceCoverage {
                    if cov.food { result.food = true }
                    if cov.study { result.study = true }
                    if cov.recreation { result.recreation = true }
                }
            }
        }
        return result
    }
}
