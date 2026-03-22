import SwiftUI

struct CampusGridView: View {
    @ObservedObject var viewModel: GameViewModel
    @State private var offset: CGSize = .zero
    @State private var scale: CGFloat = 1.0
    @State private var lastScale: CGFloat = 1.0
    @State private var dragStart: CGPoint? = nil

    private let cellSize: CGFloat = 14

    var body: some View {
        GeometryReader { geo in
            let totalSize = CGFloat(GRID_SIZE) * cellSize

            ZStack {
                // Background
                Color(red: 0.15, green: 0.2, blue: 0.15)

                // Grid Canvas
                Canvas { context, size in
                    let tx = size.width / 2 + offset.width
                    let ty = size.height / 2 + offset.height

                    for y in 0..<GRID_SIZE {
                        for x in 0..<GRID_SIZE {
                            let cell = viewModel.gameState.grid[y][x]
                            let rect = CGRect(
                                x: tx + CGFloat(x) * cellSize * scale - totalSize * scale / 2,
                                y: ty + CGFloat(y) * cellSize * scale - totalSize * scale / 2,
                                width: cellSize * scale,
                                height: cellSize * scale
                            )

                            // Only draw visible cells
                            guard rect.maxX >= 0, rect.minX <= size.width,
                                  rect.maxY >= 0, rect.minY <= size.height else { continue }

                            let color = cellColor(cell)
                            context.fill(Path(rect), with: .color(color))

                            // Zoned overlay
                            if cell.isZoned && cell.building == .none {
                                context.fill(Path(rect), with: .color(.green.opacity(0.08)))
                            }

                            // Service overlay
                            if viewModel.showServiceOverlay, let cov = cell.serviceCoverage {
                                var overlayColor = Color.clear
                                if cov.food { overlayColor = .orange.opacity(0.2) }
                                if cov.study { overlayColor = .blue.opacity(0.2) }
                                if cov.recreation { overlayColor = .green.opacity(0.2) }
                                if overlayColor != .clear {
                                    context.fill(Path(rect), with: .color(overlayColor))
                                }
                            }

                            // Grid lines
                            context.stroke(Path(rect), with: .color(.white.opacity(0.05)), lineWidth: 0.5)

                            // Building icon for origin cells
                            if cell.isOrigin, let def = BUILDINGS[cell.building], !def.icon.isEmpty {
                                let iconRect = CGRect(
                                    x: rect.midX - 5 * scale,
                                    y: rect.midY - 5 * scale,
                                    width: 10 * scale,
                                    height: 10 * scale
                                )
                                context.draw(Text(def.icon).font(.system(size: 8 * scale)), in: iconRect)
                            }

                            // Construction indicator
                            if cell.isOrigin && cell.constructionStatus == .constructing {
                                let indicatorRect = CGRect(x: rect.minX, y: rect.minY, width: 4 * scale, height: 4 * scale)
                                context.fill(Path(indicatorRect), with: .color(.yellow))
                            }

                            // Disconnected warning
                            if cell.isOrigin && cell.building != .none && cell.building != .road && cell.building != .cityRoad && cell.building != .park && cell.building != .fence {
                                if let def = BUILDINGS[cell.building], def.requiresRoadConnection {
                                    // Check connectivity
                                    let variants = VARIANTS[cell.building]
                                    let variant = variants?.first(where: { $0.id == cell.variantId })
                                    let bw = variant?.width ?? def.width
                                    let bh = variant?.height ?? def.height
                                    let w = cell.rotation != 0 ? bh : bw
                                    let h = cell.rotation != 0 ? bw : bh

                                    var isConnected = false
                                    for dy2 in 0..<h {
                                        for dx2 in 0..<w {
                                            if dy2 > 0 && dy2 < h - 1 && dx2 > 0 && dx2 < w - 1 { continue }
                                            let adjCells = [
                                                (cell.x + dx2, cell.y + dy2 - 1),
                                                (cell.x + dx2, cell.y + dy2 + 1),
                                                (cell.x + dx2 - 1, cell.y + dy2),
                                                (cell.x + dx2 + 1, cell.y + dy2)
                                            ]
                                            for (ax, ay) in adjCells {
                                                guard ax >= 0, ax < GRID_SIZE, ay >= 0, ay < GRID_SIZE else { continue }
                                                if ax >= cell.x && ax < cell.x + w && ay >= cell.y && ay < cell.y + h { continue }
                                                if viewModel.gameState.grid[ay][ax].isConnectedToCampus == true {
                                                    isConnected = true
                                                }
                                            }
                                        }
                                    }

                                    if !isConnected {
                                        context.fill(Path(CGRect(x: rect.maxX - 4 * scale, y: rect.minY, width: 4 * scale, height: 4 * scale)), with: .color(.red))
                                    }
                                }
                            }
                        }
                    }

                    // Selected building highlight
                    if let origin = viewModel.selectedCellOrigin {
                        let cell = viewModel.gameState.grid[origin.y][origin.x]
                        if let def = BUILDINGS[cell.building] {
                            let variants = VARIANTS[cell.building]
                            let variant = variants?.first(where: { $0.id == cell.variantId })
                            let bw = variant?.width ?? def.width
                            let bh = variant?.height ?? def.height
                            let w = cell.rotation != 0 ? bh : bw
                            let h = cell.rotation != 0 ? bw : bh
                            let selRect = CGRect(
                                x: tx + CGFloat(origin.x) * cellSize * scale - totalSize * scale / 2,
                                y: ty + CGFloat(origin.y) * cellSize * scale - totalSize * scale / 2,
                                width: CGFloat(w) * cellSize * scale,
                                height: CGFloat(h) * cellSize * scale
                            )
                            context.stroke(Path(selRect), with: .color(.yellow), lineWidth: 2)
                        }
                    }
                }
                .gesture(
                    SimultaneousGesture(
                        DragGesture()
                            .onChanged { value in
                                if viewModel.selectedBuildingType == nil {
                                    offset = CGSize(
                                        width: offset.width + value.translation.width - (dragStart?.x ?? 0),
                                        height: offset.height + value.translation.height - (dragStart?.y ?? 0)
                                    )
                                    dragStart = CGPoint(x: value.translation.width, y: value.translation.height)
                                }
                            }
                            .onEnded { _ in dragStart = nil },
                        MagnificationGesture()
                            .onChanged { value in
                                scale = max(0.3, min(4.0, lastScale * value))
                            }
                            .onEnded { value in
                                lastScale = scale
                            }
                    )
                )
                .onTapGesture { location in
                    handleTap(location: location, in: geo.size)
                }
            }
            .clipped()

            // Building Inspector overlay
            if let origin = viewModel.selectedCellOrigin {
                VStack {
                    Spacer()
                    BuildingInspectorView(viewModel: viewModel, origin: origin)
                        .padding()
                }
            }
        }
    }

    private func handleTap(location: CGPoint, in size: CGSize) {
        let totalSize = CGFloat(GRID_SIZE) * cellSize
        let tx = size.width / 2 + offset.width
        let ty = size.height / 2 + offset.height

        let gridX = Int((location.x - tx + totalSize * scale / 2) / (cellSize * scale))
        let gridY = Int((location.y - ty + totalSize * scale / 2) / (cellSize * scale))

        guard gridX >= 0, gridX < GRID_SIZE, gridY >= 0, gridY < GRID_SIZE else { return }

        if let tool = viewModel.selectedBuildingType {
            if tool == .road {
                viewModel.placeRoad(path: [(gridX, gridY)])
            } else {
                viewModel.placeBuilding(x: gridX, y: gridY)
            }
        } else {
            // Select building
            let cell = viewModel.gameState.grid[gridY][gridX]
            if cell.building != .none && cell.building != .cityRoad {
                if let bid = cell.buildingId {
                    if let origin = viewModel.findBuildingOrigin(bid) {
                        viewModel.selectedCellOrigin = origin
                    }
                }
            } else {
                viewModel.selectedCellOrigin = nil
            }
        }
    }

    private func cellColor(_ cell: CellData) -> Color {
        switch cell.building {
        case .none:
            return cell.isZoned ? Color(red: 0.2, green: 0.25, blue: 0.2) : Color(red: 0.15, green: 0.2, blue: 0.15)
        case .road:
            if cell.isConnectedToCampus == false {
                return Color(red: 0.5, green: 0.2, blue: 0.2) // Disconnected
            }
            return Color(red: 0.35, green: 0.35, blue: 0.35)
        case .cityRoad:
            return Color(red: 0.3, green: 0.3, blue: 0.32)
        case .schoolGate:
            return Color.orange.opacity(0.8)
        case .dormitory:
            return cell.constructionStatus == .completed ? Color(red: 0.85, green: 0.65, blue: 0.2) : Color.yellow.opacity(0.3)
        case .lectureHall:
            return cell.constructionStatus == .completed ? Color.blue.opacity(0.7) : Color.blue.opacity(0.3)
        case .cafeteria:
            return cell.constructionStatus == .completed ? Color(red: 0.9, green: 0.3, blue: 0.3) : Color.red.opacity(0.3)
        case .laboratory:
            return cell.constructionStatus == .completed ? Color.purple.opacity(0.7) : Color.purple.opacity(0.3)
        case .library:
            return cell.constructionStatus == .completed ? Color.teal.opacity(0.7) : Color.teal.opacity(0.3)
        case .park:
            return Color.green.opacity(cell.constructionStatus == .completed ? 0.6 : 0.3)
        case .fence:
            return Color(red: 0.25, green: 0.25, blue: 0.25)
        }
    }
}

// MARK: - Building Inspector
struct BuildingInspectorView: View {
    @ObservedObject var viewModel: GameViewModel
    let origin: (x: Int, y: Int)

    var body: some View {
        let cell = viewModel.gameState.grid[origin.y][origin.x]
        guard let def = BUILDINGS[cell.building] else { return AnyView(EmptyView()) }
        let variants = VARIANTS[cell.building]
        let variant = variants?.first(where: { $0.id == cell.variantId })

        return AnyView(
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("\(def.icon) \(cell.customName ?? def.name)")
                        .font(.headline)
                        .foregroundColor(.white)

                    Spacer()

                    Button {
                        viewModel.selectedCellOrigin = nil
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                    }
                }

                if let variant = variant {
                    Text(variant.label)
                        .font(.caption)
                        .foregroundColor(.gray)
                }

                if cell.constructionStatus == .constructing {
                    HStack {
                        Image(systemName: "hammer.fill")
                            .foregroundColor(.yellow)
                        Text("建设中 - 剩余\(cell.constructionLeft ?? 0)天")
                            .foregroundColor(.yellow)
                    }
                    .font(.caption)
                }

                HStack(spacing: 16) {
                    if (variant?.capacity ?? def.capacity) > 0 {
                        Label("\(variant?.capacity ?? def.capacity)", systemImage: "person.fill")
                            .font(.caption)
                            .foregroundColor(.cyan)
                    }
                    Label("\(formatMoney(variant?.maintenance ?? def.maintenance))/月", systemImage: "wrench.fill")
                        .font(.caption)
                        .foregroundColor(.orange)
                    if (variant?.revenue ?? def.revenue) > 0 {
                        Label("\(formatMoney(variant?.revenue ?? def.revenue))/月", systemImage: "dollarsign.circle")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                }

                // Service coverage info
                let svcInfo = ServiceRadius.getBuildingServiceInfo(viewModel.gameState.grid, originX: origin.x, originY: origin.y)
                if cell.building == .dormitory {
                    HStack(spacing: 8) {
                        Label(svcInfo.food ? "已覆盖" : "未覆盖", systemImage: "fork.knife")
                            .foregroundColor(svcInfo.food ? .green : .red)
                        Label(svcInfo.study ? "已覆盖" : "未覆盖", systemImage: "book.fill")
                            .foregroundColor(svcInfo.study ? .green : .red)
                        Label(svcInfo.recreation ? "已覆盖" : "未覆盖", systemImage: "leaf.fill")
                            .foregroundColor(svcInfo.recreation ? .green : .red)
                    }
                    .font(.caption2)
                }

                // Actions
                HStack {
                    if let bid = cell.buildingId, cell.building != .cityRoad {
                        Button("拆除") {
                            viewModel.removeBuilding(buildingId: bid)
                        }
                        .foregroundColor(.red)
                        .font(.caption)
                    }
                }
            }
            .padding(12)
            .background(Color.black.opacity(0.85))
            .cornerRadius(12)
            .frame(maxWidth: 350)
        )
    }
}
