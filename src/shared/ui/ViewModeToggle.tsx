'use client';

import { Button } from '@/components/ui/button';
import { LayoutGrid, TableIcon } from 'lucide-react';

export type ViewMode = 'table' | 'card';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="hidden smalltablet:flex border rounded-lg">
      <Button
        variant={value === 'table' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-9 w-9 rounded-r-none"
        onClick={() => onChange('table')}
      >
        <TableIcon className="h-4 w-4" />
      </Button>
      <Button
        variant={value === 'card' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-9 w-9 rounded-l-none"
        onClick={() => onChange('card')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
