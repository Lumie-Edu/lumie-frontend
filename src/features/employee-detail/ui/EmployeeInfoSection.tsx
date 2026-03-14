'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type Employee,
  type UpdateEmployeeInput,
  updateEmployeeSchema,
  useUpdateEmployee,
  EmploymentStatusLabel,
} from '@/entities/employee';
import { useActivePositions } from '@/entities/position';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Pencil, Save, X } from 'lucide-react';
import { formatPhoneNumber } from '@/src/shared/lib/format';

interface EmployeeInfoSectionProps {
  employee: Employee;
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

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-b-0">
      <dt className="text-sm font-medium text-muted-foreground sm:w-32 shrink-0">{label}</dt>
      <dd className="text-sm text-foreground mt-1 sm:mt-0">{value || '-'}</dd>
    </div>
  );
}

export function EmployeeInfoSection({ employee }: EmployeeInfoSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoValue, setMemoValue] = useState(employee.adminMemo ?? '');
  const { mutate: updateEmployee, isPending: isMemoSaving } = useUpdateEmployee(employee.id);

  const handleSaveMemo = () => {
    updateEmployee(
      { userLoginId: employee.userLoginId, adminMemo: memoValue },
      { onSuccess: () => setIsEditingMemo(false) },
    );
  };

  const handleCancelMemo = () => {
    setMemoValue(employee.adminMemo ?? '');
    setIsEditingMemo(false);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* 프로필 정보 */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-md shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{employee.name}</h2>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            <StatusBadge status={employee.employmentStatus || 'ACTIVE'} />
          </div>
        </div>
        <dl className="space-y-0">
          <InfoRow label="아이디" value={employee.userLoginId} />
          <InfoRow label="전화번호" value={employee.phone ? formatPhoneNumber(employee.phone) : undefined} />
          <InfoRow label="이메일" value={employee.email} />
          <InfoRow label="직책" value={employee.position?.name} />
          <InfoRow label="학원" value={employee.academies?.map((a) => a.name).join(', ')} />
        </dl>
      </div>

      {/* 메모 */}
      <div className="bg-white rounded-xl border p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">메모</h3>
          {!isEditingMemo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingMemo(true)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              수정
            </Button>
          )}
        </div>

        {isEditingMemo ? (
          <div className="space-y-3">
            <Textarea
              value={memoValue}
              onChange={(e) => setMemoValue(e.target.value)}
              rows={5}
              placeholder="메모를 입력하세요..."
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveMemo} disabled={isMemoSaving}>
                <Save className="h-4 w-4 mr-1" />
                저장
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelMemo}
                disabled={isMemoSaving}
              >
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap flex-1">
            {employee.adminMemo || '메모가 없습니다.'}
          </p>
        )}
      </div>

      <EditEmployeeModal
        employee={employee}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}

interface EditEmployeeModalProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditEmployeeModal({ employee, open, onOpenChange }: EditEmployeeModalProps) {
  const { data: positions } = useActivePositions();
  const { mutate: updateEmployee, isPending } = useUpdateEmployee(employee.id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateEmployeeInput>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      userLoginId: employee.userLoginId,
      name: employee.name,
      phone: employee.phone || '',
      email: employee.email || '',
      positionId: employee.position?.id ?? null,
      adminMemo: employee.adminMemo || '',
    },
  });

  const onSubmit = (data: UpdateEmployeeInput) => {
    updateEmployee(data, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>직원 정보 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>이름</Label>
            <Input {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>전화번호</Label>
            <Input type="tel" {...register('phone')} />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>이메일</Label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>직책</Label>
            <Controller
              name="positionId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() ?? ''}
                  onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="직책 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>메모</Label>
            <Input {...register('adminMemo')} placeholder="직원 관련 메모" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
            <Button type="submit" disabled={isPending}>{isPending ? '저장 중...' : '저장'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
