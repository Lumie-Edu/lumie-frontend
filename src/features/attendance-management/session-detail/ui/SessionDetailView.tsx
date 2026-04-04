'use client';

import { useRouter } from 'next/navigation';
import { useAttendanceSession, useCloseSession, useDeleteSession } from '@/entities/attendance';
import { useBreadcrumb } from '@/src/shared/lib/breadcrumb';
import { PageListHeader } from '@/src/shared/ui/PageListHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { XCircle, Trash2 } from 'lucide-react';
import { SessionCodeDisplay } from './SessionCodeDisplay';
import { AttendanceStatisticsBar } from './AttendanceStatisticsBar';
import { AttendanceTable } from './AttendanceTable';

interface SessionDetailViewProps {
  sessionId: number;
}

export function SessionDetailView({ sessionId }: SessionDetailViewProps) {
  const router = useRouter();
  const { data: session, isLoading, error } = useAttendanceSession(sessionId);
  const { mutate: closeSession } = useCloseSession();
  const { mutate: deleteSession } = useDeleteSession();

  useBreadcrumb([
    { label: '출석 관리', href: '/admin/attendance' },
    { label: session?.name ?? '' },
  ]);

  const handleClose = () => {
    if (confirm('세션을 종료하시겠습니까?')) {
      closeSession(sessionId);
    }
  };

  const handleDelete = () => {
    if (confirm('세션을 삭제하시겠습니까? 관련 출석 기록도 모두 삭제됩니다.')) {
      deleteSession(sessionId, {
        onSuccess: () => router.push('/admin/attendance'),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">세션 정보를 불러오는 중 오류가 발생했습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/attendance')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  const isOpen = session.status === 'OPEN';

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <PageListHeader title={session.name}>
        {isOpen && (
          <Button variant="outline" onClick={handleClose} className="text-orange-600 border-orange-600">
            <XCircle className="w-4 h-4 mr-2" />
            세션 종료
          </Button>
        )}
        <Button variant="outline" onClick={handleDelete} className="text-red-600 border-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          삭제
        </Button>
      </PageListHeader>

      {/* 출석 코드 + 통계 */}
      <div className="flex flex-col tablet:flex-row gap-4">
        <div className="rounded-lg border p-6 tablet:shrink-0">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">출석 코드</h2>
          <SessionCodeDisplay code={session.attendanceCode} sessionId={sessionId} isOpen={isOpen} />
        </div>
        <div className="rounded-lg border p-6 flex-1 min-w-0">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">출석 현황</h2>
          <AttendanceStatisticsBar
            presentCount={session.presentCount}
            absentCount={session.absentCount}
            lateCount={session.lateCount}
            excusedCount={session.excusedCount}
            totalStudents={session.totalStudents}
          />
        </div>
      </div>

      {/* 출석 테이블 */}
      <AttendanceTable sessionId={sessionId} isOpen={isOpen} />
    </div>
  );
}
