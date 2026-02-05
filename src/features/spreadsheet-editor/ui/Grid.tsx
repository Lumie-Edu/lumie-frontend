'use client';

import { useMemo, useCallback } from 'react';
import { Cell } from './Cell';
import type { CellData, CellLock } from '@/src/entities/spreadsheet';
import { storage } from '@/src/shared/lib/storage';

interface GridProps {
  rowCount: number;
  columnCount: number;
  cells: Record<string, CellData>;
  cellLocks: Record<string, CellLock>;
  columnWidths?: Record<string, number>;
  rowHeights?: Record<string, number>;
  selectedCell: string | null;
  editingCell: string | null;
  onSelectCell: (address: string) => void;
  onStartEdit: (address: string) => void;
  onStopEdit: () => void;
  onValueChange: (address: string, value: string) => void;
}

const DEFAULT_COLUMN_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 24;
const HEADER_WIDTH = 50;
const HEADER_HEIGHT = 28;

export function Grid({
  rowCount,
  columnCount,
  cells,
  cellLocks,
  columnWidths = {},
  rowHeights = {},
  selectedCell,
  editingCell,
  onSelectCell,
  onStartEdit,
  onStopEdit,
  onValueChange,
}: GridProps) {
  const currentUserId = storage.getUserId?.();

  // Generate column headers (A, B, C, ..., Z, AA, AB, ...)
  const columns = useMemo(() => {
    const cols: string[] = [];
    for (let i = 0; i < columnCount; i++) {
      cols.push(getColumnLabel(i));
    }
    return cols;
  }, [columnCount]);

  // Generate row numbers
  const rows = useMemo(() => {
    return Array.from({ length: rowCount }, (_, i) => i + 1);
  }, [rowCount]);

  const getColumnWidth = useCallback((col: string) => {
    return columnWidths[col] || DEFAULT_COLUMN_WIDTH;
  }, [columnWidths]);

  const getRowHeight = useCallback((row: number) => {
    return rowHeights[String(row)] || DEFAULT_ROW_HEIGHT;
  }, [rowHeights]);

  const isLockedByOther = useCallback((address: string) => {
    const lock = cellLocks[address];
    if (!lock) return false;
    return lock.userId !== String(currentUserId);
  }, [cellLocks, currentUserId]);

  return (
    <div className="overflow-auto border border-gray-300 rounded-md">
      <div className="inline-block min-w-full">
        {/* Column Headers */}
        <div className="flex sticky top-0 z-20 bg-gray-100">
          {/* Corner cell */}
          <div
            className="sticky left-0 z-30 bg-gray-200 border-b border-r border-gray-300 flex items-center justify-center font-medium text-gray-600"
            style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT }}
          />
          {/* Column labels */}
          {columns.map((col) => (
            <div
              key={col}
              className="bg-gray-100 border-b border-r border-gray-300 flex items-center justify-center font-medium text-gray-700 text-sm"
              style={{ width: getColumnWidth(col), height: HEADER_HEIGHT }}
            >
              {col}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {rows.map((rowNum) => (
          <div key={rowNum} className="flex">
            {/* Row header */}
            <div
              className="sticky left-0 z-10 bg-gray-100 border-b border-r border-gray-300 flex items-center justify-center font-medium text-gray-700 text-sm"
              style={{ width: HEADER_WIDTH, height: getRowHeight(rowNum) }}
            >
              {rowNum}
            </div>
            {/* Cells */}
            {columns.map((col) => {
              const address = `${col}${rowNum}`;
              return (
                <Cell
                  key={address}
                  address={address}
                  data={cells[address]}
                  lock={cellLocks[address]}
                  isSelected={selectedCell === address}
                  isEditing={editingCell === address}
                  isLockedByOther={isLockedByOther(address)}
                  width={getColumnWidth(col)}
                  height={getRowHeight(rowNum)}
                  onSelect={onSelectCell}
                  onStartEdit={onStartEdit}
                  onStopEdit={onStopEdit}
                  onValueChange={onValueChange}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to convert column index to label (0 -> A, 25 -> Z, 26 -> AA)
function getColumnLabel(index: number): string {
  let label = '';
  let num = index;
  while (num >= 0) {
    label = String.fromCharCode((num % 26) + 65) + label;
    num = Math.floor(num / 26) - 1;
  }
  return label;
}
