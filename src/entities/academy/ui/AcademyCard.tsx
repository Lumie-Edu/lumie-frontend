'use client';

import { Academy } from '../model/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/shared/ui/Card';
import { Building2, MapPin, Phone } from 'lucide-react';
import { formatPhoneNumber } from '@/src/shared/lib/format';

interface AcademyCardProps {
  academy: Academy;
  onClick?: () => void;
}

export function AcademyCard({ academy, onClick }: AcademyCardProps) {
  return (
    <Card
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          {academy.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {academy.address && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{academy.address}</span>
          </div>
        )}
        {academy.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{formatPhoneNumber(academy.phone)}</span>
          </div>
        )}
        {academy.description && (
          <p className="text-sm text-gray-500 mt-2">{academy.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
