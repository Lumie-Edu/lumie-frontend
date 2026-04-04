'use client';

import { useStudentAttendanceRecords } from '@/entities/attendance';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { formatDate, formatTime } from '@/src/shared/lib/format';

interface AttendanceTabProps {
  studentId: number;
}

const STATUS_CONFIG = {
  PRESENT: { label: '출석', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  ABSENT: { label: '결석', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  LATE: { label: '지각', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  EXCUSED: { label: '인정', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Shield },
} as const;

function SummaryCard({
  label,
  count,
  colorClass,
  icon: Icon,
}: {
  label: string;
  count: number;
  colorClass: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{count}</p>
        </div>
      </div>
    </div>
  );
}

export function AttendanceTab({ studentId }: AttendanceTabProps) {
  const { data: records, isLoading } = useStudentAttendanceRecords(studentId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const attendanceRecords = records ?? [];

  const counts = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    EXCUSED: 0,
  };
  attendanceRecords.forEach((r) => {
    if (r.status in counts) {
      counts[r.status as keyof typeof counts]++;
    }
  });

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="출석" count={counts.PRESENT} colorClass="bg-green-500" icon={CheckCircle} />
        <SummaryCard label="결석" count={counts.ABSENT} colorClass="bg-red-500" icon={XCircle} />
        <SummaryCard label="지각" count={counts.LATE} colorClass="bg-yellow-500" icon={Clock} />
        <SummaryCard label="인정" count={counts.EXCUSED} colorClass="bg-blue-500" icon={Shield} />
      </div>

      {/* 출석 기록 테이블 */}
      {attendanceRecords.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">출석 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">날짜</TableHead>
                  <TableHead className="text-center">세션명</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">체크인 시간</TableHead>
                  <TableHead className="text-center hidden md:table-cell">메모</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => {
                  const statusConfig = STATUS_CONFIG[record.status as keyof typeof STATUS_CONFIG];
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="text-center text-sm">
                        {formatDate(record.sessionDate)}
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium">
                        {record.sessionName}
                      </TableCell>
                      <TableCell className="text-center">
                        {statusConfig && (
                          <Badge variant="outline" className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm hidden sm:table-cell">
                        {record.checkedAt ? formatTime(record.checkedAt) : '-'}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                        {record.memo || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
