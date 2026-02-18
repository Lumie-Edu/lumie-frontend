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
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface TableFilterProps {
  filters: FilterDefinition[];
  onReset?: () => void;
}

export function TableFilter({ filters, onReset }: TableFilterProps) {
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
      <PopoverContent align="end" className="w-64 space-y-4">
        {filters.map((filter) => (
          <div key={filter.key} className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{filter.label}</Label>
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
