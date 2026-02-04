'use client';

import { useState } from 'react';
import { useStudentGrades, StudentGrade } from '../api/queries';
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
import { FileText, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
    const pageSize = 20;

    const { data, isLoading } = useStudentGrades(examId, { page, size: pageSize });

    if (isLoading) {
        return <Skeleton className="w-full h-64 rounded-xl" />;
    }

    const students = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;
    const totalPages = data?.totalPages ?? 0;
    const isGraded = students.length > 0 && students[0].examCategory === 'GRADED';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                                onClick={() => onStudentSelect?.(student)}
                            >
                                <TableCell className="text-center font-medium text-gray-700">
                                    {student.rank}
                                </TableCell>
                                <TableCell className="font-medium">{student.studentName}</TableCell>
                                <TableCell className="text-gray-500">{student.studentPhone || '-'}</TableCell>
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
                                    {new Date(student.submittedAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStudentSelect?.(student);
                                        }}
                                    >
                                        <FileText className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

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
        </div>
    );
}
