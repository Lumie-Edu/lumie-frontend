'use client';

import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PendingAction } from '../model/schema';

interface PendingActionCardProps {
  action: PendingAction;
  onConfirm: () => void;
  onDeny: () => void;
  isLoading: boolean;
}

export function PendingActionCard({
  action,
  onConfirm,
  onDeny,
  isLoading,
}: PendingActionCardProps) {
  return (
    <div className="mx-11 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-1 text-xs font-medium text-amber-700">
        실행 확인 필요
      </p>
      <p className="mb-3 text-sm text-amber-900">{action.description}</p>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onConfirm}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Check className="mr-1 h-3.5 w-3.5" />
          승인
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDeny}
          disabled={isLoading}
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          거부
        </Button>
      </div>
    </div>
  );
}
