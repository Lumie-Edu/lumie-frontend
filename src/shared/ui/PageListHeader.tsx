import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';

interface PageListHeaderProps {
  title: string;
  count?: number;
  /** 카운트 뒤에 붙는 단위 (예: '명', '개'). 기본값 '명' */
  countUnit?: string;
  children?: ReactNode;
}

export function PageListHeader({ title, count, countUnit = '명', children }: PageListHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 smalltablet:gap-3">
      <h1 className="text-2xl smalltablet:text-3xl font-bold whitespace-nowrap">{title}</h1>
      {count !== undefined && (
        <Badge variant="secondary" className="text-base px-3 py-1">
          총 {count}{countUnit}
        </Badge>
      )}
      <div className="flex-1" />
      {children}
    </div>
  );
}
