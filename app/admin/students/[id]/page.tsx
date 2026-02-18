'use client';

import { use } from 'react';
import { StudentDetailPage } from '@/src/features/student-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentDetailRoute({ params }: PageProps) {
  const { id } = use(params);
  return <StudentDetailPage studentId={parseInt(id, 10)} />;
}
