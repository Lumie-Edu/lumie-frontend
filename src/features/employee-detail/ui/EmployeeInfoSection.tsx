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
  ContractTypeLabel,
} from '@/entities/employee';
import { useActivePositions } from '@/entities/position';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Pencil, Mail, Phone, Building2, Briefcase, Calendar, IdCard } from 'lucide-react';
import { formatPhoneNumber, formatDate } from '@/src/shared/lib/format';

interface EmployeeInfoSectionProps {
  employee: Employee;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | undefined | null }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || '-'}</p>
      </div>
    </div>
  );
}

export function EmployeeInfoSection({ employee }: EmployeeInfoSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">기본 정보</h2>
        <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          수정
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0">
        <div className="divide-y">
          <InfoRow icon={IdCard} label="아이디" value={employee.userLoginId} />
          <InfoRow icon={Phone} label="전화번호" value={employee.phone ? formatPhoneNumber(employee.phone) : undefined} />
          <InfoRow icon={Mail} label="이메일" value={employee.email} />
          <InfoRow icon={Briefcase} label="직책" value={employee.position?.name} />
        </div>
        <div className="divide-y">
          <InfoRow icon={Building2} label="학원" value={employee.academies?.map((a) => a.name).join(', ')} />
          <InfoRow icon={Calendar} label="입사일" value={employee.hireDate ? formatDate(employee.hireDate) : undefined} />
          <InfoRow
            icon={Calendar}
            label="계약 유형"
            value={employee.contractType ? ContractTypeLabel[employee.contractType as keyof typeof ContractTypeLabel] : undefined}
          />
          <InfoRow
            icon={Calendar}
            label="상태"
            value={employee.employmentStatus ? EmploymentStatusLabel[employee.employmentStatus as keyof typeof EmploymentStatusLabel] : undefined}
          />
        </div>
      </div>

      {employee.adminMemo && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">메모</p>
          <p className="text-sm whitespace-pre-wrap">{employee.adminMemo}</p>
        </div>
      )}

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
      name: employee.name,
      phone: employee.phone || '',
      email: employee.email || '',
      positionId: employee.position?.id ?? null,
      hireDate: employee.hireDate || '',
      contractType: employee.contractType || '',
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
            <Label>입사일</Label>
            <Input type="date" {...register('hireDate')} />
          </div>

          <div className="space-y-2">
            <Label>계약 유형</Label>
            <Controller
              name="contractType"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="계약 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ContractTypeLabel).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
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
