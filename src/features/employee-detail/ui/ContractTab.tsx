'use client';

import { useState } from 'react';
import {
  type Employee,
  type UpdateEmployeeInput,
  useUpdateEmployee,
  ContractTypeLabel,
} from '@/entities/employee';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
import { Pencil, FileText, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/src/shared/lib/format';

interface ContractTabProps {
  employee: Employee;
}

export function ContractTab({ employee }: ContractTabProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const contractType = employee.contractType;
  const startDate = employee.contractStartDate;
  const endDate = employee.contractEndDate;

  // Calculate progress
  let progressPercent = 0;
  let daysRemaining: number | null = null;
  let isExpiringSoon = false;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">계약 정보</h2>
        <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          수정
        </Button>
      </div>

      {!contractType && !startDate ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">계약 정보가 설정되지 않았습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 계약 카드 */}
          <div className="p-6 rounded-lg border bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">계약 유형</p>
                  {contractType && (
                    <Badge variant="secondary" className="mt-1">
                      {ContractTypeLabel[contractType as keyof typeof ContractTypeLabel] ?? contractType}
                    </Badge>
                  )}
                </div>
              </div>
              {isExpiringSoon && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">만료 임박</span>
                </div>
              )}
            </div>

            {startDate && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">계약 기간</span>
                  <span className="font-medium">
                    {formatDate(startDate)} ~ {endDate ? formatDate(endDate) : '무기한'}
                  </span>
                </div>

                {endDate && (
                  <>
                    <Progress value={progressPercent} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{Math.round(progressPercent)}% 경과</span>
                      {daysRemaining !== null && (
                        <span className={daysRemaining <= 0 ? 'text-red-600 font-medium' : ''}>
                          {daysRemaining > 0 ? `${daysRemaining}일 남음` : '만료됨'}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 입사일 */}
          {employee.hireDate && (
            <div className="p-4 rounded-lg border bg-white">
              <p className="text-sm text-muted-foreground">입사일</p>
              <p className="font-medium">{formatDate(employee.hireDate)}</p>
            </div>
          )}
        </div>
      )}

      <ContractEditDialog
        employee={employee}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}

interface ContractEditDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ContractEditDialog({ employee, open, onOpenChange }: ContractEditDialogProps) {
  const { mutate: updateEmployee, isPending } = useUpdateEmployee(employee.id);
  const [form, setForm] = useState({
    contractType: employee.contractType || '',
    contractStartDate: employee.contractStartDate || '',
    contractEndDate: employee.contractEndDate || '',
    hireDate: employee.hireDate || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployee(form as UpdateEmployeeInput, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>계약 정보 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>계약 유형</Label>
            <Select value={form.contractType} onValueChange={(v) => setForm({ ...form, contractType: v })}>
              <SelectTrigger>
                <SelectValue placeholder="계약 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ContractTypeLabel).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>입사일</Label>
            <Input
              type="date"
              value={form.hireDate}
              onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>계약 시작일</Label>
            <Input
              type="date"
              value={form.contractStartDate}
              onChange={(e) => setForm({ ...form, contractStartDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>계약 종료일</Label>
            <Input
              type="date"
              value={form.contractEndDate}
              onChange={(e) => setForm({ ...form, contractEndDate: e.target.value })}
            />
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
