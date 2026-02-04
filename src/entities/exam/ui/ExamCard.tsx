'use client';

import { Exam } from '../model/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/shared/ui/Card';
import { FileText, Calendar, Award } from 'lucide-react';

interface ExamCardProps {
  exam: Exam;
  onClick?: () => void;
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  GRADED: { label: '등급제', color: 'bg-blue-100 text-blue-700' },
  PASS_FAIL: { label: '합/불', color: 'bg-green-100 text-green-700' },
};

export function ExamCard({ exam, onClick }: ExamCardProps) {
  const category = categoryLabels[exam.category ?? 'GRADED'] ?? categoryLabels.GRADED;

  return (
    <Card
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {exam.name}
          </CardTitle>
          <span className={`px-2 py-1 text-xs rounded-full ${category.color}`}>
            {category.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(exam.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4" />
            <span>{exam.totalQuestions}문항</span>
          </div>
          {exam.totalPossibleScore && (
            <div className="flex items-center gap-1">
              <span>총점: {exam.totalPossibleScore}점</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
