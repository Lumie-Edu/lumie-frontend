'use client';

import Link from 'next/link';
import { useUser } from '@/entities/session';
import { useLogout } from '@/features/auth';
import { useBreadcrumbStore } from '@/src/shared/lib/breadcrumb';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/src/shared/ui/Button';

export function Header() {
  const user = useUser();
  const { mutate: logout, isPending } = useLogout();
  const items = useBreadcrumbStore((state) => state.items);

  return (
    <div className="flex items-center w-full">
      {items.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <BreadcrumbItem key={index}>
                  {index > 0 && <BreadcrumbSeparator />}
                  {isLast || !item.href ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="ml-auto flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-muted-foreground">
              {user.name}
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
                {user.role}
              </span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              loading={isPending}
            >
              로그아웃
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
