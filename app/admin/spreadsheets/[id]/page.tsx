'use client';

import { use } from 'react';
import { SpreadsheetEditor } from '@/src/features/spreadsheet-editor';

interface SpreadsheetEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function SpreadsheetEditorPage({ params }: SpreadsheetEditorPageProps) {
  const { id } = use(params);
  const spreadsheetId = parseInt(id, 10);

  if (isNaN(spreadsheetId)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">잘못된 스프레드시트 ID입니다.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <SpreadsheetEditor spreadsheetId={spreadsheetId} />
    </div>
  );
}
