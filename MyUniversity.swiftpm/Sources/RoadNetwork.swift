import Foundation

enum RoadNetwork {
    static func isRoadCell(_ cell: CellData) -> Bool {
        cell.building == .road || cell.building == .cityRoad
    }

    static func isCampusEntrance(_ cell: CellData) -> Bool {
        cell.building == .cityRoad || cell.building == .schoolGate
    }

    // MARK: - Road Connections
    static func getRoadConnections(_ grid: [[CellData]], _ x: Int, _ y: Int) -> RoadConnections {
        func check(_ nx: Int, _ ny: Int) -> Bool {
            guard nx >= 0, nx < GRID_SIZE, ny >= 0, ny < GRID_SIZE else { return false }
            let c = grid[ny][nx]
            return isRoadCell(c) || c.building == .schoolGate
        }
        return RoadConnections(
            north: check(x, y - 1),
            south: check(x, y + 1),
            east: check(x + 1, y),
            west: check(x - 1, y)
        )
    }

    // MARK: - Road Shape
    static func deriveRoadShape(_ conn: RoadConnections) -> RoadShape {
        let dirs = [conn.north, conn.south, conn.east, conn.west]
        let count = dirs.filter { $0 }.count

        if count == 0 { return .isolated }
        if count == 1 {
            if conn.north { return .deadEndN }
            if conn.south { return .deadEndS }
            if conn.east { return .deadEndE }
            return .deadEndW
        }
        if count == 2 {
            if conn.north && conn.south { return .straightV }
            if conn.east && conn.west { return .straightH }
            if conn.north && conn.east { return .cornerNE }
            if conn.north && conn.west { return .cornerNW }
            if conn.south && conn.east { return .cornerSE }
            return .cornerSW
        }
        if count == 3 {
            if !conn.north { return .tSouth }
            if !conn.south { return .tNorth }
            if !conn.east { return .tWest }
            return .tEast
        }
        return .cross
    }

    // MARK: - Calculate Road Shapes
    static func calculateRoadShapes(_ grid: inout [[CellData]]) {
        for y in 0..<GRID_SIZE {
            for x in 0..<GRID_SIZE {
                if isRoadCell(grid[y][x]) {
                    let conn = getRoadConnections(grid, x, y)
                    grid[y][x].roadConnections = conn
                    grid[y][x].roadShape = deriveRoadShape(conn)
                } else {
                    grid[y][x].roadConnections = nil
                    grid[y][x].roadShape = nil
                }
            }
        }
    }

    // MARK: - BFS Connectivity
    static func calculateRoadConnectivity(_ grid: inout [[CellData]]) {
        var queue: [(Int, Int)] = []
        var visited = [Bool](repeating: false, count: GRID_SIZE * GRID_SIZE)

        for y in 0..<GRID_SIZE {
            for x in 0..<GRID_SIZE {
                grid[y][x].isConnectedToCampus = nil
                if isCampusEntrance(grid[y][x]) {
                    let idx = y * GRID_SIZE + x
                    if !visited[idx] {
                        visited[idx] = true
                        queue.append((x, y))
                        grid[y][x].isConnectedToCampus = true
                    }
                }
            }
        }

        var head = 0
        while head < queue.count {
            let (cx, cy) = queue[head]
            head += 1
            let neighbors = [(cx, cy - 1), (cx, cy + 1), (cx - 1, cy), (cx + 1, cy)]
            for (nx, ny) in neighbors {
                guard nx >= 0, nx < GRID_SIZE, ny >= 0, ny < GRID_SIZE else { continue }
                let idx = ny * GRID_SIZE + nx
                if visited[idx] { continue }
                let neighbor = grid[ny][nx]
                if isRoadCell(neighbor) || neighbor.building == .schoolGate {
                    visited[idx] = true
                    grid[ny][nx].isConnectedToCampus = true
                    queue.append((nx, ny))
                }
            }
        }

        for y in 0..<GRID_SIZE {
            for x in 0..<GRID_SIZE {
                if isRoadCell(grid[y][x]) && grid[y][x].isConnectedToCampus != true {
                    grid[y][x].isConnectedToCampus = false
                }
            }
        }
    }

    // MARK: - Check Road Adjacency
    static func checkConnectedRoadAdjacency(_ grid: [[CellData]], x: Int, y: Int, width: Int, height: Int) -> (valid: Bool, reason: String?) {
        var hasAdjacentRoad = false
        var hasConnectedRoad = false

        for dy in 0..<height {
            for dx in 0..<width {
                let dirs = [(0, -1), (0, 1), (-1, 0), (1, 0)]
                for (ddx, ddy) in dirs {
                    let nx = x + dx + ddx
                    let ny = y + dy + ddy
                    guard nx >= 0, nx < GRID_SIZE, ny >= 0, ny < GRID_SIZE else { continue }
                    if nx >= x && nx < x + width && ny >= y && ny < y + height { continue }
                    let neighbor = grid[ny][nx]
                    if isRoadCell(neighbor) || neighbor.building == .schoolGate {
                        hasAdjacentRoad = true
                        if neighbor.isConnectedToCampus == true {
                            hasConnectedRoad = true
                        }
                    }
                }
            }
        }

        if !hasAdjacentRoad { return (false, "需要紧邻道路") }
        if !hasConnectedRoad { return (false, "道路未连通校门") }
        return (true, nil)
    }

    // MARK: - Update Road Network
    static func updateRoadNetwork(_ grid: inout [[CellData]]) {
        calculateRoadShapes(&grid)
        calculateRoadConnectivity(&grid)
    }
}
