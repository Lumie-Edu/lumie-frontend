'use client';

import { useState } from 'react';
import { type Student, useUpdateStudent } from '@/entities/student';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Save, X } from 'lucide-react';
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
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoValue, setMemoValue] = useState(student.studentMemo ?? '');
  const { mutate: updateStudent, isPending } = useUpdateStudent(student.id);

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
    <div className="space-y-6">
      {/* 프로필 정보 */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">프로필 정보</h3>
        <dl className="space-y-0">
          <InfoRow label="이름" value={student.name} />
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
    </div>
  );
}
