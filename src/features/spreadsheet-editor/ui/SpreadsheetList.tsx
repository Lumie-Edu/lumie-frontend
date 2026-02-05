'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, Edit, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useSpreadsheets,
  useDeleteSpreadsheet,
  type Spreadsheet,
} from '@/src/entities/spreadsheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const PAGE_SIZE = 20;

export function SpreadsheetList() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Spreadsheet | null>(null);

  const { data, isLoading, error } = useSpreadsheets({
    page: currentPage,
    size: PAGE_SIZE,
    sort: 'createdAt,desc',
  });

  const { mutate: deleteSpreadsheet, isPending: isDeleting } = useDeleteSpreadsheet();

  const handleDelete = () => {
    if (deleteTarget) {
      deleteSpreadsheet(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">스프레드시트 목록을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  const spreadsheets = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          총 {data?.totalElements || 0}개의 스프레드시트
        </div>
        <Link href="/admin/spreadsheets/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 스프레드시트
          </Button>
        </Link>
      </div>

      {/* List */}
      {spreadsheets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed">
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">등록된 스프레드시트가 없습니다.</p>
          <Link href="/admin/spreadsheets/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              첫 스프레드시트 만들기
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  크기
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  권한
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {spreadsheets.map((spreadsheet) => (
                <tr
                  key={spreadsheet.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/spreadsheets/${spreadsheet.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileSpreadsheet className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {spreadsheet.name}
                        </div>
                        {spreadsheet.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {spreadsheet.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {spreadsheet.rowCount} x {spreadsheet.columnCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        spreadsheet.permission === 'PRIVATE'
                          ? 'bg-gray-100 text-gray-800'
                          : spreadsheet.permission === 'VIEW_ONLY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {spreadsheet.permission === 'PRIVATE'
                        ? '비공개'
                        : spreadsheet.permission === 'VIEW_ONLY'
                        ? '읽기 전용'
                        : '편집 가능'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(spreadsheet.createdAt), 'yyyy.MM.dd', { locale: ko })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/spreadsheets/${spreadsheet.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(spreadsheet)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            이전
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            다음
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>스프레드시트 삭제</DialogTitle>
            <DialogDescription>
              &quot;{deleteTarget?.name}&quot; 스프레드시트를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
