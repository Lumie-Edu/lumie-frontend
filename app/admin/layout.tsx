'use client';

import { ReactNode } from 'react';
import { Header } from '@/widgets/header';
import { AdminSidebar } from '@/widgets/admin-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { OmrJobTrackerProvider, OmrNotificationBell } from '@/features/omr-grading';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <OmrJobTrackerProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <Header />
            </div>
            <OmrNotificationBell />
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </OmrJobTrackerProvider>
    </SidebarProvider>
  );
}
