'use client';

import { useState } from 'react';
import { type Student, useUpdateStudent } from '@/entities/student';
import { useAcademies } from '@/entities/academy';
import { useStudentAttendanceStatistics } from '@/entities/attendance';
import { EditStudentModal } from '@/features/student-management/edit-student';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, Pencil, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPhoneNumber, formatDate } from '@/src/shared/lib/format';

interface StudentInfoTabProps {
  student: Student;
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-b-0">
      <dt className="text-sm font-medium text-muted-foreground sm:w-32 shrink-0">{label}</dt>
      <dd className="text-sm text-foreground mt-1 sm:mt-0">{value || '-'}</dd>
    </div>
  );
}

export function StudentInfoTab({ student }: StudentInfoTabProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoValue, setMemoValue] = useState(student.studentMemo ?? '');
  const { mutate: updateStudent, isPending } = useUpdateStudent(student.id);
  const { data: academiesData } = useAcademies();

  const { data: statistics } = useStudentAttendanceStatistics(student.id);

  const currentYear = new Date().getFullYear();
  const age = student.studentBirthYear
    ? currentYear - student.studentBirthYear + 1
    : null;

  const handleSaveMemo = () => {
    updateStudent(
      { studentMemo: memoValue },
      {
        onSuccess: () => {
          setIsEditingMemo(false);
        },
      }
    );
  };

  const handleCancelMemo = () => {
    setMemoValue(student.studentMemo ?? '');
    setIsEditingMemo(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 프로필 정보 */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{student.name}</h2>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            {student.isActive ? (
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 mt-0.5">
                재학
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 mt-0.5">
                퇴원
              </Badge>
            )}
          </div>
        </div>
        <dl className="space-y-0">
          <InfoRow label="아이디" value={student.userLoginId} />
          <InfoRow label="연락처" value={formatPhoneNumber(student.phone)} />
          <InfoRow label="학부모 연락처" value={formatPhoneNumber(student.parentPhone)} />
          <InfoRow label="학교" value={student.studentHighschool} />
          <InfoRow
            label="출생연도"
            value={
              student.studentBirthYear
                ? `${student.studentBirthYear}년${age ? ` (${age}세)` : ''}`
                : null
            }
          />
          <InfoRow label="출석률" value={statistics ? `${statistics.attendanceRate}%` : null} />
          <InfoRow label="소속 학원" value={student.academyName} />
          <InfoRow label="등록일" value={formatDate(student.createdAt)} />
        </dl>
      </div>

      {/* 메모 */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">메모</h3>
          {!isEditingMemo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingMemo(true)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              수정
            </Button>
          )}
        </div>

        {isEditingMemo ? (
          <div className="space-y-3">
            <Textarea
              value={memoValue}
              onChange={(e) => setMemoValue(e.target.value)}
              rows={5}
              placeholder="메모를 입력하세요..."
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveMemo} disabled={isPending}>
                <Save className="h-4 w-4 mr-1" />
                저장
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelMemo}
                disabled={isPending}
              >
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[60px]">
            {student.studentMemo || '메모가 없습니다.'}
          </p>
        )}
      </div>

      <EditStudentModal
        student={student}
        academies={academiesData?.content ?? []}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}
