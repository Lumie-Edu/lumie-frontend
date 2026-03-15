'use client';

import { CheckCircle2, XCircle, Phone, ShieldAlert, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { type OmrNotification } from '../providers/OmrJobTrackerProvider';
import { type BatchOmrResult } from '../api/queries';
import { formatPhoneNumber } from '@/src/shared/lib/format';
import { OmrImageButton } from './OmrImageButton';

interface OmrResultModalProps {
    notification: OmrNotification | null;
    open: boolean;
    onClose: () => void;
}

function getGradeColor(grade: number) {
    if (grade <= 2) return 'text-emerald-600 bg-emerald-50';
    if (grade <= 4) return 'text-blue-600 bg-blue-50';
    if (grade <= 6) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
}

export function OmrResultModal({ notification, open, onClose }: OmrResultModalProps) {
    if (!notification) return null;

    const { result, examName, examId } = notification;
    const results = (result.results ?? []) as BatchOmrResult[];
    const { successCount, failCount, savedCount, totalImages } = result;
    const avgScore = successCount > 0
        ? Math.round(
            results
                .filter(r => r.success && r.totalScore != null)
                .reduce((sum, r) => sum + (r.totalScore || 0), 0) / successCount
        )
        : 0;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-full",
                            result.status === 'COMPLETED' ? "bg-emerald-100" : "bg-red-100"
                        )}>
                            {result.status === 'COMPLETED' ? (
                                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                        <div>
                            <DialogTitle>
                                {result.status === 'COMPLETED' ? '채점 완료' : '채점 실패'}
                            </DialogTitle>
                            <DialogDescription>{examName}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {/* Summary stats */}
                    <div className="px-6 py-4 border-b">
                        <div className="flex items-center gap-3 mb-3">
                            <Progress
                                value={100}
                                className="h-2 flex-1"
                                indicatorClassName={result.status === 'COMPLETED' ? "bg-emerald-500" : "bg-red-500"}
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {result.processedImages} / {totalImages}장
                            </span>
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-500">총 인원</p>
                                <p className="text-lg font-bold text-gray-900">{totalImages}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-emerald-600">성공</p>
                                <p className="text-lg font-bold text-emerald-700">{successCount}</p>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-indigo-600">저장</p>
                                <p className="text-lg font-bold text-indigo-700">{savedCount}</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-red-600">실패</p>
                                <p className="text-lg font-bold text-red-700">{failCount}</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-blue-600">평균</p>
                                <p className="text-lg font-bold text-blue-700">{avgScore}점</p>
                            </div>
                        </div>
                    </div>

                    {/* Individual results */}
                    <div className="px-6 py-4 space-y-2">
                        {results.length > 0 ? (
                            results.map((r, i) => (
                                <ResultRow key={r.fileName + i} result={r} index={i} examId={examId} />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <ClipboardCheck className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm font-medium">개별 결과 데이터가 없습니다</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ResultRow({ result, index, examId }: { result: BatchOmrResult; index: number; examId: number }) {
    if (!result.success) {
        return (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-red-200 bg-red-50/50">
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-sm text-gray-900 truncate flex-1">{result.fileName}</span>
                <span className="text-xs text-red-500 shrink-0">{result.error}</span>
            </div>
        );
    }

    const phoneDisplay = result.phoneNumber ? formatPhoneNumber(result.phoneNumber) : '-';

    return (
        <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg border",
            result.saved ? "border-gray-200" : "border-amber-300 bg-amber-50/30"
        )}>
            <span className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-500 shrink-0">
                {index + 1}
            </span>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-sm font-medium text-gray-900">{phoneDisplay}</span>
                {result.studentName && (
                    <span className="text-xs text-gray-500 truncate">({result.studentName})</span>
                )}
                {result.saved ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {result.resultId && (
                    <OmrImageButton examId={examId} resultId={result.resultId} size="icon" />
                )}
                <span className="text-sm font-bold text-gray-900">{result.totalScore}점</span>
                {result.grade && (
                    <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold",
                        getGradeColor(result.grade)
                    )}>
                        {result.grade}등급
                    </span>
                )}
            </div>
        </div>
    );
}
