'use client';

import { type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Tab {
  value: string;
  label: string;
  content: ReactNode;
}

interface DetailLayoutProps {
  sidebar: ReactNode;
  tabs: Tab[];
  defaultTab: string;
}

const gridColsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

export function DetailLayout({ sidebar, tabs, defaultTab }: DetailLayoutProps) {
  return (
    <div className="flex flex-col tablet:flex-row gap-6">
      <aside className="tablet:w-96 tablet:shrink-0">
        {sidebar}
      </aside>

      <div className="flex-1 min-w-0">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className={`grid w-full ${gridColsMap[tabs.length] ?? ''}`}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-6">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
