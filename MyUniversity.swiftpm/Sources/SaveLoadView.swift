import SwiftUI

struct SaveLoadView: View {
    @ObservedObject var viewModel: GameViewModel
    @Environment(\.dismiss) var dismiss
    @State private var slots: [SaveSlotInfo?] = [nil, nil, nil]
    @State private var showDeleteConfirm = false
    @State private var deleteSlot: Int? = nil

    var body: some View {
        NavigationStack {
            List {
                Section("存档槽位") {
                    ForEach(1...3, id: \.self) { slot in
                        VStack(alignment: .leading, spacing: 8) {
                            if let info = slots[slot - 1] {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text("槽位 \(slot): \(info.name)")
                                            .font(.headline)
                                        Text("\(info.universityLabel) - 第\(info.day)天")
                                            .font(.caption)
                                            .foregroundColor(.gray)
                                        Text("资金: \(formatMoney(info.money))")
                                            .font(.caption)
                                            .foregroundColor(.green)
                                    }
                                    Spacer()
                                }

                                HStack(spacing: 12) {
                                    Button("保存") {
                                        if viewModel.saveGame(slot: slot) {
                                            refreshSlots()
                                        }
                                    }
                                    .foregroundColor(.blue)

                                    Button("读取") {
                                        if viewModel.loadGame(slot: slot) {
                                            dismiss()
                                        }
                                    }
                                    .foregroundColor(.green)

                                    Button("删除") {
                                        deleteSlot = slot
                                        showDeleteConfirm = true
                                    }
                                    .foregroundColor(.red)
                                }
                                .font(.caption)
                            } else {
                                HStack {
                                    Text("槽位 \(slot): 空")
                                        .foregroundColor(.gray)
                                    Spacer()
                                    Button("保存") {
                                        if viewModel.saveGame(slot: slot) {
                                            refreshSlots()
                                        }
                                    }
                                    .foregroundColor(.blue)
                                    .font(.caption)
                                }
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("存档管理")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("关闭") { dismiss() }
                }
            }
            .alert("确认删除", isPresented: $showDeleteConfirm) {
                Button("删除", role: .destructive) {
                    if let slot = deleteSlot {
                        SaveManager.delete(slot: slot)
                        refreshSlots()
                    }
                }
                Button("取消", role: .cancel) {}
            } message: {
                Text("确定要删除这个存档吗？")
            }
        }
        .onAppear { refreshSlots() }
    }

    func refreshSlots() {
        for i in 1...3 {
            slots[i - 1] = SaveManager.getSlotInfo(slot: i)
        }
    }
}
