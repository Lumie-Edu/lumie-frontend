import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { spreadsheetClient } from '@/src/shared/api/base';
import type {
  Spreadsheet,
  SpreadsheetDetail,
  CreateSpreadsheetInput,
  UpdateSpreadsheetInput,
  UpdateCellInput,
  CellData,
} from '../model/schema';
import type { PaginatedResponse, PaginationParams } from '@/src/shared/types/api';

interface SpreadsheetQueryParams extends PaginationParams {
  ownerId?: number;
}

interface CellResponse {
  address: string;
  value: string | null;
  displayValue: string | null;
  formula: string | null;
  style: CellData['style'];
}

const QUERY_KEYS = {
  all: ['spreadsheets'] as const,
  list: (params?: SpreadsheetQueryParams) => [...QUERY_KEYS.all, 'list', params] as const,
  detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
};

export function useSpreadsheets(params?: SpreadsheetQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.set('page', String(params.page));
      if (params?.size !== undefined) searchParams.set('size', String(params.size));
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.ownerId) searchParams.set('ownerId', String(params.ownerId));
      const query = searchParams.toString();
      return spreadsheetClient.get<PaginatedResponse<Spreadsheet>>(
        `/api/v1/spreadsheets${query ? `?${query}` : ''}`
      );
    },
  });
}

export function useSpreadsheet(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => spreadsheetClient.get<Spreadsheet>(`/api/v1/spreadsheets/${id}`),
    enabled: id > 0,
  });
}

export function useSpreadsheetDetail(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.detail(id), 'full'],
    queryFn: () => spreadsheetClient.get<SpreadsheetDetail>(`/api/v1/spreadsheets/${id}/detail`),
    enabled: id > 0,
  });
}

export function useCreateSpreadsheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSpreadsheetInput) =>
      spreadsheetClient.post<Spreadsheet>('/api/v1/spreadsheets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('스프레드시트가 생성되었습니다.');
    },
  });
}

export function useUpdateSpreadsheet(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSpreadsheetInput) =>
      spreadsheetClient.patch<Spreadsheet>(`/api/v1/spreadsheets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('스프레드시트가 수정되었습니다.');
    },
  });
}

export function useDeleteSpreadsheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      spreadsheetClient.delete<void>(`/api/v1/spreadsheets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('스프레드시트가 삭제되었습니다.');
    },
  });
}

export function useUpdateCell(spreadsheetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ address, ...data }: UpdateCellInput) =>
      spreadsheetClient.patch<CellResponse>(
        `/api/v1/spreadsheets/${spreadsheetId}/cells/${address}`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(spreadsheetId) });
    },
  });
}

export { QUERY_KEYS as SPREADSHEET_QUERY_KEYS };
