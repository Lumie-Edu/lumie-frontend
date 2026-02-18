'use client';

import { useRouter } from 'next/navigation';
import {
  useStudent,
  useDeactivateStudent,
  useReactivateStudent,
  useDeleteStudent,
} from '@/entities/student';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, User, MoreHorizontal, UserMinus, UserPlus, Trash2 } from 'lucide-react';
import { formatPhoneNumber } from '@/src/shared/lib/format';
import { StudentInfoTab } from './StudentInfoTab';
import { ExamResultsTab } from './ExamResultsTab';
import { AttendanceTab } from './AttendanceTab';

interface StudentDetailPageProps {
  studentId: number;
}

export function StudentDetailPage({ studentId }: StudentDetailPageProps) {
  const router = useRouter();
  const { data: student, isLoading, error } = useStudent(studentId);
  const { mutate: deactivate } = useDeactivateStudent();
  const { mutate: reactivate } = useReactivateStudent();
  const { mutate: deleteStudent } = useDeleteStudent();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">학생 정보를 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.push('/admin/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>
      </div>
    );
  }

  const handleDeactivate = () => {
    if (confirm('학생을 퇴원 처리하시겠습니까?')) deactivate(student.id);
  };
  const handleReactivate = () => {
    if (confirm('학생을 재등록하시겠습니까?')) reactivate(student.id);
  };
  const handleDelete = () => {
    if (confirm('학생을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteStudent(student.id, {
        onSuccess: () => router.push('/admin/students'),
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const age = student.studentBirthYear
    ? currentYear - student.studentBirthYear + 1
    : null;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/students')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{student.name}</h1>
              {student.isActive ? (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  재학
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                  퇴원
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {student.academyName && <span>{student.academyName}</span>}
              {student.phone && <span>{formatPhoneNumber(student.phone)}</span>}
              {age && <span>{age}세</span>}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {student.isActive ? (
              <DropdownMenuItem className="text-orange-600" onClick={handleDeactivate}>
                <UserMinus className="mr-2 h-4 w-4" />
                퇴원
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem className="text-green-600" onClick={handleReactivate}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  재등록
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">기본정보</TabsTrigger>
          <TabsTrigger value="exams">시험 성적</TabsTrigger>
          <TabsTrigger value="attendance">출석</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <StudentInfoTab student={student} />
        </TabsContent>

        <TabsContent value="exams" className="mt-6">
          <ExamResultsTab studentId={student.id} />
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceTab studentId={student.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
