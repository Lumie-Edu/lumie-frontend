'use client';

import { useReviewPopupSetting, useUpdateReviewPopupSetting } from '@/entities/review';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export function ReviewPopupToggle() {
  const { data: setting, isLoading } = useReviewPopupSetting();
  const { mutate: updateSetting, isPending } = useUpdateReviewPopupSetting();

  const handleToggle = (checked: boolean) => {
    updateSetting({ isReviewPopupOn: checked });
  };

  if (isLoading) {
    return <div className="h-5 w-20 animate-pulse rounded bg-muted" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="review-popup-toggle" className="text-sm whitespace-nowrap">
        리뷰 팝업
      </Label>
      <Switch
        id="review-popup-toggle"
        checked={setting?.isReviewPopupOn ?? false}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>활성화 시, 학생이 홈페이지에 접속하면<br />리뷰 작성을 요청하는 팝업이 표시됩니다.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
