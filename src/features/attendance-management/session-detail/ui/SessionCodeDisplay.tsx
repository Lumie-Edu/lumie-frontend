'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRegenerateCode } from '@/entities/attendance';

interface SessionCodeDisplayProps {
  code: string;
  sessionId: number;
  isOpen: boolean;
}

export function SessionCodeDisplay({ code, sessionId, isOpen }: SessionCodeDisplayProps) {
  const { mutate: regenerateCode, isPending } = useRegenerateCode();

  const handleRegenerate = () => {
    if (confirm('새로운 출석 코드를 생성하시겠습니까?')) {
      regenerateCode(sessionId);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-3xl font-bold tracking-widest">{code}</span>
      {isOpen && (
        <Button variant="outline" size="icon" onClick={handleRegenerate} disabled={isPending} className="h-8 w-8">
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
