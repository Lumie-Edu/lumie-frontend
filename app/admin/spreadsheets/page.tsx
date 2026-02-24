'use client';

import { GoogleSheetList } from '@/src/features/google-sheet-embed';

export default function SpreadsheetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">스프레드시트</h1>
        <p className="text-muted-foreground">
          Google Sheets를 연결하여 Lumie에서 바로 사용하세요.
        </p>
      </div>
      <GoogleSheetList />
    </div>
  );
}
