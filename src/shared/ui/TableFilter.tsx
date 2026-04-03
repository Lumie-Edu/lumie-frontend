'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SlidersHorizontal } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDefinition {
  key: string;
  label: string;
  value: string;
  defaultValue: string;
  /** 'select' (기본값) 또는 'date' */
  type?: 'select' | 'date';
  options?: FilterOption[];
  onChange: (value: string) => void;
}

interface TableFilterProps {
  filters: FilterDefinition[];
  onReset?: () => void;
  popoverClassName?: string;
}

export function TableFilter({ filters, onReset, popoverClassName }: TableFilterProps) {
  const [open, setOpen] = useState(false);
  const activeCount = filters.filter((f) => f.value !== f.defaultValue).length;

  const handleReset = () => {
    filters.forEach((f) => f.onChange(f.defaultValue));
    onReset?.();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          필터
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className={`space-y-4 ${popoverClassName ?? 'w-64'}`}>
        {filters.map((filter) => (
          <div key={filter.key} className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{filter.label}</Label>
            {filter.type === 'date' ? (
              <Input
                type="date"
                lang="ko"
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="h-9"
              />
            ) : (
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
                  {filter.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleReset}>
            초기화
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
