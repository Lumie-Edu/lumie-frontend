'use client';

import { User, Trash2, Phone } from 'lucide-react';
import { Staff } from '../model/schema';
import { Button } from '@/components/ui/button';
import { formatPhoneNumber } from '@/src/shared/lib/format';

interface StaffCardProps {
  staff: Staff;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

export function StaffCard({ staff, onDelete, isDeleting }: StaffCardProps) {
  const handleDelete = () => {
    if (!window.confirm(`정말 삭제하시겠습니까? (${staff.name})`)) return;
    onDelete?.(staff.id);
  };

  return (
    <div className="group">
      <div className="relative p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
        {/* 헤더 영역 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* 아바타 */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {staff.name}
              </h3>
              {staff.position && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {staff.position.name}
                </span>
              )}
            </div>
          </div>

          {/* 삭제 버튼 */}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-9 w-9 p-0 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>

        {/* 하단 정보 */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <span>{staff.phone ? formatPhoneNumber(staff.phone) : '-'}</span>
          </div>
        </div>

        {/* 호버 효과 */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
}
