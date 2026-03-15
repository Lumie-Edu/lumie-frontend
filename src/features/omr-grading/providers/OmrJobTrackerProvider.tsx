'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useOmrJobStatus, type OmrJobStatusResponse } from '../api/queries';

const ACTIVE_JOB_KEY = 'lumie-omr-active-job';
const NOTIFICATION_KEY = 'lumie-omr-notification';

interface ActiveJob {
    jobId: number;
    examId: number;
    examName: string;
}

export interface OmrNotification {
    jobId: number;
    examId: number;
    examName: string;
    status: 'COMPLETED' | 'FAILED';
    result: OmrJobStatusResponse;
    timestamp: number;
}

interface OmrJobTrackerContextType {
    activeJob: ActiveJob | null;
    jobStatus: OmrJobStatusResponse | undefined;
    notification: OmrNotification | null;
    trackJob: (jobId: number, examId: number, examName: string) => void;
    clearJob: () => void;
    dismissNotification: () => void;
}

const OmrJobTrackerContext = createContext<OmrJobTrackerContextType | null>(null);

// --- localStorage helpers (SSR-safe) ---

function getStored<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

function setStored<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore
    }
}

function removeStored(key: string): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(key);
    } catch {
        // ignore
    }
}

// --- Browser Notification helper ---

function sendBrowserNotification(title: string, body: string) {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
        new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                new Notification(title, { body });
            }
        });
    }
}

export function OmrJobTrackerProvider({ children }: { children: ReactNode }) {
    const [activeJob, setActiveJob] = useState<ActiveJob | null>(() => getStored(ACTIVE_JOB_KEY));
    const [notification, setNotification] = useState<OmrNotification | null>(() => getStored(NOTIFICATION_KEY));

    const trackJob = useCallback((jobId: number, examId: number, examName: string) => {
        const job = { jobId, examId, examName };
        setActiveJob(job);
        setStored(ACTIVE_JOB_KEY, job);

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const clearJob = useCallback(() => {
        setActiveJob(null);
        removeStored(ACTIVE_JOB_KEY);
    }, []);

    const dismissNotification = useCallback(() => {
        setNotification(null);
        removeStored(NOTIFICATION_KEY);
    }, []);

    // Poll job status
    const { data: jobStatus } = useOmrJobStatus(
        activeJob?.examId ?? 0,
        activeJob?.jobId ?? null,
    );

    // Handle completion / failure
    useEffect(() => {
        if (!jobStatus || !activeJob) return;

        if (jobStatus.status === 'COMPLETED' || jobStatus.status === 'FAILED') {
            const newNotification: OmrNotification = {
                jobId: activeJob.jobId,
                examId: activeJob.examId,
                examName: activeJob.examName,
                status: jobStatus.status,
                result: jobStatus,
                timestamp: Date.now(),
            };

            setNotification(newNotification);
            setStored(NOTIFICATION_KEY, newNotification);
            clearJob();

            if (jobStatus.status === 'COMPLETED') {
                sendBrowserNotification('OMR 채점 완료', `"${activeJob.examName}" 채점이 완료되었습니다.`);
            } else {
                sendBrowserNotification('OMR 채점 실패', `"${activeJob.examName}" 채점 중 오류가 발생했습니다.`);
            }
        }
    }, [jobStatus, activeJob, clearJob]);

    return (
        <OmrJobTrackerContext.Provider value={{
            activeJob,
            jobStatus,
            notification,
            trackJob,
            clearJob,
            dismissNotification,
        }}>
            {children}
        </OmrJobTrackerContext.Provider>
    );
}

export function useOmrJobTracker() {
    const context = useContext(OmrJobTrackerContext);
    if (!context) {
        throw new Error('useOmrJobTracker must be used within OmrJobTrackerProvider');
    }
    return context;
}
