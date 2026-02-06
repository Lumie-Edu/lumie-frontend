'use client';

import { useGenerateReport } from '@/entities/exam';
import { Button } from '@/src/shared/ui/Button';
import { FileText, Download, Eye } from 'lucide-react';
import { useState, useCallback } from 'react';

interface ReportButtonProps {
  studentId: number;
  examId: number;
  studentName?: string;
  variant?: 'icon' | 'full';
}

export function ReportButton({
  studentId,
  examId,
  studentName,
  variant = 'icon',
}: ReportButtonProps) {
  const { mutate: generateReport, isPending } = useGenerateReport();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDownload = useCallback(() => {
    generateReport({ studentId, examId });
  }, [generateReport, studentId, examId]);

  const handlePreview = useCallback(async () => {
    const { storage } = await import('@/src/shared/lib/storage');
    const { ENV } = await import('@/src/shared/config/env');

    const tenantSlug = storage.getTenantSlug();

    try {
      const response = await fetch(
        `${ENV.EXAM_SERVICE_URL}/api/v1/reports/students/${studentId}/exams/${examId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...(tenantSlug && { 'X-Tenant-Slug': tenantSlug }),
          },
        }
      );

      if (!response.ok) {
        throw new Error('리포트 생성에 실패했습니다.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Preview failed:', error);
    }
  }, [studentId, examId]);

  const closePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  if (variant === 'icon') {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          loading={isPending}
          title="리포트 다운로드"
          className="p-1.5"
        >
          <FileText className="w-4 h-4" />
        </Button>

        {previewUrl && (
          <ReportPreviewModal
            url={previewUrl}
            studentName={studentName}
            onClose={closePreview}
            onDownload={handleDownload}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          loading={isPending}
        >
          <Eye className="w-4 h-4 mr-1" />
          미리보기
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleDownload}
          loading={isPending}
        >
          <Download className="w-4 h-4 mr-1" />
          리포트 다운로드
        </Button>
      </div>

      {previewUrl && (
        <ReportPreviewModal
          url={previewUrl}
          studentName={studentName}
          onClose={closePreview}
          onDownload={handleDownload}
        />
      )}
    </>
  );
}

interface ReportPreviewModalProps {
  url: string;
  studentName?: string;
  onClose: () => void;
  onDownload: () => void;
}

function ReportPreviewModal({
  url,
  studentName,
  onClose,
  onDownload,
}: ReportPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {studentName ? `${studentName} 학습 리포트` : '학습 리포트'}
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="w-4 h-4 mr-1" />
              다운로드
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <img
            src={url}
            alt="학습 리포트"
            className="max-w-full h-auto mx-auto shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
