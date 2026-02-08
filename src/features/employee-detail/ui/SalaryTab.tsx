'use client';

import { useState } from 'react';
import {
  useCurrentSalary,
  useSalaryHistory,
  useCreateSalary,
  usePayrolls,
  useGeneratePayroll,
  useFinalizePayroll,
  useMarkPayrollPaid,
  PayrollStatusLabel,
  type CreateSalaryInput,
} from '@/entities/salary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/src/shared/lib/format';

interface SalaryTabProps {
  adminId: number;
}

export function SalaryTab({ adminId }: SalaryTabProps) {
  const [isSetSalaryOpen, setIsSetSalaryOpen] = useState(false);
  const { data: currentSalary, isLoading: isLoadingCurrent } = useCurrentSalary(adminId);
  const { data: salaryHistory, isLoading: isLoadingHistory } = useSalaryHistory(adminId);
  const { data: payrollsData, isLoading: isLoadingPayrolls } = usePayrolls({ adminId });
  const { mutate: generatePayroll, isPending: isGenerating } = useGeneratePayroll();
  const { mutate: finalizePayroll } = useFinalizePayroll();
  const { mutate: markPaid } = useMarkPayrollPaid();

  const payrolls = payrollsData?.content ?? [];
  const now = new Date();

  const handleGenerate = () => {
    generatePayroll({
      adminId,
      payYear: now.getFullYear(),
      payMonth: now.getMonth() + 1,
    });
  };

  if (isLoadingCurrent) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 현재 급여 요약 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">급여 정보</h2>
        <Button size="sm" onClick={() => setIsSetSalaryOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          급여 설정
        </Button>
      </div>

      {currentSalary ? (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">현재 기본급</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">{formatCurrency(currentSalary.baseSalary)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(currentSalary.effectiveFrom)} 부터 적용
          </p>
        </div>
      ) : (
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <DollarSign className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">설정된 급여가 없습니다.</p>
        </div>
      )}

      {/* 급여 이력 */}
      {!isLoadingHistory && salaryHistory && salaryHistory.length > 1 && (
        <div>
          <h3 className="font-medium mb-3">급여 이력</h3>
          <div className="space-y-2">
            {salaryHistory.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{formatCurrency(s.baseSalary)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(s.effectiveFrom)} ~ {s.effectiveTo ? formatDate(s.effectiveTo) : '현재'}
                  </p>
                </div>
                {s.note && <span className="text-sm text-muted-foreground">{s.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 급여 명세서 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">월별 급여 명세서</h3>
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? '생성 중...' : `${now.getMonth() + 1}월 급여 생성`}
          </Button>
        </div>

        {isLoadingPayrolls ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : payrolls.length === 0 ? (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">급여 명세서가 없습니다.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">기간</TableHead>
                  <TableHead className="text-center">기본급</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">수당</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">공제</TableHead>
                  <TableHead className="text-center">실수령</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                  <TableHead className="text-center">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((p) => {
                  const statusLabel = PayrollStatusLabel[p.status as keyof typeof PayrollStatusLabel] ?? p.status;
                  const statusColor: Record<string, string> = {
                    DRAFT: 'bg-gray-100 text-gray-700',
                    FINALIZED: 'bg-blue-100 text-blue-700',
                    PAID: 'bg-green-100 text-green-700',
                  };
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-center">{p.payYear}.{String(p.payMonth).padStart(2, '0')}</TableCell>
                      <TableCell className="text-center">{formatCurrency(p.baseSalary)}</TableCell>
                      <TableCell className="text-center hidden sm:table-cell">{formatCurrency(p.totalAllowances)}</TableCell>
                      <TableCell className="text-center hidden sm:table-cell">{formatCurrency(p.totalDeductions)}</TableCell>
                      <TableCell className="text-center font-medium">{formatCurrency(p.netPay)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={statusColor[p.status] ?? ''}>
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {p.status === 'DRAFT' && (
                          <Button size="sm" variant="outline" onClick={() => finalizePayroll(p.id)}>
                            확정
                          </Button>
                        )}
                        {p.status === 'FINALIZED' && (
                          <Button size="sm" variant="outline" onClick={() => markPaid(p.id)}>
                            지급
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <SetSalaryDialog
        adminId={adminId}
        open={isSetSalaryOpen}
        onOpenChange={setIsSetSalaryOpen}
      />
    </div>
  );
}

interface SetSalaryDialogProps {
  adminId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SetSalaryDialog({ adminId, open, onOpenChange }: SetSalaryDialogProps) {
  const { mutate: createSalary, isPending } = useCreateSalary(adminId);
  const [form, setForm] = useState<CreateSalaryInput>({
    baseSalary: 0,
    effectiveFrom: new Date().toISOString().split('T')[0],
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSalary(form, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>급여 설정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>기본급 (원)</Label>
            <Input
              type="number"
              value={form.baseSalary || ''}
              onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })}
              placeholder="3500000"
            />
          </div>
          <div className="space-y-2">
            <Label>적용 시작일</Label>
            <Input
              type="date"
              value={form.effectiveFrom}
              onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>메모</Label>
            <Input
              value={form.note ?? ''}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="급여 변경 사유"
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
