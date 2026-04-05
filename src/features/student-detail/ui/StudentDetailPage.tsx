'use client';

import Link from 'next/link';
import { useStudent } from '@/entities/student';
import { useBreadcrumb } from '@/src/shared/lib/breadcrumb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DetailLayout } from '@/src/shared/ui/DetailLayout';
import { StudentInfoTab } from './StudentInfoTab';
import { ExamResultsTab } from './ExamResultsTab';
import { AttendanceTab } from './AttendanceTab';

interface StudentDetailPageProps {
  studentId: number;
}

export function StudentDetailPage({ studentId }: StudentDetailPageProps) {
  const { data: student, isLoading, error } = useStudent(studentId);

  useBreadcrumb([
    { label: '학생 목록', href: '/admin/students' },
    { label: student?.name ?? '' },
  ]);

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
        <Button variant="outline" asChild>
          <Link href="/admin/students">목록으로</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailLayout
        sidebar={<StudentInfoTab student={student} />}
        tabs={[
          { value: 'exams', label: '시험 성적', content: <ExamResultsTab studentId={student.id} studentName={student.name} /> },
          { value: 'attendance', label: '출석', content: <AttendanceTab studentId={student.id} /> },
        ]}
        defaultTab="exams"
      />
    </div>
  );
}
