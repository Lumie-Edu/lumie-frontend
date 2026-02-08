'use client';

import { useState } from 'react';
import {
  useAttendanceRecords,
  useUpdateAttendanceStatus,
  useBulkUpdateAttendance,
  type AttendanceRecord,
  type AttendanceStatus,
} from '@/entities/attendance';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: '출석',
  ABSENT: '결석',
  LATE: '지각',
  EXCUSED: '사유',
};

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: 'text-green-600',
  ABSENT: 'text-red-600',
  LATE: 'text-yellow-600',
  EXCUSED: 'text-blue-600',
};

interface AttendanceTableProps {
  sessionId: number;
  isOpen: boolean;
}

export function AttendanceTable({ sessionId, isOpen }: AttendanceTableProps) {
  const { data: records, isLoading } = useAttendanceRecords(sessionId);
  const { mutate: updateStatus } = useUpdateAttendanceStatus(sessionId);
  const { mutate: bulkUpdate, isPending: isBulkUpdating } = useBulkUpdateAttendance(sessionId);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const handleStatusChange = (recordId: number, status: AttendanceStatus) => {
    updateStatus({ recordId, data: { status } });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && records) {
      setSelectedIds(new Set(records.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkUpdate = (status: AttendanceStatus) => {
    if (selectedIds.size === 0) return;
    bulkUpdate(
      { recordIds: Array.from(selectedIds), status },
      { onSuccess: () => setSelectedIds(new Set()) }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">출석 기록이 없습니다.</p>
      </div>
    );
  }

  const allSelected = records.length > 0 && records.every((r) => selectedIds.has(r.id));

  return (
    <div className="space-y-4">
      {/* 일괄 변경 */}
      {isOpen && selectedIds.size > 0 && (
        <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg flex-wrap">
          <span className="text-sm text-muted-foreground">{selectedIds.size}명 선택</span>
          <Button variant="outline" size="sm" onClick={() => handleBulkUpdate('PRESENT')} disabled={isBulkUpdating} className="text-green-600 border-green-600">
            출석
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleBulkUpdate('ABSENT')} disabled={isBulkUpdating} className="text-red-600 border-red-600">
            결석
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleBulkUpdate('LATE')} disabled={isBulkUpdating} className="text-yellow-600 border-yellow-600">
            지각
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleBulkUpdate('EXCUSED')} disabled={isBulkUpdating} className="text-blue-600 border-blue-600">
            사유
          </Button>
        </div>
      )}

      {/* 모바일 카드 뷰 */}
      <div className="space-y-2 smalltablet:hidden">
        {records.map((record) => (
          <div key={record.id} className="rounded-lg border p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isOpen && (
                <Checkbox
                  checked={selectedIds.has(record.id)}
                  onCheckedChange={(checked) => handleSelectOne(record.id, !!checked)}
                />
              )}
              <div>
                <span className="font-medium">{record.studentName}</span>
                {record.checkedAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(record.checkedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    {record.checkMethod === 'CODE' && ' (코드)'}
                  </p>
                )}
              </div>
            </div>
            {isOpen ? (
              <Select value={record.status} onValueChange={(value) => handleStatusChange(record.id, value as AttendanceStatus)}>
                <SelectTrigger className="w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">출석</SelectItem>
                  <SelectItem value="ABSENT">결석</SelectItem>
                  <SelectItem value="LATE">지각</SelectItem>
                  <SelectItem value="EXCUSED">사유</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span className={`font-medium ${STATUS_COLORS[record.status]}`}>
                {STATUS_LABELS[record.status]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 테이블 뷰 */}
      <div className="hidden smalltablet:block rounded-md border">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="text-base">
              {isOpen && (
                <TableHead className="w-[5%] text-center">
                  <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                </TableHead>
              )}
              <TableHead className="text-center">학생명</TableHead>
              <TableHead className="text-center">상태</TableHead>
              <TableHead className="text-center">체크인 방법</TableHead>
              <TableHead className="text-center">체크인 시간</TableHead>
              <TableHead className="text-center hidden tablet:table-cell">메모</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="text-base">
                {isOpen && (
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.has(record.id)}
                      onCheckedChange={(checked) => handleSelectOne(record.id, !!checked)}
                    />
                  </TableCell>
                )}
                <TableCell className="text-center font-medium">{record.studentName}</TableCell>
                <TableCell className="text-center">
                  {isOpen ? (
                    <Select value={record.status} onValueChange={(value) => handleStatusChange(record.id, value as AttendanceStatus)}>
                      <SelectTrigger className="w-[90px] mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRESENT">출석</SelectItem>
                        <SelectItem value="ABSENT">결석</SelectItem>
                        <SelectItem value="LATE">지각</SelectItem>
                        <SelectItem value="EXCUSED">사유</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={`font-medium ${STATUS_COLORS[record.status]}`}>
                      {STATUS_LABELS[record.status]}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {record.checkMethod === 'CODE' ? '코드' : '수동'}
                </TableCell>
                <TableCell className="text-center">
                  {record.checkedAt
                    ? new Date(record.checkedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                    : '-'}
                </TableCell>
                <TableCell className="text-center hidden tablet:table-cell truncate">
                  {record.memo || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
