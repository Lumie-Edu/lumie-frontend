'use client';

import { use, useEffect, useState } from 'react';
import { GoogleSheetEmbed } from '@/src/features/google-sheet-embed';

interface GoogleSheet {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

const STORAGE_KEY = 'lumie-google-sheets-prototype';

interface Props {
  params: Promise<{ id: string }>;
}

export default function GoogleSheetEmbedPage({ params }: Props) {
  const { id } = use(params);
  const [sheet, setSheet] = useState<GoogleSheet | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const sheets: GoogleSheet[] = raw ? JSON.parse(raw) : [];
      const found = sheets.find((s) => s.id === id);
      if (found) {
        setSheet(found);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
  }, [id]);

  if (notFound) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">스프레드시트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="-m-4 h-[calc(100vh-72px)]">
      <GoogleSheetEmbed sheetUrl={sheet.url} title={sheet.name} />
    </div>
  );
}
