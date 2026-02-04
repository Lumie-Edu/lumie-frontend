import { z } from 'zod';

export const transcriptSegmentSchema = z.object({
  id: z.number(),
  start: z.number(),
  end: z.number(),
  text: z.string(),
});

export type TranscriptSegment = z.infer<typeof transcriptSegmentSchema>;

export const transcribeResponseSchema = z.object({
  job_id: z.string(),
  duration: z.number(),
  language: z.string(),
  segments: z.array(transcriptSegmentSchema),
  full_text: z.string(),
});

export type TranscribeResponse = z.infer<typeof transcribeResponseSchema>;

export const audioSegmentInfoSchema = z.object({
  segment_id: z.number(),
  start_time: z.number(),
  end_time: z.number(),
  duration: z.number(),
  file_size: z.number(),
  filename: z.string(),
});

export type AudioSegmentInfo = z.infer<typeof audioSegmentInfoSchema>;

export const splitResponseSchema = z.object({
  job_id: z.string(),
  original_duration: z.number(),
  segment_count: z.number(),
  segments: z.array(audioSegmentInfoSchema),
});

export type SplitResponse = z.infer<typeof splitResponseSchema>;

export const transcribeAndSplitResponseSchema = z.object({
  job_id: z.string(),
  duration: z.number(),
  language: z.string(),
  transcript: z.array(transcriptSegmentSchema),
  full_text: z.string(),
  segments: z.array(audioSegmentInfoSchema),
});

export type TranscribeAndSplitResponse = z.infer<
  typeof transcribeAndSplitResponseSchema
>;

export const mergeRequestSchema = z.object({
  job_id: z.string(),
  segment_ids: z.array(z.number()),
  output_format: z.enum(['wav', 'mp3']).default('wav'),
});

export type MergeRequest = z.infer<typeof mergeRequestSchema>;

export const splitOptionsSchema = z.object({
  min_silence_len: z.number().min(100).max(5000).default(700),
  silence_thresh: z.number().min(-60).max(-20).default(-40),
  keep_silence: z.number().min(0).max(1000).default(300),
  output_format: z.enum(['wav', 'mp3']).default('wav'),
});

export type SplitOptions = z.infer<typeof splitOptionsSchema>;
