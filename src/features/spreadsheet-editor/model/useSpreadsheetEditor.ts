'use client';

import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  useSpreadsheetStore,
  useSpreadsheetDetail,
  getSpreadsheetWebSocketClient,
  type SpreadsheetWebSocketHandlers,
  type CellData,
  type CellLock,
} from '@/src/entities/spreadsheet';
import { storage } from '@/src/shared/lib/storage';

interface UseSpreadsheetEditorOptions {
  spreadsheetId: number;
  onError?: (message: string) => void;
}

export function useSpreadsheetEditor({ spreadsheetId, onError }: UseSpreadsheetEditorOptions) {
  const wsClientRef = useRef(getSpreadsheetWebSocketClient());
  const lockRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    setSpreadsheet,
    updateCell,
    setCellLock,
    removeCellLock,
    clearLocksForUser,
    addActiveUser,
    removeActiveUser,
    setSelectedCell,
    setEditingCell,
    setIsConnected,
    reset,
    selectedCell,
    editingCell,
    cells,
    cellLocks,
  } = useSpreadsheetStore();

  const { data: spreadsheetDetail, isLoading, error } = useSpreadsheetDetail(spreadsheetId);

  // Initialize spreadsheet data
  useEffect(() => {
    if (spreadsheetDetail) {
      setSpreadsheet(spreadsheetDetail);
    }
  }, [spreadsheetDetail, setSpreadsheet]);

  // WebSocket handlers
  const handlers: SpreadsheetWebSocketHandlers = {
    onCellLockAcquired: (lock: CellLock) => {
      setCellLock(lock.cellAddress, lock);
    },
    onCellLockDenied: (cellAddress: string, lockedByUser: string) => {
      toast.error(`셀 ${cellAddress}은(는) ${lockedByUser}에 의해 잠겨있습니다.`);
    },
    onCellUpdated: (cellAddress: string, data: CellData, userId: string, userName: string) => {
      updateCell(cellAddress, data);
    },
    onCellUnlocked: (cellAddress: string, userId: string) => {
      removeCellLock(cellAddress);
    },
    onUserJoined: (userId: string, userName: string) => {
      addActiveUser({
        userId,
        userName,
        color: getUserColor(userId),
        sessionId: '',
      });
      toast.info(`${userName}님이 참여했습니다.`);
    },
    onUserLeft: (userId: string, userName: string) => {
      removeActiveUser(userId);
      clearLocksForUser(userId);
      toast.info(`${userName}님이 나갔습니다.`);
    },
    onError: (message: string) => {
      toast.error(message);
      onError?.(message);
    },
    onConnected: () => {
      setIsConnected(true);
    },
    onDisconnected: () => {
      setIsConnected(false);
    },
  };

  // Connect to WebSocket
  useEffect(() => {
    if (spreadsheetId > 0) {
      wsClientRef.current.subscribeToSpreadsheet(String(spreadsheetId), handlers);
    }

    return () => {
      wsClientRef.current.disconnect();
      reset();
    };
  }, [spreadsheetId]);

  // Lock refresh interval
  useEffect(() => {
    if (editingCell) {
      lockRefreshIntervalRef.current = setInterval(() => {
        wsClientRef.current.refreshCellLock(editingCell);
      }, 20000); // Refresh every 20 seconds (lock TTL is 30s)
    }

    return () => {
      if (lockRefreshIntervalRef.current) {
        clearInterval(lockRefreshIntervalRef.current);
        lockRefreshIntervalRef.current = null;
      }
    };
  }, [editingCell]);

  const selectCell = useCallback((address: string) => {
    setSelectedCell(address);
  }, [setSelectedCell]);

  const startEditing = useCallback((address: string) => {
    const currentUserId = storage.getUserId?.();
    const lock = cellLocks[address];

    // Check if cell is locked by another user
    if (lock && lock.userId !== String(currentUserId)) {
      toast.error(`이 셀은 ${lock.userName}님이 편집 중입니다.`);
      return;
    }

    // Request lock and start editing
    wsClientRef.current.requestCellLock(address);
    setEditingCell(address);
  }, [cellLocks, setEditingCell]);

  const stopEditing = useCallback(() => {
    if (editingCell) {
      wsClientRef.current.releaseCellLock(editingCell);
      setEditingCell(null);
    }
  }, [editingCell, setEditingCell]);

  const updateCellValue = useCallback((address: string, value: string) => {
    const formula = value.startsWith('=') ? value : null;
    const cellValue = formula ? null : value;

    // Optimistic update
    updateCell(address, {
      value: cellValue,
      displayValue: value,
      formula,
    });

    // Send to server via WebSocket
    wsClientRef.current.updateCell(address, cellValue, formula, cells[address]?.style);
  }, [updateCell, cells]);

  const getCellValue = useCallback((address: string): string => {
    const cell = cells[address];
    if (!cell) return '';
    return cell.formula || cell.value || cell.displayValue || '';
  }, [cells]);

  const getCellDisplayValue = useCallback((address: string): string => {
    const cell = cells[address];
    if (!cell) return '';
    return cell.displayValue || cell.value || '';
  }, [cells]);

  const isCellLocked = useCallback((address: string): boolean => {
    const lock = cellLocks[address];
    if (!lock) return false;
    const currentUserId = storage.getUserId?.();
    return lock.userId !== String(currentUserId);
  }, [cellLocks]);

  const getCellLockInfo = useCallback((address: string): CellLock | undefined => {
    return cellLocks[address];
  }, [cellLocks]);

  return {
    isLoading,
    error,
    selectedCell,
    editingCell,
    cells,
    cellLocks,
    selectCell,
    startEditing,
    stopEditing,
    updateCellValue,
    getCellValue,
    getCellDisplayValue,
    isCellLocked,
    getCellLockInfo,
  };
}

// Helper function to generate consistent colors for users
function getUserColor(userId: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9',
  ];
  const hash = Math.abs(hashCode(userId));
  return colors[hash % colors.length];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}
