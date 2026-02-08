'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckInInput, checkInSchema, useCheckIn } from '@/entities/attendance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarCheck, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function StudentAttendancePage() {
  const [result, setResult] = useState<{ message: string; status: string } | null>(null);
  const { mutate: checkIn, isPending, error } = useCheckIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CheckInInput>({
    resolver: zodResolver(checkInSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = (data: CheckInInput) => {
    setResult(null);
    checkIn(data, {
      onSuccess: (response) => {
        setResult(response);
        reset();
      },
      onError: () => {
        setResult(null);
      },
    });
  };

  const getStatusIcon = () => {
    if (!result) return null;
    switch (result.status) {
      case 'PRESENT':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'LATE':
        return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
      default:
        return <XCircle className="w-16 h-16 text-red-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">출석 체크</h1>
        <p className="text-muted-foreground">선생님이 알려준 6자리 출석 코드를 입력하세요.</p>
      </div>

      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <CalendarCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
              <Input
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                className="pl-14 text-center font-mono text-2xl h-16 tracking-[0.5em]"
                {...register('code')}
              />
            </div>
            {errors.code && (
              <p className="text-sm text-red-600 text-center">{errors.code.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-12 text-lg">
            {isPending ? '확인 중...' : '출석하기'}
          </Button>
        </form>

        {/* 결과 표시 */}
        {result && (
          <div className="mt-8 text-center space-y-3 p-6 rounded-lg border bg-muted/30">
            <div className="flex justify-center">{getStatusIcon()}</div>
            <p className="text-lg font-medium">{result.message}</p>
          </div>
        )}

        {/* 에러 표시 */}
        {error && !result && (
          <div className="mt-8 text-center space-y-3 p-6 rounded-lg border border-red-200 bg-red-50">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <p className="text-lg font-medium text-red-600">
              {(error as { message?: string })?.message || '출석 처리에 실패했습니다.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
