'use client';

import { useRouter } from 'next/navigation';
import { useEmployee } from '@/entities/employee';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBreadcrumb } from '@/src/shared/lib/breadcrumb';
import { EmployeeInfoSection } from './EmployeeInfoSection';
import { AdminPermissionEditor } from '@/features/permission-management/ui/AdminPermissionEditor';

interface EmployeeDetailPageProps {
  employeeId: number;
}

export function EmployeeDetailPage({ employeeId }: EmployeeDetailPageProps) {
  const router = useRouter();
  const { data: employee, isLoading, error } = useEmployee(employeeId);

  useBreadcrumb([
    { label: '직원 목록', href: '/admin/staff' },
    { label: employee?.name ?? '' },
  ]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">직원 정보를 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.push('/admin/staff')}>
          목록으로
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col tablet:flex-row gap-6">
      <aside className="tablet:w-96 tablet:shrink-0 flex flex-col">
        <EmployeeInfoSection employee={employee} />
      </aside>
      <div className="flex-1 min-w-0">
        <AdminPermissionEditor adminId={employee.id} />
      </div>
    </div>
  );
}
