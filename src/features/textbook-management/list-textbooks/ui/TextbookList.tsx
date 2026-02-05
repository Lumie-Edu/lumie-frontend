'use client';

import { useState, useRef } from 'react';
import {
  useTextbookFiles,
  usePresignedUpload,
  useRegisterUpload,
  usePresignedDownload,
  useDeleteTextbookFile,
  uploadFileToS3,
} from '@/entities/textbook';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/src/shared/ui/Card';
import {
  Upload,
  Trash2,
  FileText,
  Download,
  File,
  FileSpreadsheet,
  Loader2,
  HardDrive,
} from 'lucide-react';
import { toast } from 'sonner';

const getFileIcon = (contentType: string) => {
  if (contentType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
  if (contentType.includes('word') || contentType.includes('document'))
    return <FileText className="w-8 h-8 text-blue-500" />;
  if (contentType.includes('sheet') || contentType.includes('excel'))
    return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
  return <File className="w-8 h-8 text-gray-500" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024; // 10GB

const formatTotalSize = (bytes: number) => {
  if (bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getStoragePercentage = (used: number) => {
  return Math.min((used / MAX_STORAGE_BYTES) * 100, 100);
};

export function TextbookList() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: files, isLoading, error } = useTextbookFiles();
  const { mutateAsync: getPresignedUpload } = usePresignedUpload();
  const { mutateAsync: registerUpload } = useRegisterUpload();
  const { mutateAsync: getPresignedDownload } = usePresignedDownload();
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteTextbookFile();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('PDF, Word, Excel 파일만 업로드 가능합니다.');
      return;
    }

    const maxFileSize = 50 * 1024 * 1024; // 50MB per file
    if (file.size > maxFileSize) {
      toast.error('파일 크기는 50MB를 초과할 수 없습니다.');
      return;
    }

    if (totalSize + file.size > MAX_STORAGE_BYTES) {
      toast.error('저장 용량이 부족합니다. (최대 10GB)');
      return;
    }

    setIsUploading(true);
    try {
      const presignedResponse = await getPresignedUpload({
        entityType: 'TEXTBOOK',
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      await uploadFileToS3(presignedResponse.uploadUrl, file);
      await registerUpload(presignedResponse.fileId);
      toast.success('파일이 성공적으로 업로드되었습니다.');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    setDownloadingId(fileId);
    try {
      const response = await getPresignedDownload(fileId);
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('다운로드에 실패했습니다.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('정말 삭제하시겠습니까?')) {
      setDeletingId(id);
      deleteFile(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  const completedFiles = files?.filter((f) => f.uploadCompleted) ?? [];
  const totalSize = completedFiles.reduce((sum, file) => sum + file.fileSize, 0);
  const usagePercentage = getStoragePercentage(totalSize);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-medium">교재를 불러오는 중 오류가 발생했습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Storage Status */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">교재 관리</h1>
        </div>

        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full md:w-auto"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                교재 업로드
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Storage Indicator */}
      <Card className="bg-muted/30 border-none shadow-none" padding="md">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-background rounded-full border shadow-sm">
            <HardDrive className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-sm font-medium">
              <span>저장 공간 사용량</span>
              <span className={usagePercentage > 90 ? "text-red-500" : "text-muted-foreground"}>
                {formatTotalSize(totalSize)} / 10 GB ({usagePercentage.toFixed(1)}%)
              </span>
            </div>
            <Progress
              value={usagePercentage}
              className="h-2"
              indicatorClassName={usagePercentage > 90 ? "bg-red-500" : undefined}
            />
          </div>
        </div>
      </Card>

      {/* File Grid */}
      {completedFiles.length === 0 ? (
        <div className="text-center py-20 bg-muted/50 rounded-lg border border-dashed">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">등록된 교재가 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-4">PDF, Word, Excel 파일을 업로드하여 관리하세요.</p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            첫 번째 교재 업로드
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedFiles.map((file) => (
            <Card
              key={file.id}
              className="group hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-default relative overflow-hidden"
              padding="md"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-muted/30 rounded-lg group-hover:bg-muted/50 transition-colors">
                  {getFileIcon(file.contentType)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-foreground truncate pr-6" title={file.originalFilename}>
                      {file.originalFilename}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="font-normal text-xs px-1.5 py-0 h-5">
                      {formatFileSize(file.fileSize)}
                    </Badge>
                    <span>•</span>
                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Always Visible) */}
              <div className="absolute top-2 right-2 flex gap-1 bg-white/80 backdrop-blur-sm rounded-md p-1 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => handleDownload(file.id, file.originalFilename)}
                  disabled={downloadingId === file.id}
                  title="다운로드"
                >
                  {downloadingId === file.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => handleDelete(file.id, e)}
                  disabled={isDeleting && deletingId === file.id}
                  title="삭제"
                >
                  {isDeleting && deletingId === file.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
