import { z } from 'zod';

export const fileMetadataSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum(['ANNOUNCEMENT', 'QNA', 'TEXTBOOK', 'ACADEMY', 'OMR']),
  entityId: z.number().nullable().optional(),
  originalFilename: z.string(),
  contentType: z.string(),
  fileSize: z.number(),
  uploadCompleted: z.boolean(),
  createdAt: z.string(),
});

export type FileMetadata = z.infer<typeof fileMetadataSchema>;

export const presignedUploadRequestSchema = z.object({
  entityType: z.enum(['ANNOUNCEMENT', 'QNA', 'TEXTBOOK', 'ACADEMY', 'OMR']),
  entityId: z.number().optional(),
  filename: z.string(),
  contentType: z.string(),
  fileSize: z.number(),
});

export type PresignedUploadRequest = z.infer<typeof presignedUploadRequestSchema>;

export const presignedUploadResponseSchema = z.object({
  fileId: z.string().uuid(),
  uploadUrl: z.string(),
  expiresInSeconds: z.number(),
});

export type PresignedUploadResponse = z.infer<typeof presignedUploadResponseSchema>;

export const presignedDownloadResponseSchema = z.object({
  fileId: z.string().uuid(),
  downloadUrl: z.string(),
  filename: z.string(),
  contentType: z.string(),
  expiresInSeconds: z.number(),
});

export type PresignedDownloadResponse = z.infer<typeof presignedDownloadResponseSchema>;
