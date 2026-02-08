'use client';

import { useState } from 'react';
import {
  useStudents,
  useDeactivateStudent,
  useReactivateStudent,
  useDeleteStudent,
  useBatchDeactivate,
  useBatchReactivate,
  useBatchDelete,
  type SearchField,
} from '@/entities/student';
import { useAcademies } from '@/entities/academy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Search, MoreHorizontal, Trash2, Edit, UserMinus, UserPlus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { EditStudentModal } from '../../edit-student/ui/EditStudentModal';
import { RegisterStudentModal } from '../../register-student/ui/RegisterStudentModal';
import { formatPhoneNumber } from '@/src/shared/lib/format';

type SortField = 'name' | 'academyName' | 'phone' | 'studentHighschool' | 'studentBirthYear';
type SortDirection = 'asc' | 'desc';

function StudentListSkeleton() {
  return (
    <>
      {/* Mobile skeleton */}
      <div className="space-y-3 smalltablet:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-lg border p-4 space-y-3">
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
              <TableHead className="text-center">학원</TableHead>
              <TableHead className="text-center hidden tablet:table-cell">전화번호</TableHead>
              <TableHead className="text-center hidden desktop:table-cell">학부모</TableHead>
              <TableHead className="text-center hidden tablet:table-cell">학교</TableHead>
              <TableHead className="text-center hidden tablet:table-cell">생년</TableHead>
              <TableHead className="w-[8%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index} className="text-base">
                <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                <TableCell className="text-center hidden tablet:table-cell"><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                <TableCell className="text-center hidden desktop:table-cell"><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                <TableCell className="text-center hidden tablet:table-cell"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                <TableCell className="text-center hidden tablet:table-cell"><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

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
          currentDirection === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-30" />
        )}
      </span>
    </TableHead>
  );
}

const PAGE_SIZE = 20;

export function StudentList() {
  const [selectedAcademy, setSelectedAcademy] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('active');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<SearchField>('name');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data: academiesData } = useAcademies();
  const { data, isLoading, error } = useStudents({
    academyId: selectedAcademy !== 'all' ? Number(selectedAcademy) : undefined,
    search: searchTerm || undefined,
    searchField: searchTerm ? searchField : undefined,
    isActive: activeFilter === 'all' ? undefined : activeFilter === 'active',
    page: currentPage,
    size: PAGE_SIZE,
    sort: `${sortField},${sortDirection}`,
  });
  const { mutate: deactivateStudent, isPending: isDeactivating } = useDeactivateStudent();
  const { mutate: reactivateStudent, isPending: isReactivating } = useReactivateStudent();
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();
  const { mutate: batchDeactivate, isPending: isBatchDeactivating } = useBatchDeactivate();
  const { mutate: batchReactivate, isPending: isBatchReactivating } = useBatchReactivate();
  const { mutate: batchDelete, isPending: isBatchDeleting } = useBatchDelete();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const handleDeactivate = (id: number) => {
    if (confirm('학생을 퇴원 처리하시겠습니까?')) {
      deactivateStudent(id);
    }
  };

  const handleReactivate = (id: number) => {
    if (confirm('학생을 재등록하시겠습니까?')) {
      reactivateStudent(id);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('학생을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteStudent(id);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(students.map((s) => s.id)));
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

  const handleBatchDeactivate = () => {
    const activeIds = students.filter((s) => s.isActive && selectedIds.has(s.id)).map((s) => s.id);
    if (activeIds.length === 0) {
      alert('퇴원 처리할 재원 학생이 없습니다.');
      return;
    }
    if (confirm(`${activeIds.length}명의 학생을 퇴원 처리하시겠습니까?`)) {
      batchDeactivate(activeIds, {
        onSuccess: () => setSelectedIds(new Set()),
      });
    }
  };

  const handleBatchReactivate = () => {
    const inactiveIds = students.filter((s) => !s.isActive && selectedIds.has(s.id)).map((s) => s.id);
    if (inactiveIds.length === 0) {
      alert('재등록할 퇴원 학생이 없습니다.');
      return;
    }
    if (confirm(`${inactiveIds.length}명의 학생을 재등록하시겠습니까?`)) {
      batchReactivate(inactiveIds, {
        onSuccess: () => setSelectedIds(new Set()),
      });
    }
  };

  const handleBatchDelete = () => {
    const inactiveIds = students.filter((s) => !s.isActive && selectedIds.has(s.id)).map((s) => s.id);
    if (inactiveIds.length === 0) {
      alert('삭제할 퇴원 학생이 없습니다. (재원 학생은 삭제할 수 없습니다)');
      return;
    }
    if (confirm(`${inactiveIds.length}명의 학생을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      batchDelete(inactiveIds, {
        onSuccess: () => setSelectedIds(new Set()),
      });
    }
  };

  const academies = academiesData?.content ?? [];
  const students = data?.content ?? [];
  const totalStudents = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const allSelected = students.length > 0 && students.every((s) => selectedIds.has(s.id));
  const someSelected = selectedIds.size > 0;
  const isBatchProcessing = isBatchDeactivating || isBatchReactivating || isBatchDeleting;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">학생 목록을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 smalltablet:space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col smalltablet:flex-row smalltablet:justify-between smalltablet:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl smalltablet:text-3xl font-bold">학생 목록</h1>
          <Badge variant="secondary" className="text-base smalltablet:text-lg px-3 py-1">
            총 {totalStudents}명
          </Badge>
        </div>
        <Button onClick={() => setIsRegisterOpen(true)} className="smalltablet:hidden w-full">
          <Plus className="w-4 h-4 mr-2" />
          학생 추가
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex flex-col gap-3 smalltablet:gap-4">
        {/* 필터 + 검색 행 */}
        <div className="flex flex-col smalltablet:flex-row smalltablet:justify-between gap-3 smalltablet:gap-4">
          <div className="flex gap-2">
            <Select value={selectedAcademy} onValueChange={(value) => {
              setSelectedAcademy(value);
              setCurrentPage(0);
              setSelectedIds(new Set());
            }}>
              <SelectTrigger className="flex-1 smalltablet:w-[180px]">
                <SelectValue placeholder="학원 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 학원</SelectItem>
                {academies.map((academy) => (
                  <SelectItem key={academy.id} value={String(academy.id)}>
                    {academy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={(value) => {
              setActiveFilter(value);
              setCurrentPage(0);
              setSelectedIds(new Set());
            }}>
              <SelectTrigger className="flex-1 smalltablet:w-[140px]">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">재원</SelectItem>
                <SelectItem value="inactive">퇴원</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 검색 + 학생 추가 */}
          <div className="flex gap-2">
            <Select value={searchField} onValueChange={(value: SearchField) => setSearchField(value)}>
              <SelectTrigger className="w-[100px] smalltablet:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">이름</SelectItem>
                <SelectItem value="studentHighschool">학교</SelectItem>
                <SelectItem value="studentBirthYear">생년</SelectItem>
                <SelectItem value="phone">전화번호</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 smalltablet:w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="검색어 입력 후 Enter"
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
            <Button onClick={() => setIsRegisterOpen(true)} className="hidden smalltablet:inline-flex">
              <Plus className="w-4 h-4 mr-2" />
              학생 추가
            </Button>
          </div>
        </div>

        {/* 배치 액션 (선택 시에만 별도 행으로 표시) */}
        {someSelected && (
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg flex-wrap">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{selectedIds.size}명 선택</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchDeactivate}
              disabled={isBatchProcessing}
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              <UserMinus className="w-4 h-4 mr-1" />
              퇴원
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchReactivate}
              disabled={isBatchProcessing}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              재등록
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchDelete}
              disabled={isBatchProcessing}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              삭제
            </Button>
          </div>
        )}
      </div>

      {/* 테이블 / 카드 목록 */}
      {isLoading ? (
        <StudentListSkeleton />
      ) : students.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">검색된 학생이 없습니다.</p>
        </div>
      ) : (
        <>
          {/* 모바일 카드 뷰 */}
          <div className="space-y-3 smalltablet:hidden">
            {/* 모바일 전체 선택 */}
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">전체 선택</span>
            </div>
            {students.map((student) => {
              const currentYear = new Date().getFullYear();
              const age = student.studentBirthYear ? currentYear - student.studentBirthYear + 1 : null;
              const isSelected = selectedIds.has(student.id);
              return (
                <div
                  key={student.id}
                  className={`rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? 'bg-muted/30 border-primary/30' : ''}`}
                  onClick={() => setEditingId(student.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectOne(student.id, !!checked)}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-base truncate">{student.name}</span>
                          {!student.isActive && (
                            <Badge variant="outline" className="text-xs text-red-500 border-red-500 shrink-0">
                              퇴원
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{student.academyName || '-'}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(student.id);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        {student.isActive ? (
                          <DropdownMenuItem
                            className="text-orange-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeactivate(student.id);
                            }}
                            disabled={isDeactivating}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            퇴원
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReactivate(student.id);
                              }}
                              disabled={isReactivating}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              재등록
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(student.id);
                              }}
                              disabled={isDeleting}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground pl-9">
                    <span>{student.phone ? formatPhoneNumber(student.phone) : '-'}</span>
                    <span className="truncate">{student.studentHighschool || '-'}</span>
                    <span>{student.parentPhone ? formatPhoneNumber(student.parentPhone) : '-'}</span>
                    <span>{student.studentBirthYear ? `${student.studentBirthYear}년(${age}세)` : '-'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 테이블 뷰 (smalltablet 이상) */}
          <div className="hidden smalltablet:block rounded-md border">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="text-base">
                  <TableHead className="w-[5%] text-center">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <SortableHeader
                    field="name"
                    label="이름"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    field="academyName"
                    label="학원"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHead className="text-center hidden tablet:table-cell">전화번호</TableHead>
                  <TableHead className="text-center hidden desktop:table-cell">학부모</TableHead>
                  <SortableHeader
                    field="studentHighschool"
                    label="학교"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="hidden tablet:table-cell"
                  />
                  <SortableHeader
                    field="studentBirthYear"
                    label="생년"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    className="hidden tablet:table-cell"
                  />
                  <TableHead className="w-[8%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const currentYear = new Date().getFullYear();
                  const age = student.studentBirthYear ? currentYear - student.studentBirthYear + 1 : null;
                  const isSelected = selectedIds.has(student.id);
                  return (
                    <TableRow
                      key={student.id}
                      className={`cursor-pointer hover:bg-muted/50 text-base ${isSelected ? 'bg-muted/30' : ''}`}
                      onClick={() => setEditingId(student.id)}
                    >
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectOne(student.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        <span className="inline-flex items-center gap-2">
                          {!student.isActive && (
                            <Badge variant="outline" className="text-xs text-red-500 border-red-500">
                              퇴원
                            </Badge>
                          )}
                          {student.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{student.academyName || '-'}</TableCell>
                      <TableCell className="text-center hidden tablet:table-cell">{student.phone ? formatPhoneNumber(student.phone) : '-'}</TableCell>
                      <TableCell className="text-center hidden desktop:table-cell">{student.parentPhone ? formatPhoneNumber(student.parentPhone) : '-'}</TableCell>
                      <TableCell className="text-center hidden tablet:table-cell truncate max-w-0">{student.studentHighschool || '-'}</TableCell>
                      <TableCell className="text-center hidden tablet:table-cell">
                        {student.studentBirthYear ? `${student.studentBirthYear}년(${age}세)` : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(student.id);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            {student.isActive ? (
                              <DropdownMenuItem
                                className="text-orange-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeactivate(student.id);
                                }}
                                disabled={isDeactivating}
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                퇴원
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  className="text-green-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReactivate(student.id);
                                  }}
                                  disabled={isReactivating}
                                >
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  재등록
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(student.id);
                                  }}
                                  disabled={isDeleting}
                                >
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
                onClick={() => {
                  setCurrentPage((p) => Math.max(0, p - 1));
                  setSelectedIds(new Set());
                }}
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

                if (currentPage < 3) {
                  end = Math.min(totalPages - 2, 3);
                }

                if (currentPage > totalPages - 4) {
                  start = Math.max(1, totalPages - 4);
                }

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
                      onClick={() => {
                        setCurrentPage(page);
                        setSelectedIds(new Set());
                      }}
                    >
                      {page + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              );
            })()}

            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
                  setSelectedIds(new Set());
                }}
                className={currentPage === totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Edit Modal */}
      <EditStudentModal
        student={students.find((s) => s.id === editingId) ?? null}
        academies={academies}
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
      />

      {/* Register Modal */}
      <RegisterStudentModal
        open={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
      />
    </div>
  );
}
