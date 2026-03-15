'use client';

import { useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ENV } from '@/src/shared/config/env';
import { storage } from '@/src/shared/lib/storage';

interface OmrImageButtonProps {
    examId: number;
    resultId: number;
    variant?: 'default' | 'ghost' | 'outline';
    size?: 'default' | 'sm' | 'icon';
    label?: string;
}

async function fetchOmrImageBlob(examId: number, resultId: number): Promise<string> {
    const tenantSlug = storage.getTenantSlug();
    const response = await fetch(
        `${ENV.EXAM_SERVICE_URL}/api/v1/exams/${examId}/results/${resultId}/omr-image`,
        {
            credentials: 'include',
            headers: tenantSlug ? { 'X-Tenant-Slug': tenantSlug } : {},
        }
    );
    if (!response.ok) throw new Error();
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

export function OmrImageButton({
    examId,
    resultId,
    variant = 'ghost',
    size = 'sm',
    label,
}: OmrImageButtonProps) {
    const [open, setOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleOpen = async () => {
        setOpen(true);
        setLoading(true);

        try {
            const url = await fetchOmrImageBlob(examId, resultId);
            setImageUrl(url);
        } catch {
            // 이미지 없으면 그냥 빈 상태로 보여줌
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
            setImageUrl(null);
        }
    };

    return (
        <>
            <Button variant={variant} size={size} onClick={handleOpen}>
                <ImageIcon className="w-4 h-4" />
                {label && <span className="ml-1">{label}</span>}
            </Button>

            <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="px-6 pt-6 pb-3">
                        <DialogTitle>OMR 원본 이미지</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto px-6 pb-6 flex items-center justify-center min-h-[300px]">
                        {loading ? (
                            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                        ) : imageUrl ? (
                            <img
                                src={imageUrl}
                                alt="OMR 원본 이미지"
                                className="max-w-full max-h-[75vh] object-contain rounded-lg"
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">이미지가 없습니다</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
