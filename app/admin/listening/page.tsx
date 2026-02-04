'use client';

import { ListeningWorkspace } from '@/features/listening-generation';

export default function ListeningPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden bg-white">
      <ListeningWorkspace />
    </div>
  );
}
