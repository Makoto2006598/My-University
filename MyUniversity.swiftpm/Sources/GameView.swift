import SwiftUI

struct GameView: View {
    @ObservedObject var viewModel: GameViewModel
    var onExit: () -> Void
    @State private var showSaveLoad = false
    @State private var showSettings = false

    var body: some View {
        ZStack {
            Color(red: 0.08, green: 0.1, blue: 0.15).ignoresSafeArea()

            VStack(spacing: 0) {
                // Top Bar
                TopBarView(viewModel: viewModel, onSave: { showSaveLoad = true }, onExit: onExit)

                // Main Content
                HStack(spacing: 0) {
                    // Campus Grid
                    CampusGridView(viewModel: viewModel)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)

                    // Side Panel
                    if let tab = viewModel.selectedTab, tab != .build {
                        SidePanelView(viewModel: viewModel, tab: tab)
                            .frame(width: 360)
                            .transition(.move(edge: .trailing))
                    }
                }

                // Bottom HUD
                GameHUD(viewModel: viewModel)
            }
        }
        .alert("提示", isPresented: $viewModel.showAlert) {
            Button("确定", role: .cancel) {}
        } message: {
            Text(viewModel.alertMessage)
        }
        .alert("预算确认", isPresented: $viewModel.showBudgetAlert) {
            Button("确认预算") { viewModel.confirmBudget() }
        } message: {
            Text("新月份开始，请确认本月预算分配。")
        }
        .sheet(isPresented: $showSaveLoad) {
            SaveLoadView(viewModel: viewModel)
        }
    }
}

// MARK: - Top Bar
struct TopBarView: View {
    @ObservedObject var viewModel: GameViewModel
    var onSave: () -> Void
    var onExit: () -> Void

    var body: some View {
        let date = viewModel.currentDate
        let stats = viewModel.currentStats

        HStack(spacing: 16) {
            // University Name
            VStack(alignment: .leading, spacing: 2) {
                Text(viewModel.gameState.universityName)
                    .font(.headline)
                    .foregroundColor(.white)
                Text("\(viewModel.gameState.rank.rawValue) | \(viewModel.gameState.universityLabel)")
                    .font(.caption)
                    .foregroundColor(.gray)
            }

            Divider().frame(height: 30)

            // Date
            VStack(alignment: .leading, spacing: 2) {
                Text("\(date.seasonEmoji) \(date.dateString)")
                    .font(.subheadline)
                    .foregroundColor(.white)
                Text(date.semesterString)
                    .font(.caption)
                    .foregroundColor(.gray)
            }

            Divider().frame(height: 30)

            // Money
            VStack(alignment: .leading, spacing: 2) {
                Text("💰 \(formatMoney(viewModel.gameState.money))")
                    .font(.subheadline.bold())
                    .foregroundColor(stats.netIncome >= 0 ? .green : .red)
                Text("日净收入: \(formatMoney(stats.netIncome))")
                    .font(.caption)
                    .foregroundColor(.gray)
            }

            Divider().frame(height: 30)

            // Students
            HStack(spacing: 12) {
                Label("\(viewModel.gameState.students)", systemImage: "person.3.fill")
                    .font(.caption)
                    .foregroundColor(.cyan)
                Label("\(Int(viewModel.gameState.happiness))", systemImage: "face.smiling")
                    .font(.caption)
                    .foregroundColor(.yellow)
            }

            Spacer()

            // Speed Controls
            HStack(spacing: 4) {
                ForEach([0, 1, 2, 3], id: \.self) { speed in
                    Button {
                        viewModel.setSpeed(speed)
                    } label: {
                        Group {
                            if speed == 0 {
                                Image(systemName: "pause.fill")
                            } else {
                                Text("\(speed)x")
                            }
                        }
                        .font(.caption.bold())
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(viewModel.gameSpeed == speed ? Color.blue : Color.white.opacity(0.1))
                        .foregroundColor(.white)
                        .cornerRadius(6)
                    }
                }
            }

            // Save & Exit
            Button(action: onSave) {
                Image(systemName: "square.and.arrow.down")
                    .foregroundColor(.white)
            }
            Button(action: onExit) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .foregroundColor(.red)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Color.black.opacity(0.6))
    }
}
