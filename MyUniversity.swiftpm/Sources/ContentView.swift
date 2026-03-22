import SwiftUI

enum AppScreen {
    case mainMenu
    case setup
    case game
}

struct ContentView: View {
    @State private var screen: AppScreen = .mainMenu
    @StateObject private var viewModelHolder = ViewModelHolder()
    @State private var setupName = ""
    @State private var setupType1: UniType1 = .publicUni
    @State private var setupType2: UniType2 = .research

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            switch screen {
            case .mainMenu:
                MainMenuView(
                    onNewGame: { screen = .setup },
                    onLoadGame: { slot in
                        let vm = GameViewModel(name: "", type1: .publicUni, type2: .research)
                        if vm.loadGame(slot: slot) {
                            viewModelHolder.viewModel = vm
                            screen = .game
                        }
                    }
                )

            case .setup:
                SetupView(
                    name: $setupName,
                    type1: $setupType1,
                    type2: $setupType2,
                    onStart: {
                        if setupName.isEmpty { setupName = "新建大学" }
                        let vm = GameViewModel(name: setupName, type1: setupType1, type2: setupType2)
                        viewModelHolder.viewModel = vm
                        screen = .game
                    },
                    onBack: { screen = .mainMenu }
                )

            case .game:
                if let vm = viewModelHolder.viewModel {
                    GameView(viewModel: vm, onExit: {
                        vm.stopGameLoop()
                        viewModelHolder.viewModel = nil
                        screen = .mainMenu
                    })
                }
            }
        }
        .preferredColorScheme(.dark)
    }
}

class ViewModelHolder: ObservableObject {
    @Published var viewModel: GameViewModel?
}

// MARK: - Main Menu
struct MainMenuView: View {
    var onNewGame: () -> Void
    var onLoadGame: (Int) -> Void
    @State private var slots: [SaveSlotInfo?] = [nil, nil, nil]

    var body: some View {
        VStack(spacing: 30) {
            Spacer()

            Text("🎓")
                .font(.system(size: 80))

            Text("我的大学")
                .font(.system(size: 48, weight: .bold))
                .foregroundColor(.white)

            Text("大学模拟经营游戏")
                .font(.title3)
                .foregroundColor(.gray)

            Spacer()

            Button(action: onNewGame) {
                Label("新建大学", systemImage: "plus.circle.fill")
                    .font(.title2.bold())
                    .frame(maxWidth: 300)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(16)
            }

            VStack(spacing: 12) {
                ForEach(0..<3, id: \.self) { i in
                    if let info = slots[i] {
                        Button {
                            onLoadGame(i + 1)
                        } label: {
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(info.name)
                                        .font(.headline)
                                    Text("\(info.universityLabel) - 第\(info.day)天 - \(formatMoney(info.money))")
                                        .font(.caption)
                                        .foregroundColor(.gray)
                                }
                                Spacer()
                                Image(systemName: "play.circle.fill")
                                    .font(.title2)
                            }
                            .padding()
                            .background(Color.white.opacity(0.1))
                            .cornerRadius(12)
                            .foregroundColor(.white)
                        }
                        .frame(maxWidth: 400)
                    }
                }
            }

            Spacer()
        }
        .padding()
        .onAppear {
            for i in 1...3 {
                slots[i - 1] = SaveManager.getSlotInfo(slot: i)
            }
        }
    }
}

// MARK: - Setup View
struct SetupView: View {
    @Binding var name: String
    @Binding var type1: UniType1
    @Binding var type2: UniType2
    var onStart: () -> Void
    var onBack: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            HStack {
                Button(action: onBack) {
                    Label("返回", systemImage: "chevron.left")
                        .foregroundColor(.blue)
                }
                Spacer()
            }

            Text("创建你的大学")
                .font(.largeTitle.bold())
                .foregroundColor(.white)

            VStack(alignment: .leading, spacing: 8) {
                Text("大学名称")
                    .foregroundColor(.gray)
                TextField("输入大学名称", text: $name)
                    .textFieldStyle(.roundedBorder)
                    .font(.title3)
            }
            .frame(maxWidth: 400)

            VStack(alignment: .leading, spacing: 8) {
                Text("办学性质")
                    .foregroundColor(.gray)
                Picker("", selection: $type1) {
                    Text("公立大学").tag(UniType1.publicUni)
                    Text("民办大学").tag(UniType1.privateUni)
                }
                .pickerStyle(.segmented)
            }
            .frame(maxWidth: 400)

            VStack(alignment: .leading, spacing: 8) {
                Text("办学类型")
                    .foregroundColor(.gray)
                Picker("", selection: $type2) {
                    Text("研究型").tag(UniType2.research)
                    Text("研究应用型").tag(UniType2.appliedResearch)
                }
                .pickerStyle(.segmented)
            }
            .frame(maxWidth: 400)

            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("初始资金")
                        .foregroundColor(.gray)
                        .font(.caption)
                    Text(type1 == .publicUni ? "2亿" : "10亿")
                        .font(.title2.bold())
                        .foregroundColor(.green)
                }
                .padding()
                .background(Color.white.opacity(0.05))
                .cornerRadius(12)

                VStack(alignment: .leading, spacing: 4) {
                    Text("政府拨款")
                        .foregroundColor(.gray)
                        .font(.caption)
                    Text(type1 == .publicUni ? "高" : "低")
                        .font(.title2.bold())
                        .foregroundColor(type1 == .publicUni ? .green : .orange)
                }
                .padding()
                .background(Color.white.opacity(0.05))
                .cornerRadius(12)
            }

            Spacer()

            Button(action: onStart) {
                Text("开始建设")
                    .font(.title2.bold())
                    .frame(maxWidth: 300)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(16)
            }
        }
        .padding(32)
    }
}
