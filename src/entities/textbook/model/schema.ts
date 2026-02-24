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
