'use client';

import { use } from 'react';
import { SessionDetailView } from '@/features/attendance-management';

export default function AttendanceSessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  return <SessionDetailView sessionId={Number(sessionId)} />;
}
