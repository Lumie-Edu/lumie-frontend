'use client';

import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchOmrImageBlob } from '@/features/omr-grading/lib/fetchOmrImageBlob';

interface OmrImageInlineProps {
    examId: number;
    resultId: number;
}

type LoadState = 'loading' | 'ok' | 'error';

export function OmrImageInline({ examId, resultId }: OmrImageInlineProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [state, setState] = useState<LoadState>('loading');

    useEffect(() => {
        let cancelled = false;
        let createdUrl: string | null = null;

        setState('loading');
        setImageUrl(null);

        fetchOmrImageBlob(examId, resultId)
            .then((url) => {
                createdUrl = url;
                if (cancelled) {
                    URL.revokeObjectURL(url);
                    return;
                }
                setImageUrl(url);
                setState('ok');
            })
            .catch(() => {
                if (!cancelled) setState('error');
            });

        return () => {
            cancelled = true;
            if (createdUrl) URL.revokeObjectURL(createdUrl);
        };
    }, [examId, resultId]);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">OMR 원본 이미지</h3>
            </div>
            {state === 'loading' && <Skeleton className="w-full h-80 rounded-xl" />}
            {state === 'error' && (
                <div className="h-40 flex items-center justify-center text-sm text-gray-400">
                    OMR 이미지가 없습니다
                </div>
            )}
            {state === 'ok' && imageUrl && (
                <div className="flex justify-center bg-gray-50 rounded-xl p-2">
                    <img
                        src={imageUrl}
                        alt="OMR 원본 이미지"
                        className="max-w-full max-h-[560px] object-contain rounded-lg"
                    />
                </div>
            )}
        </div>
    );
}
