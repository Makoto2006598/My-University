
import { GameState } from '../types';

const SAVE_KEY_PREFIX = 'uniCity_v3_slot_';

export interface SaveSlotInfo {
    slot: number;
    name: string;
    day: number;
    money: number;
    timestamp: number;
    universityLabel: string;
}

export const SaveManager = {
    save: (slot: number, gameState: GameState, setupData: any) => {
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
                // Ensure array fields exist to prevent crashes on legacy saves
                if (!data.gameState.incomingStudents) data.gameState.incomingStudents = [];
                if (!data.gameState.badges) data.gameState.badges = [];
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
