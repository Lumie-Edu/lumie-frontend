import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminClient } from '@/src/shared/api/base';
import {
  SalaryRecord,
  CreateSalaryInput,
  PayrollRecord,
  GeneratePayrollInput,
} from '../model/schema';
import { PaginatedResponse } from '@/src/shared/types/api';

const QUERY_KEYS = {
  salary: ['salary'] as const,
  salaryHistory: (adminId: number) => [...QUERY_KEYS.salary, 'history', adminId] as const,
  currentSalary: (adminId: number) => [...QUERY_KEYS.salary, 'current', adminId] as const,
  payroll: ['payroll'] as const,
  payrollList: (params?: Record<string, unknown>) => [...QUERY_KEYS.payroll, 'list', params] as const,
  payrollDetail: (id: number) => [...QUERY_KEYS.payroll, 'detail', id] as const,
};

export function useSalaryHistory(adminId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.salaryHistory(adminId),
    queryFn: () =>
      adminClient.get<SalaryRecord[]>(`/api/v1/admins/${adminId}/salaries`),
    enabled: adminId > 0,
  });
}

export function useCurrentSalary(adminId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.currentSalary(adminId),
    queryFn: () =>
      adminClient.get<SalaryRecord>(`/api/v1/admins/${adminId}/salaries/current`),
    enabled: adminId > 0,
  });
}

export function useCreateSalary(adminId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalaryInput) =>
      adminClient.post<SalaryRecord>(`/api/v1/admins/${adminId}/salaries`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.salary });
      toast.success('급여가 설정되었습니다.');
    },
  });
}

export function usePayrolls(params?: { yearMonth?: string; adminId?: number; status?: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.payrollList(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.yearMonth) searchParams.set('yearMonth', params.yearMonth);
      if (params?.adminId) searchParams.set('adminId', String(params.adminId));
      if (params?.status) searchParams.set('status', params.status);
      const query = searchParams.toString();
      return adminClient.get<PaginatedResponse<PayrollRecord>>(
        `/api/v1/payroll${query ? `?${query}` : ''}`
      );
    },
  });
}

export function usePayroll(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.payrollDetail(id),
    queryFn: () => adminClient.get<PayrollRecord>(`/api/v1/payroll/${id}`),
    enabled: id > 0,
  });
}

export function useGeneratePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GeneratePayrollInput) =>
      adminClient.post<PayrollRecord>('/api/v1/payroll/generate', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payroll });
      toast.success('급여명세서가 생성되었습니다.');
    },
  });
}

export function useFinalizePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      adminClient.post<void>(`/api/v1/payroll/${id}/finalize`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payroll });
      toast.success('급여가 확정되었습니다.');
    },
  });
}

export function useMarkPayrollPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      adminClient.post<void>(`/api/v1/payroll/${id}/mark-paid`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payroll });
      toast.success('지급 완료 처리되었습니다.');
    },
  });
}
