'use client';

import { useRouter } from 'next/navigation';
import {
  useEmployee,
  useDeactivateEmployee,
  useReactivateEmployee,
  useTerminateEmployee,
  useDeleteEmployee,
  EmploymentStatusLabel,
} from '@/entities/employee';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, User, MoreHorizontal, UserMinus, UserPlus, UserX, Trash2 } from 'lucide-react';
import { formatPhoneNumber, formatTenure } from '@/src/shared/lib/format';
import { EmployeeInfoSection } from './EmployeeInfoSection';
import { WorkScheduleTab } from './WorkScheduleTab';
import { SalaryTab } from './SalaryTab';
import { AttendanceTab } from './AttendanceTab';
import { ContractTab } from './ContractTab';

interface EmployeeDetailPageProps {
  employeeId: number;
}

function StatusBadge({ status }: { status: string }) {
  const label = EmploymentStatusLabel[status as keyof typeof EmploymentStatusLabel] ?? status;
  const colorMap: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700 border-green-200',
    INACTIVE: 'bg-gray-100 text-gray-600 border-gray-200',
    ON_LEAVE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    TERMINATED: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <Badge variant="outline" className={`${colorMap[status] ?? ''}`}>
      {label}
    </Badge>
  );
}

export function EmployeeDetailPage({ employeeId }: EmployeeDetailPageProps) {
  const router = useRouter();
  const { data: employee, isLoading, error } = useEmployee(employeeId);
  const { mutate: deactivate } = useDeactivateEmployee();
  const { mutate: reactivate } = useReactivateEmployee();
  const { mutate: terminate } = useTerminateEmployee();
  const { mutate: deleteEmployee } = useDeleteEmployee();

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
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>
      </div>
    );
  }

  const handleDeactivate = () => {
    if (confirm('직원을 비활성화하시겠습니까?')) deactivate(employee.id);
  };
  const handleReactivate = () => {
    if (confirm('직원을 재활성화하시겠습니까?')) reactivate(employee.id);
  };
  const handleTerminate = () => {
    if (confirm('직원을 퇴직 처리하시겠습니까?')) terminate(employee.id);
  };
  const handleDelete = () => {
    if (confirm('직원을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteEmployee(employee.id, {
        onSuccess: () => router.push('/admin/staff'),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/staff')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-md">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{employee.name}</h1>
              <StatusBadge status={employee.employmentStatus || 'ACTIVE'} />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {employee.position && <span>{employee.position.name}</span>}
              {employee.phone && <span>{formatPhoneNumber(employee.phone)}</span>}
              {employee.hireDate && <span>근속 {formatTenure(employee.hireDate)}</span>}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {employee.isActive ? (
              <>
                <DropdownMenuItem className="text-orange-600" onClick={handleDeactivate}>
                  <UserMinus className="mr-2 h-4 w-4" />
                  비활성화
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleTerminate}>
                  <UserX className="mr-2 h-4 w-4" />
                  퇴직 처리
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem className="text-green-600" onClick={handleReactivate}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  재활성화
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
          <TabsTrigger value="info">기본정보</TabsTrigger>
          <TabsTrigger value="schedule">근무</TabsTrigger>
          <TabsTrigger value="salary">급여</TabsTrigger>
          <TabsTrigger value="attendance" className="hidden sm:inline-flex">출퇴근</TabsTrigger>
          <TabsTrigger value="contract" className="hidden sm:inline-flex">계약</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <EmployeeInfoSection employee={employee} />
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <WorkScheduleTab adminId={employee.id} />
        </TabsContent>

        <TabsContent value="salary" className="mt-6">
          <SalaryTab adminId={employee.id} />
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceTab adminId={employee.id} />
        </TabsContent>

        <TabsContent value="contract" className="mt-6">
          <ContractTab employee={employee} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
