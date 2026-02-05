'use client';

import { create } from 'zustand';
import type {
  SpreadsheetDetail,
  CellData,
  CellLock,
  ActiveUser,
} from './schema';

interface SpreadsheetState {
  // Data
  spreadsheet: SpreadsheetDetail | null;
  cells: Record<string, CellData>;
  cellLocks: Record<string, CellLock>;
  activeUsers: ActiveUser[];

  // UI State
  selectedCell: string | null;
  editingCell: string | null;
  isConnected: boolean;

  // Actions
  setSpreadsheet: (spreadsheet: SpreadsheetDetail) => void;
  updateCell: (address: string, data: Partial<CellData>) => void;
  setCells: (cells: Record<string, CellData>) => void;

  setCellLock: (address: string, lock: CellLock) => void;
  removeCellLock: (address: string) => void;
  clearLocksForUser: (userId: string) => void;

  setActiveUsers: (users: ActiveUser[]) => void;
  addActiveUser: (user: ActiveUser) => void;
  removeActiveUser: (userId: string) => void;

  setSelectedCell: (address: string | null) => void;
  setEditingCell: (address: string | null) => void;
  setIsConnected: (connected: boolean) => void;

  reset: () => void;
}

const initialState = {
  spreadsheet: null as SpreadsheetDetail | null,
  cells: {} as Record<string, CellData>,
  cellLocks: {} as Record<string, CellLock>,
  activeUsers: [] as ActiveUser[],
  selectedCell: null as string | null,
  editingCell: null as string | null,
  isConnected: false,
};

export const useSpreadsheetStore = create<SpreadsheetState>()((set, get) => ({
  ...initialState,

  setSpreadsheet: (spreadsheet) =>
    set({
      spreadsheet,
      cells: spreadsheet.cells || {},
    }),

  updateCell: (address, data) =>
    set((state) => ({
      cells: {
        ...state.cells,
        [address]: {
          ...state.cells[address],
          ...data,
        },
      },
    })),

  setCells: (cells) =>
    set({ cells }),

  setCellLock: (address, lock) =>
    set((state) => ({
      cellLocks: {
        ...state.cellLocks,
        [address]: lock,
      },
    })),

  removeCellLock: (address) =>
    set((state) => {
      const { [address]: _, ...rest } = state.cellLocks;
      return { cellLocks: rest };
    }),

  clearLocksForUser: (userId) =>
    set((state) => {
      const newLocks: Record<string, CellLock> = {};
      Object.entries(state.cellLocks).forEach(([addr, lock]) => {
        if (lock.userId !== userId) {
          newLocks[addr] = lock;
        }
      });
      return { cellLocks: newLocks };
    }),

  setActiveUsers: (users) =>
    set({ activeUsers: users }),

  addActiveUser: (user) =>
    set((state) => {
      const exists = state.activeUsers.some((u) => u.userId === user.userId);
      if (exists) return state;
      return { activeUsers: [...state.activeUsers, user] };
    }),

  removeActiveUser: (userId) =>
    set((state) => ({
      activeUsers: state.activeUsers.filter((u) => u.userId !== userId),
    })),

  setSelectedCell: (address) =>
    set({ selectedCell: address }),

  setEditingCell: (address) =>
    set({ editingCell: address }),

  setIsConnected: (connected) =>
    set({ isConnected: connected }),

  reset: () => set(initialState),
}));

// Selector hooks for optimized re-renders
export const useSpreadsheet = () => useSpreadsheetStore((state) => state.spreadsheet);
export const useCells = () => useSpreadsheetStore((state) => state.cells);
export const useCellLocks = () => useSpreadsheetStore((state) => state.cellLocks);
export const useActiveUsers = () => useSpreadsheetStore((state) => state.activeUsers);
export const useSelectedCell = () => useSpreadsheetStore((state) => state.selectedCell);
export const useEditingCell = () => useSpreadsheetStore((state) => state.editingCell);
export const useIsConnected = () => useSpreadsheetStore((state) => state.isConnected);

export const useCell = (address: string) =>
  useSpreadsheetStore((state) => state.cells[address]);

export const useCellLock = (address: string) =>
  useSpreadsheetStore((state) => state.cellLocks[address]);
