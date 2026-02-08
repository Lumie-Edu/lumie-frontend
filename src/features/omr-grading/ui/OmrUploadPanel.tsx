'use client';

import { useState, useCallback, useRef } from 'react';
import {
    Upload,
    Image as ImageIcon,
    X,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Download,
    FileImage,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useGradeOmr } from '../api/queries';
import { type Exam } from '@/entities/exam';

interface OmrUploadPanelProps {
    selectedExam: Exam | null;
}

interface UploadedFile {
    id: string;
    file: File;
    preview: string;
}

export function OmrUploadPanel({ selectedExam }: OmrUploadPanelProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const gradeOmrMutation = useGradeOmr();

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
            file.type.startsWith('image/')
        );
        addFiles(droppedFiles);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files ?? []);
        addFiles(selectedFiles);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const addFiles = (newFiles: File[]) => {
        const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
        }));
        setFiles((prev) => [...prev, ...uploadedFiles]);
    };

    const removeFile = (id: string) => {
        setFiles((prev) => {
            const file = prev.find((f) => f.id === id);
            if (file) {
                URL.revokeObjectURL(file.preview);
            }
            return prev.filter((f) => f.id !== id);
        });
    };

    const handleGrade = async () => {
        if (!selectedExam || files.length === 0) return;

        try {
            await gradeOmrMutation.mutateAsync({
                examId: selectedExam.id,
                images: files.map((f) => f.file),
            });
            // Clear files after successful grading
            files.forEach((f) => URL.revokeObjectURL(f.preview));
            setFiles([]);
        } catch {
            // Error handled in mutation
        }
    };

    const isGrading = gradeOmrMutation.isPending;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <Upload className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">OMR 업로드</h2>
                            <p className="text-sm text-gray-500">스캔 이미지를 업로드하세요</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-gray-600 hover:text-emerald-600 hover:border-emerald-300"
                    >
                        <Download className="w-4 h-4" />
                        답지 다운로드
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Upload Area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                        isDragging
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className={cn(
                                'p-4 rounded-full transition-colors duration-200',
                                isDragging ? 'bg-emerald-100' : 'bg-gray-100'
                            )}
                        >
                            <ImageIcon
                                className={cn(
                                    'w-8 h-8 transition-colors duration-200',
                                    isDragging ? 'text-emerald-500' : 'text-gray-400'
                                )}
                            />
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">
                                이미지를 드래그하거나 클릭하여 업로드
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                JPG, PNG, WEBP 형식 지원
                            </p>
                        </div>
                    </div>
                </div>

                {/* File Preview */}
                {files.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                업로드된 이미지 ({files.length}개)
                            </span>
                            <button
                                onClick={() => {
                                    files.forEach((f) => URL.revokeObjectURL(f.preview));
                                    setFiles([]);
                                }}
                                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                            >
                                전체 삭제
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200"
                                >
                                    <img
                                        src={file.preview}
                                        alt={file.file.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(file.id);
                                            }}
                                            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-700" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notice */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2 text-sm">
                            <p className="font-semibold text-amber-800">주의사항</p>
                            <ul className="space-y-1.5 text-amber-700">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>지원 형식: JPG, PNG, WEBP 등 이미지 파일</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>파일 크기: 각 파일당 10MB 이하 권장</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>이미지 품질: 스캔한 이미지 사용</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>여러 이미지 선택 시 순서대로 채점됩니다</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>채점 완료 후 자동으로 데이터베이스에 저장됩니다</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Grade Button */}
                <Button
                    onClick={handleGrade}
                    disabled={!selectedExam || files.length === 0 || isGrading}
                    className={cn(
                        'w-full h-14 text-base font-semibold rounded-xl transition-all duration-300',
                        'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
                        'shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40',
                        'disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:cursor-not-allowed'
                    )}
                >
                    {isGrading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            채점 중...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            OMR 채점 시작 ({files.length}개 이미지)
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}
