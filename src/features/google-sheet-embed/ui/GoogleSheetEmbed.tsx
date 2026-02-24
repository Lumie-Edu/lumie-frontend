'use client';

import { useState } from 'react';
import { ArrowLeft, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface GoogleSheetEmbedProps {
  sheetUrl: string;
  title: string;
}

function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

function buildEmbedUrl(sheetId: string): string {
  const params = new URLSearchParams({
    rm: 'minimal',
    single: 'true',
    widget: 'true',
    headers: 'false',
    chrome: 'false',
  });
  return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?embedded=true&${params.toString()}`;
}

export function GoogleSheetEmbed({ sheetUrl, title }: GoogleSheetEmbedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sheetId = extractSheetId(sheetUrl);

  if (!sheetId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">유효하지 않은 Google Sheets URL입니다.</p>
        <Link href="/admin/spreadsheets">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  const embedUrl = buildEmbedUrl(sheetId);

  return (
    <div
      className={`flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-[100] bg-background'
          : 'h-full'
      }`}
    >
      {/* Custom Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 border-b bg-background">
        <div className="flex items-center gap-2">
          <Link href="/admin/spreadsheets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              목록
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm font-semibold truncate max-w-md">{title}</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? '축소' : '전체화면'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <a href={sheetUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 relative min-h-0">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-sm text-muted-foreground">스프레드시트 로딩 중...</p>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          allow="clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
          title={title}
        />
      </div>
    </div>
  );
}
