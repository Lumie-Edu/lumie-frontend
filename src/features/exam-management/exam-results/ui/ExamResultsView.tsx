'use client';

import { useExamResults, useSubmitExamResult, ExamResult } from '@/entities/exam';
import { useStudents } from '@/entities/student';
import { Button } from '@/src/shared/ui/Button';
import { Input } from '@/src/shared/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/shared/ui/Card';
import { useState } from 'react';
import { CheckCircle, XCircle, Plus, FileText } from 'lucide-react';
import { ReportButton } from './ReportButton';

interface ExamResultsViewProps {
  examId: number;
  totalScore: number;
  passingScore?: number;
}

export function ExamResultsView({ examId, totalScore, passingScore }: ExamResultsViewProps) {
  const { data, isLoading } = useExamResults(examId);
  const { data: studentsData } = useStudents();
  const { mutate: submitResult, isPending } = useSubmitExamResult(examId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [score, setScore] = useState<string>('');

  const handleSubmit = () => {
    if (!selectedStudent || !score) return;

    submitResult(
      { studentId: selectedStudent, score: Number(score) },
      {
        onSuccess: () => {
          setShowAddForm(false);
          setSelectedStudent(null);
          setScore('');
        },
      }
    );
  };

  const results = data ?? [];
  const students = studentsData?.content ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">시험 결과 ({results.length}명)</h3>
        <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-1" />
          결과 추가
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  학생
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={selectedStudent ?? ''}
                  onChange={(e) => setSelectedStudent(Number(e.target.value))}
                >
                  <option value="">학생 선택</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.userLoginId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <Input
                  label="점수"
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  min={0}
                  max={totalScore}
                />
              </div>
              <Button onClick={handleSubmit} loading={isPending}>
                저장
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">등록된 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">학생</th>
                <th className="px-4 py-3 text-left">점수</th>
                <th className="px-4 py-3 text-left">합격 여부</th>
                <th className="px-4 py-3 text-left">제출일</th>
                <th className="px-4 py-3 text-center">리포트</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map((result) => (
                <tr key={result.id}>
                  <td className="px-4 py-3">{result.studentName}</td>
                  <td className="px-4 py-3">
                    {result.score} / {totalScore}
                    <span className="text-gray-500 ml-1">
                      ({Math.round((result.score / totalScore) * 100)}%)
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {result.isPassed ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        합격
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-4 h-4" />
                        불합격
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString('ko-KR') : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ReportButton
                      studentId={result.studentId}
                      examId={examId}
                      studentName={result.studentName}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
