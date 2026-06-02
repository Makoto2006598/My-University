
import { GameState } from '../types';

const SAVE_KEY_PREFIX = 'uniCity_v3_slot_';

interface SetupData {
    name: string;
    type1: string;
    type2: string;
}

export interface SaveSlotInfo {
    slot: number;
    name: string;
    day: number;
    money: number;
    timestamp: number;
    universityLabel: string;
}

export const SaveManager = {
    save: (slot: number, gameState: GameState, setupData: SetupData) => {
        try {
            const data = {
                gameState,
                setupData,
                timestamp: Date.now()
            };
            localStorage.setItem(`${SAVE_KEY_PREFIX}${slot}`, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Save failed", e);
            return false;
        }
    },

    load: (slot: number): { gameState: GameState, setupData: any } | null => {
        try {
            const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (data && data.gameState) {
                // Ensure array/object fields exist to prevent crashes on legacy saves
                if (!data.gameState.incomingStudents) data.gameState.incomingStudents = [];
                if (!data.gameState.badges) data.gameState.badges = [];
                if (!data.gameState.studentList) data.gameState.studentList = [];
                if (!data.gameState.faculty) data.gameState.faculty = [];
                if (!data.gameState.colleges) data.gameState.colleges = [];
                if (!data.gameState.financeHistory) data.gameState.financeHistory = [];
                if (!data.gameState.financeSettings) {
                    data.gameState.financeSettings = {
                        tuitionFeePerYear: 10, totalDailyBudget: 100000,
                        allocationWeights: { research: 20, cafeteria: 20, maintenance: 20, student: 20, faculty: 20 }
                    };
                }
                if (!data.gameState.admissionPolicy) {
                    data.gameState.admissionPolicy = { totalTarget: 0, minScore: 500, collegeTargets: {}, lastPlanUpdateYear: 0 };
                }
                if (!data.gameState.publicity) {
                    data.gameState.publicity = { activeCampaigns: [], activeBuffs: [], ministryBonus: 30 };
                }
                if (!data.gameState.liaison) {
                    data.gameState.liaison = { missions: {}, activeMissions: [], cooldowns: {}, grantDaysLeft: 0, grantDailyAmount: 0 };
                }
                return data;
            }
            return null;
        } catch (e) {
            console.error("Load failed", e);
            return null;
        }
    },

    delete: (slot: number) => {
        localStorage.removeItem(`${SAVE_KEY_PREFIX}${slot}`);
    },

    getSlotInfo: (slot: number): SaveSlotInfo | null => {
        try {
            const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slot}`);
            if (!raw) return null;
            const d = JSON.parse(raw);
            return d ? {
                slot,
                name: d.gameState.universityName,
                day: d.gameState.day,
                money: d.gameState.money,
                timestamp: d.timestamp,
                universityLabel: d.gameState.universityLabel || '未知'
            } : null;
        } catch {
            return null;
        }
    },

    getLatestSlot: (): number | null => {
        let latestTime = 0;
        let latestSlot = null;
        [1, 2, 3].forEach(slot => {
            const info = SaveManager.getSlotInfo(slot);
            if (info && info.timestamp > latestTime) {
                latestTime = info.timestamp;
                latestSlot = slot;
            }
        });
        return latestSlot;
    }
};
