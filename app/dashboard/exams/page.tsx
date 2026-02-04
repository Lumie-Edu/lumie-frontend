'use client';

import { useRouter } from 'next/navigation';
import { useMyExamResults, ExamCard, useExams } from '@/entities/exam';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/shared/ui/Card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function StudentExamsPage() {
  const router = useRouter();
  const { data: examsData, isLoading: examsLoading } = useExams({ status: 'PUBLISHED' });
  const { data: resultsData, isLoading: resultsLoading } = useMyExamResults();

  const exams = examsData?.content ?? [];
  const results = resultsData?.content ?? [];

  const isLoading = examsLoading || resultsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">시험</h1>
        <p className="text-gray-600">진행 중인 시험과 결과를 확인합니다.</p>
      </div>

      {/* Available Exams */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">진행 중인 시험</h2>
        {exams.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">현재 진행 중인 시험이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onClick={() => router.push(`/dashboard/exams/${exam.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* My Results */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">내 시험 결과</h2>
        {results.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">아직 시험 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">시험명</th>
                  <th className="px-4 py-3 text-left">점수</th>
                  <th className="px-4 py-3 text-left">결과</th>
                  <th className="px-4 py-3 text-left">제출일</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">시험 #{result.examId}</td>
                    <td className="px-4 py-3">{result.score}점</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
