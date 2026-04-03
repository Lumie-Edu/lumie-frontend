'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAnnouncementInput, createAnnouncementSchema, useCreateAnnouncement } from '@/entities/announcement';
import { useAcademies } from '@/entities/academy';
import { useUser } from '@/entities/session';
import { useFileUpload } from '@/src/shared/api/file-upload';
import { ApiError } from '@/src/shared/types/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Paperclip, X } from 'lucide-react';

interface CreateAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAnnouncementModal({ open, onOpenChange }: CreateAnnouncementModalProps) {
  const user = useUser();
  const { data: academiesData } = useAcademies();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateAnnouncementInput>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: {
      authorId: user?.id,
      announcementTitle: '',
      announcementContent: '',
      isItImportantAnnouncement: false,
      academyIds: [],
    },
  });

  const { mutateAsync: createAnnouncement, isPending, error } = useCreateAnnouncement();
  const { mutateAsync: uploadFile } = useFileUpload();

  const onSubmit = async (data: CreateAnnouncementInput) => {
    try {
      const announcement = await createAnnouncement({
        ...data,
        authorId: user?.id ?? 0,
      });

      if (files.length > 0) {
        setIsUploading(true);
        await Promise.all(
          files.map((file) =>
            uploadFile({
              file,
              entityType: 'ANNOUNCEMENT',
              entityId: announcement.id,
            })
          )
        );
      }

      setFiles([]);
      reset();
      onOpenChange(false);
    } catch {
      // error is handled by mutation
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const apiError = error as ApiError | null;
  const academies = academiesData?.content ?? [];
  const selectedAcademyIds = watch('academyIds') ?? [];
  const isImportant = watch('isItImportantAnnouncement');

  const toggleAcademy = (academyId: number) => {
    const current = selectedAcademyIds;
    if (current.includes(academyId)) {
      setValue('academyIds', current.filter((id) => id !== academyId));
    } else {
      setValue('academyIds', [...current, academyId]);
    }
  };

  const isBusy = isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>공지 작성</DialogTitle>
          <DialogDescription>새 공지사항을 작성합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {apiError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{apiError.message}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>학원 선택</Label>
            <p className="text-xs text-muted-foreground">선택하지 않으면 전체 학원에 표시됩니다.</p>
            <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
              {academies.map((academy) => (
                <div key={academy.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`academy-${academy.id}`}
                    checked={selectedAcademyIds.includes(academy.id)}
                    onCheckedChange={() => toggleAcademy(academy.id)}
                  />
                  <Label htmlFor={`academy-${academy.id}`} className="cursor-pointer text-sm font-normal">
                    {academy.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcementTitle">제목 *</Label>
            <Input
              id="announcementTitle"
              placeholder="공지 제목을 입력하세요"
              {...register('announcementTitle')}
            />
            {errors.announcementTitle && (
              <p className="text-sm text-red-600">{errors.announcementTitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcementContent">내용 *</Label>
            <Textarea
              id="announcementContent"
              placeholder="공지 내용을 입력하세요"
              rows={6}
              {...register('announcementContent')}
            />
            {errors.announcementContent && (
              <p className="text-sm text-red-600">{errors.announcementContent.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>첨부파일</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4 mr-2" />
              파일 선택
            </Button>
            {files.length > 0 && (
              <div className="space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded px-2 py-1">
                    <Paperclip className="w-3 h-3 shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs shrink-0">({(file.size / 1024).toFixed(0)}KB)</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-auto shrink-0 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="createIsItImportantAnnouncement"
              checked={isImportant}
              onCheckedChange={(checked) => setValue('isItImportantAnnouncement', !!checked)}
            />
            <Label htmlFor="createIsItImportantAnnouncement" className="cursor-pointer">
              중요 공지 (상단 고정)
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy ? (isUploading ? '파일 업로드 중...' : '작성 중...') : '공지 작성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
