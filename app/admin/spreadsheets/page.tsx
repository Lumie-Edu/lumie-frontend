'use client';

import { SpreadsheetList } from '@/src/features/spreadsheet-editor';

export default function SpreadsheetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">스프레드시트</h1>
        <p className="text-gray-600">실시간 협업 스프레드시트를 관리합니다.</p>
      </div>
      <SpreadsheetList />
    </div>
  );
}
