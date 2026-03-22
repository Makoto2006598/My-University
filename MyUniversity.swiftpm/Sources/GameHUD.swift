import SwiftUI

struct GameHUD: View {
    @ObservedObject var viewModel: GameViewModel

    var body: some View {
        VStack(spacing: 0) {
            // Building selector (when in build mode)
            if viewModel.selectedTab == .build, let tool = viewModel.selectedBuildingType {
                buildingToolbar(tool: tool)
            }

            // Main tab bar
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 4) {
                    // Build tools
                    tabButton(tab: .build, icon: "hammer.fill", label: "建造")
                    tabButton(tab: .overview, icon: "chart.bar.fill", label: "总览")
                    tabButton(tab: .academic, icon: "graduationcap.fill", label: "学院")
                    tabButton(tab: .hr, icon: "person.crop.rectangle.stack.fill", label: "人事")
                    tabButton(tab: .finance, icon: "dollarsign.circle.fill", label: "财务")
                    tabButton(tab: .admissions, icon: "person.badge.plus", label: "招生")
                    tabButton(tab: .publicity, icon: "megaphone.fill", label: "宣传")
                    tabButton(tab: .liaison, icon: "flag.fill", label: "联络")

                    Divider().frame(height: 30)

                    // Quick toggle
                    Button {
                        viewModel.showServiceOverlay.toggle()
                    } label: {
                        VStack(spacing: 2) {
                            Image(systemName: viewModel.showServiceOverlay ? "eye.fill" : "eye.slash.fill")
                                .font(.body)
                            Text("服务")
                                .font(.caption2)
                        }
                        .foregroundColor(viewModel.showServiceOverlay ? .green : .gray)
                        .frame(width: 52, height: 44)
                    }
                }
                .padding(.horizontal, 8)
            }
            .padding(.vertical, 6)
            .background(Color.black.opacity(0.8))
        }
    }

    @ViewBuilder
    private func tabButton(tab: SidebarTab, icon: String, label: String) -> some View {
        Button {
            if viewModel.selectedTab == tab {
                viewModel.selectedTab = nil
                if tab == .build {
                    viewModel.selectedBuildingType = nil
                }
            } else {
                viewModel.selectedTab = tab
                if tab != .build {
                    viewModel.selectedBuildingType = nil
                }
            }
        } label: {
            VStack(spacing: 2) {
                Image(systemName: icon)
                    .font(.body)
                Text(label)
                    .font(.caption2)
            }
            .foregroundColor(viewModel.selectedTab == tab ? .blue : .white)
            .frame(width: 52, height: 44)
            .background(viewModel.selectedTab == tab ? Color.blue.opacity(0.2) : Color.clear)
            .cornerRadius(8)
        }
    }

    @ViewBuilder
    private func buildingToolbar(tool: BuildingType) -> some View {
        HStack(spacing: 8) {
            // Variant selector
            if let variants = VARIANTS[tool], !variants.isEmpty {
                ForEach(Array(variants.enumerated()), id: \.element.id) { idx, variant in
                    Button {
                        viewModel.selectedVariantIndex = idx
                    } label: {
                        VStack(spacing: 2) {
                            Text(variant.label)
                                .font(.caption2)
                            Text(formatMoney(variant.cost))
                                .font(.caption2)
                                .foregroundColor(.green)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(viewModel.selectedVariantIndex == idx ? Color.blue.opacity(0.3) : Color.white.opacity(0.1))
                        .cornerRadius(6)
                        .foregroundColor(.white)
                    }
                }
            }

            Divider().frame(height: 30)

            // Rotate button
            Button {
                viewModel.isRotated.toggle()
            } label: {
                VStack(spacing: 2) {
                    Image(systemName: "rotate.right")
                    Text("旋转")
                        .font(.caption2)
                }
                .foregroundColor(viewModel.isRotated ? .yellow : .white)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.white.opacity(0.1))
                .cornerRadius(6)
            }

            // Cancel
            Button {
                viewModel.selectedBuildingType = nil
                viewModel.selectedTab = nil
            } label: {
                VStack(spacing: 2) {
                    Image(systemName: "xmark")
                    Text("取消")
                        .font(.caption2)
                }
                .foregroundColor(.red)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.white.opacity(0.1))
                .cornerRadius(6)
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background(Color.black.opacity(0.9))
    }
}

// MARK: - Build Panel (shown in side panel when build tab is selected but no tool chosen)
struct BuildPanelView: View {
    @ObservedObject var viewModel: GameViewModel

    private let buildableTypes: [BuildingType] = [
        .road, .schoolGate, .dormitory, .lectureHall,
        .cafeteria, .laboratory, .library, .park, .fence
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                Text("选择建筑")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading)

                ForEach(buildableTypes, id: \.self) { type in
                    let def = BUILDINGS[type]!
                    Button {
                        viewModel.selectedBuildingType = type
                        viewModel.selectedVariantIndex = 0
                        viewModel.isRotated = false
                    } label: {
                        HStack {
                            Text(def.icon)
                                .font(.title2)
                                .frame(width: 40)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(def.name)
                                    .font(.subheadline.bold())
                                HStack {
                                    Text(formatMoney(def.cost))
                                        .foregroundColor(.green)
                                    if def.capacity > 0 {
                                        Text("容量:\(def.capacity)")
                                            .foregroundColor(.cyan)
                                    }
                                }
                                .font(.caption)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.gray)
                        }
                        .padding(10)
                        .background(Color.white.opacity(0.08))
                        .cornerRadius(10)
                        .foregroundColor(.white)
                    }
                }
            }
            .padding()
        }
    }
}
