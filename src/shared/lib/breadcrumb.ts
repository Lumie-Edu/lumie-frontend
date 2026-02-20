'use client';

import { useEffect } from 'react';
import { create } from 'zustand';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbState {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
}

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

/**
 * 페이지에서 breadcrumb을 설정하는 훅.
 * 컴포넌트 마운트 시 설정, 언마운트 시 초기화.
 */
export function useBreadcrumb(items: BreadcrumbItem[]) {
  const setItems = useBreadcrumbStore((state) => state.setItems);

  useEffect(() => {
    setItems(items);
    return () => setItems([]);
  }, [setItems, ...items.map((i) => i.label), ...items.map((i) => i.href)]);
}
