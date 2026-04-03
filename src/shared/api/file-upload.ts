import { useMutation } from '@tanstack/react-query';
import { ENV } from '@/src/shared/config/env';
import { storage } from '@/src/shared/lib/storage';

interface UploadFileParams {
  file: File;
  entityType: string;
  entityId?: number;
}

interface FileMetadata {
  id: string;
  entityType: string;
  entityId: number | null;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  uploadCompleted: boolean;
  createdAt: string;
}

export function useFileUpload() {
  return useMutation({
    mutationFn: async ({ file, entityType, entityId }: UploadFileParams): Promise<FileMetadata> => {
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
        `${ENV.FILE_SERVICE_URL}/v1/files/upload`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: '파일 업로드에 실패했습니다.' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    },
  });
}
