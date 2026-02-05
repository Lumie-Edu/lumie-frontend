'use client';

import { useSpreadsheetEditor } from '../model/useSpreadsheetEditor';
import { Grid } from './Grid';
import { ActiveUsersPanel } from './ActiveUsersPanel';
import { useSpreadsheet } from '@/src/entities/spreadsheet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface SpreadsheetEditorProps {
  spreadsheetId: number;
}

export function SpreadsheetEditor({ spreadsheetId }: SpreadsheetEditorProps) {
  const spreadsheet = useSpreadsheet();

  const {
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
  } = useSpreadsheetEditor({ spreadsheetId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">스프레드시트를 불러오는데 실패했습니다.</p>
        <Link href="/admin/spreadsheets">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  if (!spreadsheet) {
    return null;
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/spreadsheets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">{spreadsheet.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <ActiveUsersPanel />
        </div>
      </div>

      {/* Formula bar */}
      <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 border rounded">
        <div className="w-20 px-2 py-1 bg-white border rounded text-sm font-medium text-center">
          {selectedCell || '-'}
        </div>
        <div className="flex-1 px-2 py-1 bg-white border rounded text-sm">
          {selectedCell ? getCellValue(selectedCell) : ''}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0">
        <Grid
          rowCount={spreadsheet.rowCount}
          columnCount={spreadsheet.columnCount}
          cells={cells}
          cellLocks={cellLocks}
          columnWidths={spreadsheet.columnWidths}
          rowHeights={spreadsheet.rowHeights}
          selectedCell={selectedCell}
          editingCell={editingCell}
          onSelectCell={selectCell}
          onStartEdit={startEditing}
          onStopEdit={stopEditing}
          onValueChange={updateCellValue}
        />
      </div>
    </div>
  );
}
