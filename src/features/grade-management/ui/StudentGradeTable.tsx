'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStudentGrades, StudentGrade, QUERY_KEYS } from '../api/queries';
import { RegisterStudentModal } from '@/features/student-management/register-student/ui/RegisterStudentModal';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { FileText, Download, UserPlus, Trash2, Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteExamResult } from '@/entities/exam';
import { Skeleton } from '@/components/ui/skeleton';
import { OmrImageButton } from '@/features/omr-grading';
import { toast } from 'sonner';

interface StudentGradeTableProps {
    examId: number;
    onStudentSelect?: (student: StudentGrade) => void;
}

function getGradeBadgeStyle(grade: number) {
    if (grade <= 2) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (grade <= 4) return 'bg-green-50 text-green-700 border-green-200';
    if (grade <= 6) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (grade <= 8) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-red-50 text-red-700 border-red-200';
}

function GradeStatusCell({ student }: { student: StudentGrade }) {
    if (student.examCategory === 'PASS_FAIL') {
        return student.isPassed ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">합격</Badge>
        ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">불합격</Badge>
        );
    }

    if (student.grade != null) {
        return (
            <Badge variant="outline" className={getGradeBadgeStyle(student.grade)}>
                {student.grade}등급
            </Badge>
        );
    }

    return <span className="text-gray-400">-</span>;
}

function generatePaginationItems(currentPage: number, totalPages: number) {
    const items: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
        for (let i = 0; i < totalPages; i++) items.push(i);
    } else {
        items.push(0);

        if (currentPage > 3) {
            items.push('ellipsis');
        }

        const start = Math.max(1, currentPage - 1);
        const end = Math.min(totalPages - 2, currentPage + 1);

        for (let i = start; i <= end; i++) {
            items.push(i);
        }

        if (currentPage < totalPages - 4) {
            items.push('ellipsis');
        }

        items.push(totalPages - 1);
    }

    return items;
}

export function StudentGradeTable({ examId, onStudentSelect }: StudentGradeTableProps) {
    const [page, setPage] = useState(0);
    const [registerPhone, setRegisterPhone] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<StudentGrade | null>(null);
    const pageSize = 20;
    const queryClient = useQueryClient();
    const deleteResultMutation = useDeleteExamResult();

    const { data, isLoading } = useStudentGrades(examId, { page, size: pageSize });

    if (isLoading) {
        return <Skeleton className="w-full h-64 rounded-xl" />;
    }

    const students = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;
    const totalPages = data?.totalPages ?? 0;
    const isGraded = students.length > 0 && students[0].examCategory === 'GRADED';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-w-0 max-w-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-gray-900">학생별 성적 상세</h3>
                    <span className="text-sm text-gray-500">총 {totalElements}명</span>
                </div>
                <Button variant="outline" size="sm" className="gap-2 h-8">
                    <Download className="w-3.5 h-3.5" />
                    엑셀 다운로드
                </Button>
            </div>

            <div className="w-full max-w-full overflow-x-auto">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="w-16 text-center">순위</TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead>연락처</TableHead>
                        <TableHead className="text-right">점수</TableHead>
                        <TableHead className="text-center">백분위</TableHead>
                        <TableHead className="text-center">{isGraded ? '등급' : '상태'}</TableHead>
                        <TableHead className="text-right">제출일시</TableHead>
                        <TableHead className="w-24 text-center">관리</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                                데이터가 없습니다.
                            </TableCell>
                        </TableRow>
                    ) : (
                        students.map((student, index) => (
                            <TableRow
                                key={`${student.studentId}-${index}`}
                                className="hover:bg-gray-50/50 cursor-pointer"
                                onClick={() => {
                                    if (!student.isRegistered) {
                                        toast.info('미등록 학생은 성적 상세를 제공하지 않습니다. 먼저 학생을 등록해 주세요.');
                                        return;
                                    }
                                    onStudentSelect?.(student);
                                }}
                            >
                                <TableCell className="text-center font-medium text-gray-700">
                                    {student.rank}
                                </TableCell>
                                <TableCell className={student.isRegistered ? "font-medium" : "font-medium text-red-600"}>
                                    {student.isRegistered ? student.studentName : '미등록'}
                                </TableCell>
                                <TableCell className="text-gray-500">{student.phoneNumber || '-'}</TableCell>
                                <TableCell className="text-right font-bold text-indigo-600">
                                    {student.score}점
                                </TableCell>
                                <TableCell className="text-center text-gray-500">
                                    {student.percentile.toFixed(1)}%
                                </TableCell>
                                <TableCell className="text-center">
                                    <GradeStatusCell student={student} />
                                </TableCell>
                                <TableCell className="text-right text-gray-500 text-xs">
                                    {new Date(student.submittedAt).toLocaleDateString('ko-KR')}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <OmrImageButton examId={examId} resultId={student.resultId} size="icon" />
                                        {!student.isRegistered && student.phoneNumber && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-indigo-600 hover:text-indigo-700"
                                                title="학생 등록"
                                                onClick={() => setRegisterPhone(student.phoneNumber)}
                                            >
                                                <UserPlus className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {student.isRegistered && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                                                title="성적 상세"
                                                onClick={() => onStudentSelect?.(student)}
                                            >
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                                            title="시험 성적 삭제"
                                            onClick={() => setDeleteTarget(student)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            </div>

            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalElements)} / {totalElements}명
                    </span>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => page > 0 && setPage(page - 1)}
                                    className={page === 0 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>

                            {generatePaginationItems(page, totalPages).map((item, idx) => (
                                <PaginationItem key={idx}>
                                    {item === 'ellipsis' ? (
                                        <PaginationEllipsis />
                                    ) : (
                                        <PaginationLink
                                            isActive={page === item}
                                            onClick={() => setPage(item)}
                                        >
                                            {item + 1}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => page < totalPages - 1 && setPage(page + 1)}
                                    className={page >= totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <RegisterStudentModal
                open={registerPhone !== null}
                onOpenChange={(open) => { if (!open) setRegisterPhone(null); }}
                initialPhone={registerPhone ?? undefined}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studentGrades(examId) });
                    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.examStats(examId) });
                }}
            />

            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>시험 성적 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget?.isRegistered ? deleteTarget?.studentName : '미등록 학생'}의 이 시험 성적을 삭제하시겠습니까?
                            삭제된 성적과 OMR 이미지는 복구할 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteResultMutation.isPending}
                            onClick={(e) => {
                                e.preventDefault();
                                if (!deleteTarget) return;
                                deleteResultMutation.mutate(
                                    { examId, resultId: deleteTarget.resultId },
                                    { onSuccess: () => setDeleteTarget(null) },
                                );
                            }}
                        >
                            {deleteResultMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            삭제
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
