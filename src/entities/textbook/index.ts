export {
  type FileMetadata,
  type PresignedUploadRequest,
  type PresignedUploadResponse,
  type PresignedDownloadResponse,
  fileMetadataSchema,
  presignedUploadRequestSchema,
  presignedUploadResponseSchema,
  presignedDownloadResponseSchema,
} from './model/schema';

export {
  useTextbookFiles,
  useTextbookFile,
  usePresignedUpload,
  useRegisterUpload,
  usePresignedDownload,
  useDeleteTextbookFile,
  uploadFileToS3,
} from './api/queries';
