import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fileClient } from '@/src/shared/api/base';
import { FileMetadata } from '../model/schema';
import { ENV } from '@/src/shared/config/env';
import { storage } from '@/src/shared/lib/storage';

const QUERY_KEYS = {
  all: ['textbook-files'] as const,
  list: () => [...QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...QUERY_KEYS.all, 'detail', id] as const,
};

export function useTextbookFiles() {
  return useQuery({
    queryKey: QUERY_KEYS.list(),
    queryFn: () =>
      fileClient.get<FileMetadata[]>('/api/v1/files?entityType=TEXTBOOK'),
  });
}

export function useTextbookFile(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => fileClient.get<FileMetadata>(`/api/v1/files/${id}`),
    enabled: !!id,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      entityType,
      entityId,
    }: {
      file: File;
      entityType: string;
      entityId?: number;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      if (entityId !== undefined) {
        formData.append('entityId', entityId.toString());
      }

      const headers: Record<string, string> = {};
      const slug = storage.getTenantSlug();
      if (slug) {
        headers['X-Tenant-Slug'] = slug;
      }

      const response = await fetch(
        `${ENV.FILE_SERVICE_URL}/api/v1/files/upload`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json() as Promise<FileMetadata>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('파일이 업로드되었습니다.');
    },
  });
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: async ({ fileId, filename }: { fileId: string; filename: string }) => {
      const headers: Record<string, string> = {};
      const slug = storage.getTenantSlug();
      if (slug) {
        headers['X-Tenant-Slug'] = slug;
      }

      const response = await fetch(
        `${ENV.FILE_SERVICE_URL}/api/v1/files/${fileId}/download`,
        {
          method: 'GET',
          credentials: 'include',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('다운로드에 실패했습니다.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useDeleteTextbookFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fileClient.delete<void>(`/api/v1/files/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('파일이 삭제되었습니다.');
    },
  });
}
