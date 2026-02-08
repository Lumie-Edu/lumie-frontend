'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useEmployees,
  useDeactivateEmployee,
  useReactivateEmployee,
  useDeleteEmployee,
  type Employee,
  type EmployeeFilter,
  EmploymentStatusLabel,
} from '@/entities/employee';
import {
  useActivePositions,
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
  CreatePositionInput,
  createPositionSchema,
} from '@/entities/position';
import type { Position } from '@/entities/position';
import { useAcademies } from '@/entities/academy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Plus,
  Search,
  Briefcase,
  Pencil,
  Trash2,
  MoreHorizontal,
  UserMinus,
  UserPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  TableIcon,
  User,
  Phone,
} from 'lucide-react';
import { CreateStaffForm } from '../../create-staff/ui/CreateStaffForm';
import { formatPhoneNumber } from '@/src/shared/lib/format';
import { ApiError } from '@/src/shared/types/api';

type SortField = 'name' | 'hireDate' | 'createdAt';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'card';

const PAGE_SIZE = 20;

// ─── Skeleton ───

function StaffListSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
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
      {/* 헤더 */}
      <div className="flex flex-col smalltablet:flex-row smalltablet:justify-between smalltablet:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl smalltablet:text-3xl font-bold">직원 관리</h1>
          <Badge variant="secondary" className="text-base px-3 py-1">
            총 {totalEmployees}명
          </Badge>
        </div>
        <div className="flex gap-2">
          {/* 뷰 모드 토글 */}
          <div className="hidden smalltablet:flex border rounded-lg">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={isPositionOpen} onOpenChange={setIsPositionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Briefcase className="w-4 h-4 mr-2" />
                직책
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>직책 관리</DialogTitle>
              </DialogHeader>
              <PositionManager />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex flex-col gap-3 smalltablet:gap-4">
        <div className="flex flex-col smalltablet:flex-row smalltablet:justify-between gap-3 smalltablet:gap-4">
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedPosition} onValueChange={(v) => { setSelectedPosition(v); setCurrentPage(0); setSelectedIds(new Set()); }}>
              <SelectTrigger className="flex-1 smalltablet:w-[150px]">
                <SelectValue placeholder="직책 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 직책</SelectItem>
                {positions.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedAcademy} onValueChange={(v) => { setSelectedAcademy(v); setCurrentPage(0); setSelectedIds(new Set()); }}>
              <SelectTrigger className="flex-1 smalltablet:w-[150px]">
                <SelectValue placeholder="학원 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 학원</SelectItem>
                {academies.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setCurrentPage(0); setSelectedIds(new Set()); }}>
              <SelectTrigger className="flex-1 smalltablet:w-[130px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">재직</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 smalltablet:w-[200px]">
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
      </div>

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
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="group cursor-pointer"
              onClick={() => handleNavigateToDetail(emp.id)}
            >
              <div className="relative p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-md">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{emp.name}</h3>
                        {emp.employmentStatus && emp.employmentStatus !== 'ACTIVE' && (
                          <StatusBadge status={emp.employmentStatus} />
                        )}
                      </div>
                      {emp.position && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {emp.position.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{emp.phone ? formatPhoneNumber(emp.phone) : '-'}</span>
                  </div>
                  {emp.email && (
                    <p className="text-sm text-gray-500 truncate">{emp.email}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
                  <SortableHeader field="hireDate" label="입사일" currentSort={sortField} currentDirection={sortDirection} onSort={handleSort} className="hidden desktop:table-cell" />
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
                      <TableCell className="text-center hidden desktop:table-cell">{emp.hireDate || '-'}</TableCell>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => { setCurrentPage((p) => Math.max(0, p - 1)); setSelectedIds(new Set()); }}
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
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => { setCurrentPage(page); setSelectedIds(new Set()); }}
                    >
                      {page + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              );
            })()}
            <PaginationItem>
              <PaginationNext
                onClick={() => { setCurrentPage((p) => Math.min(totalPages - 1, p + 1)); setSelectedIds(new Set()); }}
                className={currentPage === totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

// ─── Position Manager (modal) ───

function PositionManager() {
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const { data: positions, isLoading } = useActivePositions();
  const { mutate: deletePosition } = useDeletePosition();

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deletePosition(id);
      if (editingPosition?.id === id) setEditingPosition(null);
    }
  };

  if (editingPosition) {
    return <EditPositionForm position={editingPosition} onBack={() => setEditingPosition(null)} onDelete={handleDelete} />;
  }

  return (
    <div className="space-y-4">
      <CreatePositionForm />
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">등록된 직책</h4>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
          </div>
        ) : !positions?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">등록된 직책이 없습니다.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {positions.map((position) => (
              <div key={position.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium">{position.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingPosition(position)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100" onClick={() => handleDelete(position.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreatePositionForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreatePositionInput>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: { name: '' },
  });
  const { mutate: createPosition, isPending, error } = useCreatePosition();
  const apiError = error as ApiError | null;

  const onSubmit = (data: CreatePositionInput) => {
    createPosition(data, { onSuccess: () => reset() });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      {apiError && (
        <div className="p-2 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{apiError.message}</p>
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input placeholder="직책명 (예: 원장, 강사)" {...register('name')} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          <Plus className="w-4 h-4 mr-1" />
          {isPending ? '추가 중...' : '추가'}
        </Button>
      </div>
    </form>
  );
}

interface EditPositionFormProps {
  position: Position;
  onBack: () => void;
  onDelete: (id: number) => void;
}

function EditPositionForm({ position, onBack, onDelete }: EditPositionFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreatePositionInput>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: { name: position.name },
  });
  const { mutate: updatePosition, isPending, error } = useUpdatePosition(position.id);
  const apiError = error as ApiError | null;

  const onSubmit = (data: CreatePositionInput) => {
    updatePosition(data, { onSuccess: onBack });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="p-2 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{apiError.message}</p>
        </div>
      )}
      <div className="space-y-2">
        <Label>직책명 *</Label>
        <Input {...register('name')} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>뒤로</Button>
          <Button type="button" variant="destructive" onClick={() => { onDelete(position.id); onBack(); }}>삭제</Button>
        </div>
        <Button type="submit" disabled={isPending}>{isPending ? '수정 중...' : '수정'}</Button>
      </div>
    </form>
  );
}
