import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fileClient } from '@/src/shared/api/base';
import {
  FileMetadata,
  PresignedUploadRequest,
  PresignedUploadResponse,
  PresignedDownloadResponse,
} from '../model/schema';

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

export function usePresignedUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PresignedUploadRequest) => {
      const response = await fileClient.post<PresignedUploadResponse>(
        '/api/v1/files/presigned-upload',
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
}

export function useRegisterUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fileClient.post<FileMetadata>('/api/v1/files', {
        fileId,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success('파일이 등록되었습니다.');
    },
  });
}

export function usePresignedDownload() {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fileClient.post<PresignedDownloadResponse>(
        '/api/v1/files/presigned-download',
        { fileId }
      );
      return response;
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

export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error('파일 업로드에 실패했습니다.');
  }
}
