'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { useOmrJobTracker, type OmrNotification } from '../providers/OmrJobTrackerProvider';
import { OmrResultModal } from './OmrResultModal';

export function OmrNotificationBell() {
    const { activeJob, jobStatus, notification, dismissNotification } = useOmrJobTracker();
    const [open, setOpen] = useState(false);
    const [modalNotification, setModalNotification] = useState<OmrNotification | null>(null);

    const hasNotification = !!notification;
    const isProcessing = !!activeJob;
    const hasContent = hasNotification || isProcessing;

    const progressPercent = jobStatus && jobStatus.totalImages > 0
        ? Math.round((jobStatus.processedImages / jobStatus.totalImages) * 100)
        : 0;

    const handleViewResult = () => {
        if (!notification) return;
        setModalNotification(notification);
        dismissNotification();
        setOpen(false);
    };

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button className="relative p-2 rounded-md hover:bg-accent transition-colors">
                        <Bell className={cn("w-5 h-5", hasContent ? "text-foreground" : "text-muted-foreground")} />
                        {hasNotification && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-background" />
                        )}
                        {isProcessing && !hasNotification && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-background animate-pulse" />
                        )}
                    </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                    <div className="px-4 py-3 border-b">
                        <p className="text-sm font-semibold">알림</p>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {/* Processing job */}
                        {isProcessing && (
                            <div className="px-4 py-3 border-b last:border-b-0">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-indigo-100 rounded-full mt-0.5">
                                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {activeJob.examName}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {jobStatus
                                                ? `채점 중 ${jobStatus.processedImages} / ${jobStatus.totalImages}장`
                                                : '채점 준비 중...'
                                            }
                                        </p>
                                        {jobStatus && (
                                            <Progress
                                                value={progressPercent}
                                                className="h-1.5 mt-2"
                                                indicatorClassName="bg-indigo-600"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completed/Failed notification */}
                        {notification && (
                            <div className="px-4 py-3 border-b last:border-b-0 bg-accent/30">
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "p-1.5 rounded-full mt-0.5",
                                        notification.status === 'COMPLETED' ? "bg-emerald-100" : "bg-red-100"
                                    )}>
                                        {notification.status === 'COMPLETED' ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {notification.examName}
                                                </p>
                                                <p className={cn(
                                                    "text-xs mt-0.5",
                                                    notification.status === 'COMPLETED' ? "text-emerald-600" : "text-red-600"
                                                )}>
                                                    {notification.status === 'COMPLETED'
                                                        ? `채점 완료 · 성공 ${notification.result.successCount} · 실패 ${notification.result.failCount}`
                                                        : '채점 중 오류가 발생했습니다'
                                                    }
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    dismissNotification();
                                                }}
                                                className="p-0.5 rounded hover:bg-accent transition-colors shrink-0"
                                            >
                                                <X className="w-3.5 h-3.5 text-muted-foreground" />
                                            </button>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="mt-2 h-7 text-xs"
                                            onClick={handleViewResult}
                                        >
                                            결과 보기
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!hasContent && (
                            <div className="px-4 py-8 text-center">
                                <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">알림이 없습니다</p>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            <OmrResultModal
                notification={modalNotification}
                open={!!modalNotification}
                onClose={() => setModalNotification(null)}
            />
        </>
    );
}
