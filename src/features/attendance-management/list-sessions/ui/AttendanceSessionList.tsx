'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAttendanceSessions,
  useCloseSession,
  useDeleteSession,
  useRegenerateCode,
  type AttendanceSession,
} from '@/entities/attendance';
import { useAcademies } from '@/entities/academy';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageListHeader } from '@/src/shared/ui/PageListHeader';
import { TableFilter } from '@/src/shared/ui/TableFilter';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, MoreHorizontal, Eye, XCircle, RefreshCw, Trash2, CalendarCheck } from 'lucide-react';
import { EmptyState } from '@/src/shared/ui/EmptyState';
import { CreateSessionModal } from '../../create-session/ui/CreateSessionModal';

const PAGE_SIZE = 20;

function SessionListSkeleton() {
  return (
    <>
      <div className="space-y-3 smalltablet:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden smalltablet:block w-full">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="text-base">
              <TableHead className="text-center">날짜</TableHead>
              <TableHead className="text-center">세션명</TableHead>
              <TableHead className="text-center hidden tablet:table-cell">과목</TableHead>
              <TableHead className="text-center">상태</TableHead>
              <TableHead className="text-center hidden tablet:table-cell">코드</TableHead>
              <TableHead className="text-center">학생수</TableHead>
              <TableHead className="w-[8%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index} className="text-base">
                <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-32 mx-auto" /></TableCell>
                <TableCell className="text-center hidden tablet:table-cell"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                <TableCell className="text-center hidden tablet:table-cell"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export function AttendanceSessionList() {
  const router = useRouter();
  const [selectedAcademy, setSelectedAcademy] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: academiesData } = useAcademies();
  const { data, isLoading, error } = useAttendanceSessions({
    academyId: selectedAcademy !== 'all' ? Number(selectedAcademy) : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page: currentPage,
    size: PAGE_SIZE,
    sort: 'sessionDate,desc',
  });
  const { mutate: closeSession } = useCloseSession();
  const { mutate: deleteSession } = useDeleteSession();
  const { mutate: regenerateCode } = useRegenerateCode();

  const academies = academiesData?.content ?? [];
  const sessions = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const handleClose = (id: number) => {
    if (confirm('세션을 종료하시겠습니까?')) {
      closeSession(id);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('세션을 삭제하시겠습니까? 관련 출석 기록도 모두 삭제됩니다.')) {
      deleteSession(id);
    }
  };

  const handleRegenerate = (id: number) => {
    if (confirm('새로운 출석 코드를 생성하시겠습니까?')) {
      regenerateCode(id);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">출석 세션 목록을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 smalltablet:space-y-6">
      {/* 헤더 */}
      <PageListHeader title="출석 관리" count={totalElements} countUnit="개">
        <TableFilter
          filters={[
            {
              key: 'academy',
              label: '학원',
              value: selectedAcademy,
              defaultValue: 'all',
              options: [
                { value: 'all', label: '전체 학원' },
                ...academies.map((a) => ({ value: String(a.id), label: a.name })),
              ],
              onChange: (v) => { setSelectedAcademy(v); setCurrentPage(0); },
            },
            {
              key: 'status',
              label: '상태',
              value: statusFilter,
              defaultValue: 'all',
              options: [
                { value: 'all', label: '전체' },
                { value: 'OPEN', label: '진행중' },
                { value: 'CLOSED', label: '종료' },
              ],
              onChange: (v) => { setStatusFilter(v); setCurrentPage(0); },
            },
            {
              key: 'dateFrom',
              label: '시작일',
              type: 'date',
              value: dateFrom,
              defaultValue: '',
              onChange: (v) => { setDateFrom(v); setCurrentPage(0); },
            },
            {
              key: 'dateTo',
              label: '종료일',
              type: 'date',
              value: dateTo,
              defaultValue: '',
              onChange: (v) => { setDateTo(v); setCurrentPage(0); },
            },
          ]}
          onReset={() => setCurrentPage(0)}
          popoverClassName="w-72"
        />
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          세션 생성
        </Button>
      </PageListHeader>

      {/* 목록 */}
      {isLoading ? (
        <SessionListSkeleton />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          message="출석 세션이 없습니다."
          actionLabel="세션 생성"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <>
          {/* 모바일 카드 뷰 */}
          <div className="space-y-3 smalltablet:hidden">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/admin/attendance/${session.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-base truncate">{session.name}</span>
                      <Badge variant={session.status === 'OPEN' ? 'default' : 'secondary'} className="shrink-0">
                        {session.status === 'OPEN' ? '진행중' : '종료'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(session.sessionDate).toLocaleDateString('ko-KR')} {session.subject ? `| ${session.subject}` : ''}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/admin/attendance/${session.id}`); }}>
                        <Eye className="mr-2 h-4 w-4" />
                        상세보기
                      </DropdownMenuItem>
                      {session.status === 'OPEN' && (
                        <>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRegenerate(session.id); }}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            코드 재생성
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleClose(session.id); }} className="text-orange-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            세션 종료
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-2 flex gap-3 text-sm text-muted-foreground">
                  <span>코드: <span className="font-mono font-medium text-foreground">{session.attendanceCode}</span></span>
                  <span>학생: {session.totalStudents}명</span>
                </div>
              </div>
            ))}
          </div>

          {/* 테이블 뷰 */}
          <div className="hidden smalltablet:block rounded-md border">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="text-base">
                  <TableHead className="text-center">날짜</TableHead>
                  <TableHead className="text-center">세션명</TableHead>
                  <TableHead className="text-center hidden tablet:table-cell">과목</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                  <TableHead className="text-center hidden tablet:table-cell">코드</TableHead>
                  <TableHead className="text-center">출석현황</TableHead>
                  <TableHead className="w-[8%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow
                    key={session.id}
                    className="cursor-pointer hover:bg-muted/50 text-base"
                    onClick={() => router.push(`/admin/attendance/${session.id}`)}
                  >
                    <TableCell className="text-center">{new Date(session.sessionDate).toLocaleDateString('ko-KR')}</TableCell>
                    <TableCell className="text-center font-medium">{session.name}</TableCell>
                    <TableCell className="text-center hidden tablet:table-cell">{session.subject || '-'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={session.status === 'OPEN' ? 'default' : 'secondary'}>
                        {session.status === 'OPEN' ? '진행중' : '종료'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center hidden tablet:table-cell">
                      <span className="font-mono">{session.attendanceCode}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600">{session.presentCount}</span>
                      /
                      <span className="text-red-600">{session.absentCount}</span>
                      /
                      <span className="text-yellow-600">{session.lateCount}</span>
                      /
                      <span>{session.totalStudents}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/admin/attendance/${session.id}`); }}>
                            <Eye className="mr-2 h-4 w-4" />
                            상세보기
                          </DropdownMenuItem>
                          {session.status === 'OPEN' && (
                            <>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRegenerate(session.id); }}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                코드 재생성
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleClose(session.id); }} className="text-orange-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                세션 종료
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className={currentPage === 0 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {(() => {
              const pages: (number | 'ellipsis')[] = [];
              const showPages = 5;
              if (totalPages <= showPages + 2) {
                for (let i = 0; i < totalPages; i++) pages.push(i);
              } else {
                pages.push(0);
                let start = Math.max(1, currentPage - 1);
                let end = Math.min(totalPages - 2, currentPage + 1);
                if (currentPage < 3) end = Math.min(totalPages - 2, 3);
                if (currentPage > totalPages - 4) start = Math.max(1, totalPages - 4);
                if (start > 1) pages.push('ellipsis');
                for (let i = start; i <= end; i++) pages.push(i);
                if (end < totalPages - 2) pages.push('ellipsis');
                pages.push(totalPages - 1);
              }
              return pages.map((page, index) =>
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
                      {page + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              );
            })()}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                className={currentPage === totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <CreateSessionModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
