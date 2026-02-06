'use client';

import { Student } from '../model/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/shared/ui/Card';
import { User, Phone, School, Calendar } from 'lucide-react';
import { formatPhoneNumber } from '@/src/shared/lib/format';

interface StudentCardProps {
  student: Student;
  onClick?: () => void;
}

export function StudentCard({ student, onClick }: StudentCardProps) {
  return (
    <Card
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          {student.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {student.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{formatPhoneNumber(student.phone)}</span>
          </div>
        )}
        {student.studentBirthYear && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{student.studentBirthYear}년생</span>
          </div>
        )}
        {student.studentHighschool && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <School className="w-4 h-4" />
            <span>{student.studentHighschool}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
