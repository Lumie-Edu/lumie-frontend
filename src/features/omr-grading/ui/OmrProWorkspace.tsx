'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Upload, Image as ImageIcon, X, Loader2, Sparkles,
    FileCheck, ShieldAlert, ArrowLeft, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    useSubmitOmrGrading,
    MAX_IMAGES,
} from '../api/queries';
import { useOmrJobTracker } from '../providers/OmrJobTrackerProvider';
import { type Exam } from '@/entities/exam';

interface OmrProWorkspaceProps {
    selectedExam: Exam | null;
    onBack?: () => void;
}

interface UploadedFile {
    id: string;
    file: File;
    preview: string;
}

export function OmrProWorkspace({ selectedExam, onBack }: OmrProWorkspaceProps) {
    const { trackJob } = useOmrJobTracker();
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingCount, setUploadingCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const submitMutation = useSubmitOmrGrading({
        onUploadProgress: setUploadProgress,
    });

    const isSubmitting = submitMutation.isPending;

    // Prevent page close during upload
    useEffect(() => {
        if (!isSubmitting) return;
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isSubmitting]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!selectedExam) return;
        setIsDragging(true);
    }, [selectedExam]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!selectedExam) return;

        const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
            file.type.startsWith('image/')
        );
        addFiles(droppedFiles);
    }, [selectedExam]);

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
        setFiles((prev) => {
            const combined = [...prev, ...uploadedFiles];
            if (combined.length > MAX_IMAGES) {
                return combined.slice(0, MAX_IMAGES);
            }
            return combined;
        });
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

        setUploadProgress(0);
        setUploadingCount(files.length);
        try {
            const response = await submitMutation.mutateAsync({
                examId: selectedExam.id,
                images: files.map((f) => f.file),
            });

            trackJob(response.jobId, selectedExam.id, selectedExam.name);

            files.forEach((f) => URL.revokeObjectURL(f.preview));
            setFiles([]);
        } catch {
            // Error handled in mutation
        }
    };

    // Empty State
    if (!selectedExam) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/50">
                <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                    <FileCheck className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">시험을 선택해주세요</h3>
                <p className="text-gray-500 text-center max-w-sm">
                    좌측 목록에서 채점할 시험을 선택하면<br />
                    이곳에 답안지를 업로드할 수 있습니다.
                </p>
            </div>
        );
    }

    // Upload View
    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50/50">
            <div className="flex items-center justify-between px-4 tablet:px-8 py-4 tablet:py-5 bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <Button variant="ghost" size="sm" onClick={onBack} className="tablet:hidden -ml-1 p-1.5">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}
                    <div>
                    <h2 className="text-xl tablet:text-2xl font-bold text-gray-900">{selectedExam.name}</h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                            {selectedExam.category === 'PASS_FAIL'
                                ? '합격/불합격'
                                : selectedExam.gradingType === 'RELATIVE'
                                    ? `상대평가 · ${selectedExam.gradeScale === 'FIVE_GRADE' ? '5등급제' : '9등급제'}`
                                    : '절대평가'}
                        </span>
                        <span>-</span>
                        <span>총 {selectedExam.totalQuestions}문항</span>
                        <span>-</span>
                        <span className="text-amber-600">최대 {MAX_IMAGES}장</span>
                    </div>
                    </div>
                </div>

                {files.length > 0 && (
                    <Button
                        onClick={handleGrade}
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all rounded-full px-6"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {isSubmitting ? '제출 중...' : `${files.length}개 채점 시작`}
                    </Button>
                )}
            </div>

            {/* Upload Progress Modal */}
            <Dialog open={isSubmitting}>
                <DialogContent showCloseButton={false} onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-full">
                                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                            </div>
                            이미지 업로드 중...
                        </DialogTitle>
                        <DialogDescription>
                            서버로 답안지 이미지를 전송하고 있습니다. 업로드가 완료될 때까지 페이지를 닫거나 이동하지 마세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>{uploadingCount}개 이미지 전송 중</span>
                            <span className="text-indigo-600">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-3" indicatorClassName="bg-indigo-600" />
                        <p className="text-xs text-amber-600 flex items-center gap-1.5 mt-3">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            업로드 중 페이지를 벗어나면 채점이 시작되지 않습니다
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex-1 overflow-y-auto p-8">
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "min-h-[500px] rounded-3xl transition-all duration-300 relative group border-2 border-dashed",
                        isDragging
                            ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]"
                            : "border-gray-200 bg-white hover:border-indigo-300",
                        files.length > 0 && "border-solid bg-transparent border-transparent min-h-0"
                    )}
                >
                    {files.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <div className={cn(
                                "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300",
                                isDragging ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                            )}>
                                <Upload className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                답안지 이미지를 드래그하세요
                            </h3>
                            <p className="text-gray-500 mb-8">또는 클릭하여 파일 선택 (최대 {MAX_IMAGES}장)</p>

                            <div className="flex gap-6 text-xs text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <ImageIcon className="w-4 h-4" /> JPG, PNG
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <ShieldAlert className="w-4 h-4" /> 보안 전송
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30 flex flex-col items-center justify-center cursor-pointer transition-all group/add"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="p-3 rounded-full bg-gray-100 group-hover/add:bg-indigo-100 group-hover/add:text-indigo-600 transition-colors">
                                    <Upload className="w-6 h-6 text-gray-500 group-hover/add:text-indigo-600" />
                                </div>
                                <span className="mt-3 text-sm font-medium text-gray-600 group-hover/add:text-indigo-700">
                                    추가 업로드
                                </span>
                                <span className="text-xs text-gray-400 mt-1">
                                    {files.length} / {MAX_IMAGES}
                                </span>
                            </div>

                            {files.map((file) => (
                                <div key={file.id} className="relative group aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 hover:shadow-md hover:ring-indigo-500/30 transition-all">
                                    <img
                                        src={file.preview}
                                        alt="preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs truncate">{file.file.name}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all backdrop-blur-sm"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
