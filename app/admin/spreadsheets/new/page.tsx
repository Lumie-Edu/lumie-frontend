'use client';

import { CreateSpreadsheetForm } from '@/src/features/spreadsheet-editor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewSpreadsheetPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/spreadsheets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">새 스프레드시트</h1>
          <p className="text-gray-600">새로운 스프레드시트를 만듭니다.</p>
        </div>
      </div>
      <CreateSpreadsheetForm />
    </div>
  );
}
