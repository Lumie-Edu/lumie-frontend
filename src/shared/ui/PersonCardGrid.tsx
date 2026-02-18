'use client';

import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Phone } from 'lucide-react';
import { formatPhoneNumber } from '@/src/shared/lib/format';

export interface PersonCardItem {
  id: number;
  name: string;
  phone?: string | null;
  subtitle?: string | null;
  badge?: ReactNode;
}

interface PersonCardGridProps {
  items: PersonCardItem[];
  onItemClick: (id: number) => void;
}

export function PersonCardGrid({ items, onItemClick }: PersonCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="group cursor-pointer"
          onClick={() => onItemClick(item.id)}
        >
          <div className="relative p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    {item.badge}
                  </div>
                  {item.subtitle && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span>{item.phone ? formatPhoneNumber(item.phone) : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PersonCardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div>
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}
