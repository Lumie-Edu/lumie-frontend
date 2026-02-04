'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ENV } from '@/src/shared/config/env';
import {
  TranscribeResponse,
  SplitResponse,
  TranscribeAndSplitResponse,
  SplitOptions,
} from '../model/schema';

const QUERY_KEYS = {
  all: ['listening'] as const,
  transcribe: () => [...QUERY_KEYS.all, 'transcribe'] as const,
  split: () => [...QUERY_KEYS.all, 'split'] as const,
};

interface TranscribeRequest {
  file: File;
  language?: string;
}

interface SplitRequest {
  file: File;
  options?: Partial<SplitOptions>;
}

interface TranscribeAndSplitRequest {
  file: File;
  language?: string;
  options?: Partial<SplitOptions>;
}

interface MergeRequest {
  jobId: string;
  segmentIds: number[];
  outputFormat?: 'wav' | 'mp3';
}

export function useTranscribe() {
  return useMutation({
    mutationFn: async ({ file, language }: TranscribeRequest) => {
      const formData = new FormData();
      formData.append('file', file);
      if (language) {
        formData.append('language', language);
      }

      const response = await fetch(
        `${ENV.AUDIO_SERVICE_URL}/api/v1/audio/transcribe`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = '음성 변환에 실패했습니다.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorMessage;
        } catch {
          // ignore parse error
        }
        throw new Error(errorMessage);
      }

      return response.json() as Promise<TranscribeResponse>;
    },
    onSuccess: (data) => {
      toast.success(
        `음성 변환 완료: ${data.segments.length}개 세그먼트, ${data.duration.toFixed(1)}초`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSplit() {
  return useMutation({
    mutationFn: async ({ file, options }: SplitRequest) => {
      const formData = new FormData();
      formData.append('file', file);

      if (options?.min_silence_len !== undefined) {
        formData.append('min_silence_len', String(options.min_silence_len));
      }
      if (options?.silence_thresh !== undefined) {
        formData.append('silence_thresh', String(options.silence_thresh));
      }
      if (options?.keep_silence !== undefined) {
        formData.append('keep_silence', String(options.keep_silence));
      }
      if (options?.output_format) {
        formData.append('output_format', options.output_format);
      }

      const response = await fetch(
        `${ENV.AUDIO_SERVICE_URL}/api/v1/audio/split`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = '오디오 분할에 실패했습니다.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorMessage;
        } catch {
          // ignore parse error
        }
        throw new Error(errorMessage);
      }

      return response.json() as Promise<SplitResponse>;
    },
    onSuccess: (data) => {
      toast.success(`오디오 분할 완료: ${data.segment_count}개 세그먼트`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useTranscribeAndSplit() {
  return useMutation({
    mutationFn: async ({
      file,
      language,
      options,
    }: TranscribeAndSplitRequest) => {
      const formData = new FormData();
      formData.append('file', file);

      if (language) {
        formData.append('language', language);
      }
      if (options?.min_silence_len !== undefined) {
        formData.append('min_silence_len', String(options.min_silence_len));
      }
      if (options?.silence_thresh !== undefined) {
        formData.append('silence_thresh', String(options.silence_thresh));
      }
      if (options?.keep_silence !== undefined) {
        formData.append('keep_silence', String(options.keep_silence));
      }
      if (options?.output_format) {
        formData.append('output_format', options.output_format);
      }

      const response = await fetch(
        `${ENV.AUDIO_SERVICE_URL}/api/v1/audio/transcribe-and-split`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = '음성 변환 및 분할에 실패했습니다.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorMessage;
        } catch {
          // ignore parse error
        }
        throw new Error(errorMessage);
      }

      return response.json() as Promise<TranscribeAndSplitResponse>;
    },
    onSuccess: (data) => {
      toast.success(
        `처리 완료: ${data.transcript.length}개 스크립트, ${data.segments.length}개 세그먼트`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useMergeSegments() {
  return useMutation({
    mutationFn: async ({
      jobId,
      segmentIds,
      outputFormat = 'wav',
    }: MergeRequest) => {
      const response = await fetch(
        `${ENV.AUDIO_SERVICE_URL}/api/v1/audio/merge`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            job_id: jobId,
            segment_ids: segmentIds,
            output_format: outputFormat,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = '오디오 병합에 실패했습니다.';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorMessage;
        } catch {
          // ignore parse error
        }
        throw new Error(errorMessage);
      }

      return response.blob();
    },
    onSuccess: () => {
      toast.success('오디오 병합 완료');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function getSegmentDownloadUrl(
  jobId: string,
  segmentId: number,
  format: string = 'wav'
): string {
  return `${ENV.AUDIO_SERVICE_URL}/api/v1/audio/segments/${jobId}/${segmentId}?format=${format}`;
}

export function getAllSegmentsDownloadUrl(
  jobId: string,
  format: string = 'wav'
): string {
  return `${ENV.AUDIO_SERVICE_URL}/api/v1/audio/segments/${jobId}/all?format=${format}`;
}

export { QUERY_KEYS };

export type {
  TranscribeRequest,
  SplitRequest,
  TranscribeAndSplitRequest,
  MergeRequest,
};
