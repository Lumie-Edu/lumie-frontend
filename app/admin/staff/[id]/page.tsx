'use client';

import { use } from 'react';
import { EmployeeDetailPage } from '@/features/employee-detail/ui/EmployeeDetailPage';

export default function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EmployeeDetailPage employeeId={Number(id)} />;
}
