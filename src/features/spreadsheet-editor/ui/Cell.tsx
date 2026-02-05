'use client';

import { memo, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import type { CellData, CellLock } from '@/src/entities/spreadsheet';

interface CellProps {
  address: string;
  data?: CellData;
  lock?: CellLock;
  isSelected: boolean;
  isEditing: boolean;
  isLockedByOther: boolean;
  width?: number;
  height?: number;
  onSelect: (address: string) => void;
  onStartEdit: (address: string) => void;
  onStopEdit: () => void;
  onValueChange: (address: string, value: string) => void;
}

export const Cell = memo(function Cell({
  address,
  data,
  lock,
  isSelected,
  isEditing,
  isLockedByOther,
  width = 100,
  height = 24,
  onSelect,
  onStartEdit,
  onStopEdit,
  onValueChange,
}: CellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    onSelect(address);
  };

  const handleDoubleClick = () => {
    if (!isLockedByOther) {
      onStartEdit(address);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement | HTMLInputElement>) => {
    if (isEditing) {
      if (e.key === 'Enter') {
        onStopEdit();
      } else if (e.key === 'Escape') {
        onStopEdit();
      }
      return;
    }

    if (e.key === 'Enter' || e.key === 'F2') {
      if (!isLockedByOther) {
        e.preventDefault();
        onStartEdit(address);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onValueChange(address, e.target.value);
  };

  const handleBlur = () => {
    if (isEditing) {
      onStopEdit();
    }
  };

  const displayValue = data?.displayValue || data?.value || '';
  const style = data?.style;

  const cellStyle: React.CSSProperties = {
    width,
    minWidth: width,
    maxWidth: width,
    height,
    minHeight: height,
    backgroundColor: style?.backgroundColor || undefined,
    color: style?.textColor || undefined,
    fontFamily: style?.fontFamily || undefined,
    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight: style?.bold ? 'bold' : undefined,
    fontStyle: style?.italic ? 'italic' : undefined,
    textDecoration: style?.underline ? 'underline' : undefined,
    textAlign: (style?.horizontalAlign as 'left' | 'center' | 'right') || 'left',
    verticalAlign: style?.verticalAlign || 'middle',
  };

  return (
    <div
      className={cn(
        'relative border-b border-r border-gray-200 cursor-cell overflow-hidden',
        'hover:bg-gray-50 transition-colors',
        isSelected && 'ring-2 ring-blue-500 ring-inset z-10',
        isLockedByOther && 'bg-gray-100'
      )}
      style={cellStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isSelected ? 0 : -1}
      role="gridcell"
      aria-selected={isSelected}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full h-full px-1 border-none outline-none bg-white"
          defaultValue={data?.formula || data?.value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className="px-1 truncate leading-6">{displayValue}</div>
      )}

      {lock && (
        <div
          className="absolute top-0 right-0 w-2 h-2 rounded-bl"
          style={{ backgroundColor: lock.userColor }}
          title={`${lock.userName}님이 편집 중`}
        />
      )}
    </div>
  );
});
