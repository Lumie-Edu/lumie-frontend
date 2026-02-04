'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Music,
  Loader2,
  Sparkles,
  Download,
  RotateCcw,
  Play,
  Pause,
  Settings2,
  FileAudio,
  Split,
  Merge,
  Languages,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useTranscribeAndSplit,
  getSegmentDownloadUrl,
  getAllSegmentsDownloadUrl,
  TranscribeAndSplitResponse,
  AudioSegmentInfo,
  TranscriptSegment,
  SplitOptions,
} from '@/entities/listening';

type ProcessMode = 'split' | 'merge' | 'transcribe';

interface UploadedFile {
  id: string;
  file: File;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  fullText: string;
}

function TranscriptPanel({ segments, fullText }: TranscriptPanelProps) {
  const [showFullText, setShowFullText] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Languages className="w-4 h-4 text-indigo-500" />
          스크립트
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFullText(!showFullText)}
          className="text-xs"
        >
          {showFullText ? '세그먼트 보기' : '전체 보기'}
        </Button>
      </div>
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {showFullText ? (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {fullText}
          </p>
        ) : (
          <div className="space-y-2">
            {segments.map((seg) => (
              <div
                key={seg.id}
                className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs text-gray-400 font-mono whitespace-nowrap pt-0.5">
                  [{formatTime(seg.start)}-{formatTime(seg.end)}]
                </span>
                <p className="text-sm text-gray-700 flex-1">{seg.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SegmentListProps {
  jobId: string;
  segments: AudioSegmentInfo[];
  outputFormat: string;
}

function SegmentList({ jobId, segments, outputFormat }: SegmentListProps) {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = (segmentId: number) => {
    if (playingId === segmentId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(getSegmentDownloadUrl(jobId, segmentId, outputFormat));
      audio.onended = () => setPlayingId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingId(segmentId);
    }
  };

  const handleDownload = (segmentId: number) => {
    const url = getSegmentDownloadUrl(jobId, segmentId, outputFormat);
    const a = document.createElement('a');
    a.href = url;
    a.download = `segment_${segmentId.toString().padStart(3, '0')}.${outputFormat}`;
    a.click();
  };

  const handleDownloadAll = () => {
    const url = getAllSegmentsDownloadUrl(jobId, outputFormat);
    const a = document.createElement('a');
    a.href = url;
    a.download = `segments_${jobId.slice(0, 8)}.zip`;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <FileAudio className="w-4 h-4 text-indigo-500" />
          세그먼트 ({segments.length}개)
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadAll}
          className="text-xs gap-1"
        >
          <Download className="w-3 h-3" />
          전체 다운로드
        </Button>
      </div>
      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {segments.map((seg) => (
          <div
            key={seg.segment_id}
            className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors"
          >
            <button
              onClick={() => handlePlay(seg.segment_id)}
              className={cn(
                'p-2 rounded-full transition-colors',
                playingId === seg.segment_id
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {playingId === seg.segment_id ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">
                Segment {seg.segment_id + 1}
              </p>
              <p className="text-xs text-gray-500">
                {formatTime(seg.start_time)} - {formatTime(seg.end_time)} ({seg.duration.toFixed(1)}s)
              </p>
            </div>
            <span className="text-xs text-gray-400">{formatFileSize(seg.file_size)}</span>
            <button
              onClick={() => handleDownload(seg.segment_id)}
              className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListeningWorkspace() {
  const [mode, setMode] = useState<ProcessMode>('split');
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<TranscribeAndSplitResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [options, setOptions] = useState<SplitOptions>({
    min_silence_len: 700,
    silence_thresh: -40,
    keep_silence: 300,
    output_format: 'wav',
  });

  const [language, setLanguage] = useState<string>('');

  const transcribeAndSplitMutation = useTranscribeAndSplit();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = Array.from(e.dataTransfer.files).find((f) =>
      f.type.startsWith('audio/')
    );
    if (droppedFile) {
      setFile({
        id: crypto.randomUUID(),
        file: droppedFile,
      });
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile({
          id: crypto.randomUUID(),
          file: selectedFile,
        });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    []
  );

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    const estimatedTimeMs = 30000;
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const prog = Math.min((elapsed / estimatedTimeMs) * 90, 90);
      setProgress(prog);
    }, 100);

    try {
      const response = await transcribeAndSplitMutation.mutateAsync({
        file: file.file,
        language: language || undefined,
        options,
      });

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgress(100);

      setTimeout(() => {
        setIsProcessing(false);
        setResult(response);
      }, 500);
    } catch {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
    setProgress(0);
  };

  if (result) {
    return (
      <div className="flex-1 flex flex-col h-full bg-gray-50/50">
        <div className="px-8 py-5 bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">처리 결과</h2>
              <p className="text-sm text-gray-500 mt-1">
                {result.duration.toFixed(1)}초 오디오 / {result.language} 언어 감지
              </p>
            </div>
            <Button onClick={handleReset} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              새로 처리하기
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-5">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">전체 길이</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(result.duration)}
              </p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-sm text-indigo-600">스크립트 세그먼트</p>
              <p className="text-2xl font-bold text-indigo-700">
                {result.transcript.length}개
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-sm text-emerald-600">오디오 세그먼트</p>
              <p className="text-2xl font-bold text-emerald-700">
                {result.segments.length}개
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-600">감지 언어</p>
              <p className="text-2xl font-bold text-blue-700 uppercase">
                {result.language}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <TranscriptPanel segments={result.transcript} fullText={result.full_text} />
            <SegmentList
              jobId={result.job_id}
              segments={result.segments}
              outputFormat={options.output_format}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={isProcessing} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-full">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
              오디오 처리 중
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">{file?.file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                음성 변환 및 분할 작업 중입니다
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>처리 중...</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
              <p className="font-medium">잠시만 기다려주세요</p>
              <p className="text-amber-600 mt-0.5">
                처리가 완료될 때까지 이 창을 닫지 마세요.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex-1 flex flex-col h-full bg-gray-50/50">
        <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">리스닝 생성</h2>
            <p className="text-sm text-gray-500 mt-1">
              오디오 파일을 업로드하여 스크립트 변환 및 세그먼트 분할
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMode('split')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
                  mode === 'split'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Split className="w-4 h-4" />
                분할
              </button>
              <button
                onClick={() => setMode('merge')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
                  mode === 'merge'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Merge className="w-4 h-4" />
                병합
              </button>
              <button
                onClick={() => setMode('transcribe')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
                  mode === 'transcribe'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Languages className="w-4 h-4" />
                변환
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="lg:col-span-2">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'min-h-[400px] rounded-2xl transition-all duration-300 relative group border-2 border-dashed',
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                    : 'border-gray-200 bg-white hover:border-indigo-300',
                  file && 'border-solid border-indigo-200 bg-indigo-50/30'
                )}
              >
                {!file ? (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div
                      className={cn(
                        'w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300',
                        isDragging
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                      )}
                    >
                      <Upload className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      오디오 파일을 드래그하세요
                    </h3>
                    <p className="text-gray-500 mb-8">또는 클릭하여 파일 선택</p>

                    <div className="flex gap-6 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Music className="w-4 h-4" /> MP3, WAV, M4A
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                      <FileAudio className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center truncate max-w-full">
                      {file.file.name}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {formatFileSize(file.file.size)}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setFile(null)}
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        다른 파일
                      </Button>
                      <Button
                        onClick={handleProcess}
                        disabled={transcribeAndSplitMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        처리 시작
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-500" />
                  처리 옵션
                </h3>

                <div className="space-y-5">
                  <div>
                    <Label className="text-sm text-gray-700">언어</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="자동 감지" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">자동 감지</SelectItem>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="en">영어</SelectItem>
                        <SelectItem value="ja">일본어</SelectItem>
                        <SelectItem value="zh">중국어</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <Label className="text-sm text-gray-700">무음 임계값</Label>
                      <span className="text-sm text-gray-500">
                        {options.silence_thresh} dBFS
                      </span>
                    </div>
                    <Slider
                      value={[options.silence_thresh]}
                      onValueChange={([val]) =>
                        setOptions({ ...options, silence_thresh: val })
                      }
                      min={-60}
                      max={-20}
                      step={1}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      낮을수록 더 조용한 소리도 무음으로 처리
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <Label className="text-sm text-gray-700">최소 무음 길이</Label>
                      <span className="text-sm text-gray-500">
                        {options.min_silence_len}ms
                      </span>
                    </div>
                    <Slider
                      value={[options.min_silence_len]}
                      onValueChange={([val]) =>
                        setOptions({ ...options, min_silence_len: val })
                      }
                      min={100}
                      max={3000}
                      step={50}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      이 시간 이상의 무음에서 분할
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-700">출력 형식</Label>
                    <Select
                      value={options.output_format}
                      onValueChange={(val: 'wav' | 'mp3') =>
                        setOptions({ ...options, output_format: val })
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wav">WAV (무손실)</SelectItem>
                        <SelectItem value="mp3">MP3 (압축)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
