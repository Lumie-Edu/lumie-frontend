'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ExternalLink, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageListHeader } from '@/src/shared/ui/PageListHeader';
import { EmptyState } from '@/src/shared/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GoogleSheet {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

const STORAGE_KEY = 'lumie-google-sheets-prototype';

function loadSheets(): GoogleSheet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSheets(sheets: GoogleSheet[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
}

export function GoogleSheetList() {
  const router = useRouter();
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GoogleSheet | null>(null);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    setSheets(loadSheets());
  }, []);

  const validateUrl = (url: string): boolean => {
    const pattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/;
    return pattern.test(url);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    if (!validateUrl(newUrl)) {
      setUrlError('유효한 Google Sheets URL을 입력해주세요.');
      return;
    }

    const sheet: GoogleSheet = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      url: newUrl.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [sheet, ...sheets];
    setSheets(updated);
    saveSheets(updated);
    setIsAddOpen(false);
    setNewName('');
    setNewUrl('');
    setUrlError('');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const updated = sheets.filter((s) => s.id !== deleteTarget.id);
    setSheets(updated);
    saveSheets(updated);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageListHeader title="스프레드시트" count={sheets.length} countUnit="개">
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          스프레드시트 연결
        </Button>
      </PageListHeader>

      {/* List */}
      {sheets.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          message="연결된 스프레드시트가 없습니다."
          description="Google Sheets URL을 추가하여 시작하세요."
          actionLabel="첫 스프레드시트 연결하기"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  추가일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {sheets.map((sheet) => (
                <tr
                  key={sheet.id}
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() =>
                    router.push(
                      `/admin/spreadsheets/${sheet.id}`
                    )
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileSpreadsheet className="w-5 h-5 text-green-600 mr-3 shrink-0" />
                      <span className="text-sm font-medium">{sheet.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground truncate max-w-xs block">
                      {sheet.url.replace('https://docs.google.com/spreadsheets/d/', '').slice(0, 20)}...
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(sheet.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div
                      className="flex justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={sheet.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(sheet)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Google 스프레드시트 연결</DialogTitle>
            <DialogDescription>
              Google Sheets의 공유 URL을 입력하여 Lumie에서 바로 사용하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sheet-name">이름</Label>
              <Input
                id="sheet-name"
                placeholder="예: 2024 매출 현황"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sheet-url">Google Sheets URL</Label>
              <Input
                id="sheet-url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  setUrlError('');
                }}
              />
              {urlError && <p className="text-sm text-destructive">{urlError}</p>}
              <p className="text-xs text-muted-foreground">
                Google Sheets에서 &quot;공유&quot; → &quot;링크가 있는 모든 사용자&quot;로 설정해주세요.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAdd} disabled={!newName.trim() || !newUrl.trim()}>
              연결
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>스프레드시트 연결 해제</DialogTitle>
            <DialogDescription>
              &quot;{deleteTarget?.name}&quot; 연결을 해제하시겠습니까?
              Google Sheets 원본은 삭제되지 않습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              연결 해제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
