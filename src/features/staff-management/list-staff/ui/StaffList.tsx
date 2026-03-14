'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useEmployees,
  useDeactivateEmployee,
  useReactivateEmployee,
  useDeleteEmployee,
  type EmployeeFilter,
  EmploymentStatusLabel,
} from '@/entities/employee';
import { useActivePositions } from '@/entities/position';
import { useAcademies } from '@/entities/academy';
import { PositionManagerDialog } from '../../manage-positions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TablePagination } from '@/src/shared/ui/TablePagination';
import { TableFilter } from '@/src/shared/ui/TableFilter';
import { ViewModeToggle, type ViewMode } from '@/src/shared/ui/ViewModeToggle';
import { PersonCardGrid, PersonCardGridSkeleton } from '@/src/shared/ui/PersonCardGrid';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
  UserMinus,
  UserPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { CreateStaffForm } from '../../create-staff/ui/CreateStaffForm';
import { formatPhoneNumber } from '@/src/shared/lib/format';

type SortField = 'name' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE = 20;

// ─── Skeleton ───

function StaffListSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'card') {
    return <PersonCardGridSkeleton />;
  }

  return (
    <>
      {/* Mobile skeleton */}
      <div className="space-y-3 smalltablet:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="hidden smalltablet:block w-full">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="text-base">
              <TableHead className="w-[5%]"></TableHead>
              <TableHead className="text-center">이름</TableHead>
              <TableHead className="text-center">직책</TableHead>
              <TableHead className="text-center hidden tablet:table-cell">전화번호</TableHead>
              <TableHead className="text-center hidden tablet:table-cell">이메일</TableHead>
              <TableHead className="text-center hidden desktop:table-cell">상태</TableHead>
              <TableHead className="w-[8%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i} className="text-base">
                <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                <TableCell className="text-center hidden tablet:table-cell"><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                <TableCell className="text-center hidden tablet:table-cell"><Skeleton className="h-5 w-28 mx-auto" /></TableCell>
                <TableCell className="text-center hidden desktop:table-cell"><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

// ─── Sortable Header ───

interface SortableHeaderProps {
  field: SortField;
  label: string;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

function SortableHeader({ field, label, currentSort, currentDirection, onSort, className }: SortableHeaderProps) {
  const isActive = currentSort === field;
  return (
    <TableHead
      className={`text-center cursor-pointer hover:bg-muted/50 select-none ${className ?? ''}`}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          currentDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-30" />
        )}
      </span>
    </TableHead>
  );
}

// ─── Status Badge ───

function StatusBadge({ status }: { status: string }) {
  const label = EmploymentStatusLabel[status as keyof typeof EmploymentStatusLabel] ?? status;
  const colorMap: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700 border-green-200',
    INACTIVE: 'bg-gray-100 text-gray-600 border-gray-200',
    ON_LEAVE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    TERMINATED: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <Badge variant="outline" className={`text-xs ${colorMap[status] ?? ''}`}>
      {label}
    </Badge>
  );
}

// ─── Main Component ───

export function StaffList() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedAcademy, setSelectedAcademy] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('active');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPositionOpen, setIsPositionOpen] = useState(false);

  const filter: EmployeeFilter = {
    positionId: selectedPosition !== 'all' ? Number(selectedPosition) : undefined,
    academyId: selectedAcademy !== 'all' ? Number(selectedAcademy) : undefined,
    isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
    search: searchTerm || undefined,
  };

  const { data, isLoading, error } = useEmployees({
    filter,
    page: currentPage,
    size: PAGE_SIZE,
    sort: `${sortField},${sortDirection}`,
  });
  const { data: positionsData } = useActivePositions();
  const { data: academiesData } = useAcademies();
  const { mutate: deactivateEmployee, isPending: isDeactivating } = useDeactivateEmployee();
  const { mutate: reactivateEmployee, isPending: isReactivating } = useReactivateEmployee();
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();

  const employees = data?.content ?? [];
  const totalEmployees = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const positions = positionsData ?? [];
  const academies = academiesData?.content ?? [];

  const allSelected = employees.length > 0 && employees.every((e) => selectedIds.has(e.id));
  const someSelected = selectedIds.size > 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const handleNavigateToDetail = (id: number) => {
    router.push(`/admin/staff/${id}`);
  };

  const handleDeactivate = (id: number) => {
    if (confirm('직원을 비활성화하시겠습니까?')) {
      deactivateEmployee(id);
    }
  };

  const handleReactivate = (id: number) => {
    if (confirm('직원을 재활성화하시겠습니까?')) {
      reactivateEmployee(id);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('직원을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteEmployee(id);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(employees.map((e) => e.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id); else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handleBatchDeactivate = () => {
    const activeIds = employees.filter((e) => e.isActive && selectedIds.has(e.id)).map((e) => e.id);
    if (activeIds.length === 0) { alert('비활성화할 활성 직원이 없습니다.'); return; }
    if (confirm(`${activeIds.length}명의 직원을 비활성화하시겠습니까?`)) {
      activeIds.forEach((id) => deactivateEmployee(id));
      setSelectedIds(new Set());
    }
  };

  const handleBatchReactivate = () => {
    const inactiveIds = employees.filter((e) => !e.isActive && selectedIds.has(e.id)).map((e) => e.id);
    if (inactiveIds.length === 0) { alert('재활성화할 비활성 직원이 없습니다.'); return; }
    if (confirm(`${inactiveIds.length}명의 직원을 재활성화하시겠습니까?`)) {
      inactiveIds.forEach((id) => reactivateEmployee(id));
      setSelectedIds(new Set());
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">직원 목록을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 smalltablet:space-y-6">
      {/* 헤더 + 검색 + 액션 */}
      <div className="flex flex-wrap items-center gap-2 smalltablet:gap-3">
        <h1 className="text-2xl smalltablet:text-3xl font-bold whitespace-nowrap">직원 관리</h1>
        <Badge variant="secondary" className="text-base px-3 py-1">
          총 {totalEmployees}명
        </Badge>
        <div className="flex-1" />
        <div className="relative hidden smalltablet:block smalltablet:w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름/아이디/이메일 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearchTerm(searchInput);
                setCurrentPage(0);
                setSelectedIds(new Set());
              }
            }}
            className="pl-9"
          />
        </div>
        <div className="hidden smalltablet:block">
          <TableFilter
            filters={[
              {
                key: 'position',
                label: '직책',
                value: selectedPosition,
                defaultValue: 'all',
                options: [
                  { value: 'all', label: '전체 직책' },
                  ...positions.map((p) => ({ value: String(p.id), label: p.name })),
                ],
                onChange: (v) => { setSelectedPosition(v); setCurrentPage(0); setSelectedIds(new Set()); },
              },
              {
                key: 'academy',
                label: '학원',
                value: selectedAcademy,
                defaultValue: 'all',
                options: [
                  { value: 'all', label: '전체 학원' },
                  ...academies.map((a) => ({ value: String(a.id), label: a.name })),
                ],
                onChange: (v) => { setSelectedAcademy(v); setCurrentPage(0); setSelectedIds(new Set()); },
              },
              {
                key: 'status',
                label: '상태',
                value: activeFilter,
                defaultValue: 'active',
                options: [
                  { value: 'all', label: '전체' },
                  { value: 'active', label: '재직' },
                  { value: 'inactive', label: '비활성' },
                ],
                onChange: (v) => { setActiveFilter(v); setCurrentPage(0); setSelectedIds(new Set()); },
              },
            ]}
            onReset={() => { setCurrentPage(0); setSelectedIds(new Set()); }}
          />
        </div>
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
        <PositionManagerDialog open={isPositionOpen} onOpenChange={setIsPositionOpen} />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden smalltablet:inline">직원 추가</span>
              <span className="smalltablet:hidden">추가</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>직원 계정 생성</DialogTitle>
            </DialogHeader>
            <CreateStaffForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* 배치 액션 */}
      {someSelected && (
        <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg flex-wrap">
          <span className="text-sm text-muted-foreground whitespace-nowrap">{selectedIds.size}명 선택</span>
          <Button
            variant="outline" size="sm"
            onClick={handleBatchDeactivate}
            disabled={isDeactivating}
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
          >
            <UserMinus className="w-4 h-4 mr-1" />
            비활성화
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={handleBatchReactivate}
            disabled={isReactivating}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            재활성화
          </Button>
        </div>
      )}

      {/* 목록 */}
      {isLoading ? (
        <StaffListSkeleton viewMode={viewMode} />
      ) : employees.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground mb-2">
            {searchTerm || selectedPosition !== 'all' || selectedAcademy !== 'all'
              ? '검색된 직원이 없습니다.'
              : '등록된 직원이 없습니다.'}
          </p>
          {!searchTerm && selectedPosition === 'all' && selectedAcademy === 'all' && (
            <p className="text-sm text-muted-foreground">새 직원을 추가해보세요.</p>
          )}
        </div>
      ) : viewMode === 'card' ? (
        <PersonCardGrid
          items={employees.map((emp) => ({
            id: emp.id,
            name: emp.name,
            phone: emp.phone,
            subtitle: emp.position?.name,
            badge: emp.employmentStatus && emp.employmentStatus !== 'ACTIVE' ? (
              <StatusBadge status={emp.employmentStatus} />
            ) : undefined,
          }))}
          onItemClick={(id) => handleNavigateToDetail(id)}
        />
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="space-y-3 smalltablet:hidden">
            <div className="flex items-center gap-2 px-1">
              <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
              <span className="text-sm text-muted-foreground">전체 선택</span>
            </div>
            {employees.map((emp) => {
              const isSelected = selectedIds.has(emp.id);
              return (
                <div
                  key={emp.id}
                  className={`rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? 'bg-muted/30 border-primary/30' : ''}`}
                  onClick={() => handleNavigateToDetail(emp.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onCheckedChange={(c) => handleSelectOne(emp.id, !!c)} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-base truncate">{emp.name}</span>
                          {emp.employmentStatus && emp.employmentStatus !== 'ACTIVE' && (
                            <StatusBadge status={emp.employmentStatus} />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {emp.position?.name || '-'}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleNavigateToDetail(emp.id); }}>
                          <Pencil className="mr-2 h-4 w-4" />
                          상세 보기
                        </DropdownMenuItem>
                        {emp.isActive ? (
                          <DropdownMenuItem className="text-orange-600" onClick={(e) => { e.stopPropagation(); handleDeactivate(emp.id); }} disabled={isDeactivating}>
                            <UserMinus className="mr-2 h-4 w-4" />
                            비활성화
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem className="text-green-600" onClick={(e) => { e.stopPropagation(); handleReactivate(emp.id); }} disabled={isReactivating}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              재활성화
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(emp.id); }} disabled={isDeleting}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground pl-9">
                    <span>{emp.phone ? formatPhoneNumber(emp.phone) : '-'}</span>
                    <span className="truncate">{emp.email || '-'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden smalltablet:block rounded-md border">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="text-base">
                  <TableHead className="w-[5%] text-center">
                    <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                  </TableHead>
                  <SortableHeader field="name" label="이름" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort} />
                  <TableHead className="text-center">직책</TableHead>
                  <TableHead className="text-center hidden tablet:table-cell">전화번호</TableHead>
                  <TableHead className="text-center hidden tablet:table-cell">이메일</TableHead>
                  <TableHead className="text-center hidden desktop:table-cell">상태</TableHead>
                  <TableHead className="w-[8%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => {
                  const isSelected = selectedIds.has(emp.id);
                  return (
                    <TableRow
                      key={emp.id}
                      className={`cursor-pointer hover:bg-muted/50 text-base ${isSelected ? 'bg-muted/30' : ''}`}
                      onClick={() => handleNavigateToDetail(emp.id)}
                    >
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onCheckedChange={(c) => handleSelectOne(emp.id, !!c)} />
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        <span className="inline-flex items-center gap-2">
                          {emp.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{emp.position?.name || '-'}</TableCell>
                      <TableCell className="text-center hidden tablet:table-cell">{emp.phone ? formatPhoneNumber(emp.phone) : '-'}</TableCell>
                      <TableCell className="text-center hidden tablet:table-cell truncate max-w-0">{emp.email || '-'}</TableCell>
                      <TableCell className="text-center hidden desktop:table-cell">
                        <StatusBadge status={emp.employmentStatus || 'ACTIVE'} />
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleNavigateToDetail(emp.id); }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              상세 보기
                            </DropdownMenuItem>
                            {emp.isActive ? (
                              <DropdownMenuItem className="text-orange-600" onClick={(e) => { e.stopPropagation(); handleDeactivate(emp.id); }} disabled={isDeactivating}>
                                <UserMinus className="mr-2 h-4 w-4" />
                                비활성화
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem className="text-green-600" onClick={(e) => { e.stopPropagation(); handleReactivate(emp.id); }} disabled={isReactivating}>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  재활성화
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(emp.id); }} disabled={isDeleting}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  삭제
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => { setCurrentPage(page); setSelectedIds(new Set()); }}
      />
    </div>
  );
}
