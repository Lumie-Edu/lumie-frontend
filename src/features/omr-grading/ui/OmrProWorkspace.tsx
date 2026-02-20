'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Upload, Image as ImageIcon, X, Loader2, Sparkles,
    FileCheck, ShieldAlert, CheckCircle2, XCircle, Phone, RotateCcw, ArrowLeft,
    ClipboardCheck, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    useSubmitOmrGrading,
    useOmrJobStatus,
    useOmrJobs,
    MAX_IMAGES,
    type BatchOmrResult,
    type OmrJobStatusResponse,
} from '../api/queries';
import { type Exam } from '@/entities/exam';
import { formatPhoneNumber } from '@/src/shared/lib/format';

interface OmrProWorkspaceProps {
    selectedExam: Exam | null;
    onBack?: () => void;
}

interface UploadedFile {
    id: string;
    file: File;
    preview: string;
}

function getGradeColor(grade: number) {
    if (grade <= 2) return 'text-emerald-600 bg-emerald-50';
    if (grade <= 4) return 'text-blue-600 bg-blue-50';
    if (grade <= 6) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
}

function ResultCard({ result, index }: { result: BatchOmrResult; index: number }) {
    if (!result.success) {
        return (
            <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                        <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{result.fileName}</p>
                        <p className="text-sm text-red-500">{result.error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const phoneDisplay = result.phoneNumber
        ? formatPhoneNumber(result.phoneNumber)
        : '-';

    return (
        <div className={cn(
            "bg-white rounded-xl border shadow-sm overflow-hidden",
            result.saved ? "border-gray-200" : "border-amber-300"
        )}>
            <div className="p-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full text-sm font-bold text-gray-600">
                    {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{phoneDisplay}</span>
                        {result.studentName && (
                            <span className="text-sm text-gray-500">({result.studentName})</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500 truncate">{result.fileName}</p>
                        {result.saved ? (
                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> 저장됨
                            </span>
                        ) : (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> {result.error || '저장 안됨'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{result.totalScore}점</p>
                    </div>
                    {result.grade && (
                        <div className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-bold",
                            getGradeColor(result.grade)
                        )}>
                            {result.grade}등급
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function OmrProWorkspace({ selectedExam, onBack }: OmrProWorkspaceProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [activeJobId, setActiveJobId] = useState<number | null>(null);
    const [completedJob, setCompletedJob] = useState<OmrJobStatusResponse | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const submitMutation = useSubmitOmrGrading();

    // Poll for job status
    const { data: jobStatus } = useOmrJobStatus(
        selectedExam?.id ?? 0,
        activeJobId
    );

    // Check for existing in-progress jobs on mount
    const { data: existingJobs } = useOmrJobs(selectedExam?.id ?? null);

    // Auto-resume: only re-attach to in-progress jobs
    useEffect(() => {
        if (!existingJobs || activeJobId) return;
        const processingJob = existingJobs.find(
            (j) => j.status === 'PENDING' || j.status === 'PROCESSING'
        );
        if (processingJob) {
            setActiveJobId(processingJob.jobId);
        }
    }, [existingJobs, activeJobId]);

    // Handle job completion
    useEffect(() => {
        if (!jobStatus) return;
        if (jobStatus.status === 'COMPLETED' || jobStatus.status === 'FAILED') {
            setCompletedJob(jobStatus);
            setActiveJobId(null);
        }
    }, [jobStatus]);

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

        try {
            const response = await submitMutation.mutateAsync({
                examId: selectedExam.id,
                images: files.map((f) => f.file),
            });

            // Start polling for job status
            setActiveJobId(response.jobId);

            // Clear file previews
            files.forEach((f) => URL.revokeObjectURL(f.preview));
            setFiles([]);
        } catch {
            // Error handled in mutation
        }
    };

    const handleReset = () => {
        setCompletedJob(null);
        setActiveJobId(null);
        setFiles([]);
    };

    const isSubmitting = submitMutation.isPending;
    const isProcessing = !!activeJobId;
    const progressPercent = jobStatus
        ? jobStatus.totalImages > 0
            ? Math.round((jobStatus.processedImages / jobStatus.totalImages) * 100)
            : 0
        : 0;

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

    // Results View
    if (completedJob) {
        const results = (completedJob.results ?? []) as BatchOmrResult[];
        const successCount = completedJob.successCount;
        const failCount = completedJob.failCount;
        const savedCount = completedJob.savedCount;
        const avgScore = successCount > 0
            ? Math.round(results.filter(r => r.success && r.totalScore != null).reduce((sum, r) => sum + (r.totalScore || 0), 0) / successCount)
            : 0;

        return (
            <div className="flex-1 flex flex-col h-full bg-gray-50/50">
                <div className="px-4 tablet:px-8 py-4 tablet:py-5 bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {onBack && (
                                <Button variant="ghost" size="sm" onClick={onBack} className="tablet:hidden -ml-1 p-1.5">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            )}
                            <div>
                                <h2 className="text-xl tablet:text-2xl font-bold text-gray-900">채점 결과</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedExam.name} - 총 {completedJob.totalImages}명
                                    {completedJob.status === 'FAILED' && (
                                        <span className="ml-2 text-red-500 font-medium">처리 중 오류 발생</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <Button onClick={handleReset} variant="outline" className="gap-2">
                            <RotateCcw className="w-4 h-4" />
                            새로 채점하기
                        </Button>
                    </div>

                    {/* Grading Completion Indicator */}
                    <div className="mt-4">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-2 rounded-full",
                                completedJob.status === 'COMPLETED' ? "bg-emerald-100" : "bg-red-100"
                            )}>
                                {completedJob.status === 'COMPLETED' ? (
                                    <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>{completedJob.status === 'COMPLETED' ? '채점 완료' : '채점 실패'}</span>
                                    <span className="text-muted-foreground">
                                        {completedJob.processedImages} / {completedJob.totalImages}장 · 성공 {successCount} · 저장 {savedCount} · 실패 {failCount}
                                    </span>
                                </div>
                                <Progress
                                    value={100}
                                    className="h-2"
                                    indicatorClassName={completedJob.status === 'COMPLETED' ? "bg-emerald-500" : "bg-red-500"}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4 mt-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500">총 인원</p>
                            <p className="text-2xl font-bold text-gray-900">{completedJob.totalImages}명</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-4">
                            <p className="text-sm text-emerald-600">채점 성공</p>
                            <p className="text-2xl font-bold text-emerald-700">{successCount}명</p>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-4">
                            <p className="text-sm text-indigo-600">DB 저장</p>
                            <p className="text-2xl font-bold text-indigo-700">{savedCount}명</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4">
                            <p className="text-sm text-red-600">실패</p>
                            <p className="text-2xl font-bold text-red-700">{failCount}명</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4">
                            <p className="text-sm text-blue-600">평균 점수</p>
                            <p className="text-2xl font-bold text-blue-700">{avgScore}점</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="space-y-3 max-w-4xl mx-auto">
                        {results.length > 0 ? (
                            results.map((result, index) => (
                                <ResultCard key={result.fileName + index} result={result} index={index} />
                            ))
                        ) : (
                            <div className="text-center py-16 text-gray-500">
                                <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="font-medium">개별 결과 데이터가 없습니다</p>
                                <p className="text-sm mt-1">위의 요약 정보를 확인해주세요</p>
                            </div>
                        )}
                    </div>
                </div>
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
                        disabled={isSubmitting || isProcessing}
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

            {/* Grading Progress Indicator */}
            {(isSubmitting || isProcessing) && (
                <div className="px-4 tablet:px-8 py-3 bg-white border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-100 rounded-full">
                            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between text-sm font-medium">
                                <span>{isSubmitting ? '이미지 업로드 중...' : '답안지 채점 중'}</span>
                                <span className="text-muted-foreground">
                                    {isSubmitting
                                        ? '서버로 전송하고 있습니다'
                                        : jobStatus
                                            ? `${jobStatus.processedImages} / ${jobStatus.totalImages}장 (${progressPercent}%)`
                                            : '채점 준비 중...'
                                    }
                                </span>
                            </div>
                            <Progress
                                value={isSubmitting ? undefined : progressPercent}
                                className={cn("h-2", isSubmitting && "animate-pulse")}
                                indicatorClassName="bg-indigo-600"
                            />
                        </div>
                    </div>
                    {isSubmitting ? (
                        <p className="text-xs text-amber-600 mt-2 ml-[52px]">
                            업로드가 완료될 때까지 페이지를 닫지 마세요
                        </p>
                    ) : (
                        <p className="text-xs text-emerald-600 mt-2 ml-[52px]">
                            브라우저를 닫아도 채점은 서버에서 계속 진행됩니다
                        </p>
                    )}
                </div>
            )}

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
