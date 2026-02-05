'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateSpreadsheet,
  createSpreadsheetSchema,
  type CreateSpreadsheetInput,
} from '@/src/entities/spreadsheet';

export function CreateSpreadsheetForm() {
  const router = useRouter();
  const { mutate: createSpreadsheet, isPending } = useCreateSpreadsheet();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateSpreadsheetInput>({
    resolver: zodResolver(createSpreadsheetSchema),
    defaultValues: {
      name: '',
      description: '',
      rowCount: 100,
      columnCount: 26,
      permission: 'PRIVATE',
    },
  });

  const permission = watch('permission');

  const onSubmit = (data: CreateSpreadsheetInput) => {
    createSpreadsheet(data, {
      onSuccess: (spreadsheet) => {
        router.push(`/admin/spreadsheets/${spreadsheet.id}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">이름 *</Label>
        <Input
          id="name"
          placeholder="스프레드시트 이름"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Input
          id="description"
          placeholder="스프레드시트 설명 (선택)"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Size */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rowCount">행 수</Label>
          <Input
            id="rowCount"
            type="number"
            min={1}
            max={1000}
            {...register('rowCount', { valueAsNumber: true })}
          />
          {errors.rowCount && (
            <p className="text-sm text-red-500">{errors.rowCount.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="columnCount">열 수</Label>
          <Input
            id="columnCount"
            type="number"
            min={1}
            max={100}
            {...register('columnCount', { valueAsNumber: true })}
          />
          {errors.columnCount && (
            <p className="text-sm text-red-500">{errors.columnCount.message}</p>
          )}
        </div>
      </div>

      {/* Permission */}
      <div className="space-y-2">
        <Label>권한</Label>
        <Select
          value={permission}
          onValueChange={(value) =>
            setValue('permission', value as 'PRIVATE' | 'VIEW_ONLY' | 'EDITABLE')
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="권한 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PRIVATE">비공개</SelectItem>
            <SelectItem value="VIEW_ONLY">읽기 전용</SelectItem>
            <SelectItem value="EDITABLE">편집 가능</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          {permission === 'PRIVATE' && '나만 볼 수 있습니다.'}
          {permission === 'VIEW_ONLY' && '다른 사용자가 볼 수 있지만 편집할 수 없습니다.'}
          {permission === 'EDITABLE' && '다른 사용자도 편집할 수 있습니다.'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? '생성 중...' : '스프레드시트 만들기'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/spreadsheets')}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
