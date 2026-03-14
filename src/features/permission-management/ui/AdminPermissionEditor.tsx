'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  usePermissionsByCategory,
  useAdminPermissions,
  useSetAdminPermissions,
  type AccessLevel,
} from '@/entities/permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Shield,
  Save,
  GraduationCap,
  UserCog,
  CalendarCheck,
  ClipboardList,
  BarChart3,
  ClipboardCheck,
  FileText,
  Headphones,
  Megaphone,
  Send,
  FolderOpen,
  MessageCircleQuestion,
  Calendar,
  CreditCard,
  BookOpen,
  Table as TableIcon,
  LayoutGrid,
  Star,
  Users,
  TrendingUp,
  MessageSquare,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ──────────────────────── Constants ──────────────────────── */

const CATEGORY_ORDER = ['USER', 'LEARNING', 'COMMUNICATION', 'OPERATION'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  USER: '유저 관리',
  LEARNING: '학습 관리',
  COMMUNICATION: '소통',
  OPERATION: '운영 관리',
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  USER: Users,
  LEARNING: TrendingUp,
  COMMUNICATION: MessageSquare,
  OPERATION: Wallet,
};

const PERMISSION_ICONS: Record<string, LucideIcon> = {
  STUDENT_MANAGEMENT: GraduationCap,
  STAFF_MANAGEMENT: UserCog,
  PERMISSION_MANAGEMENT: Shield,
  ATTENDANCE_MANAGEMENT: CalendarCheck,
  ASSIGNMENT_MANAGEMENT: ClipboardList,
  GRADE_MANAGEMENT: BarChart3,
  EXAM_GRADING: ClipboardCheck,
  LEARNING_REPORT: FileText,
  LISTENING_CREATION: Headphones,
  ANNOUNCEMENT: Megaphone,
  SMS_SENDING: Send,
  RESOURCE_MANAGEMENT: FolderOpen,
  QNA_MANAGEMENT: MessageCircleQuestion,
  COUNSELING_MANAGEMENT: Calendar,
  BILLING: CreditCard,
  TEXTBOOK_MANAGEMENT: BookOpen,
  SPREADSHEET: TableIcon,
  ACADEMY_MANAGEMENT: LayoutGrid,
  REVIEW_MANAGEMENT: Star,
};

const ACCESS_LEVELS: { value: AccessLevel; label: string }[] = [
  { value: 'NONE', label: '금지' },
  { value: 'READ', label: '읽기' },
  { value: 'WRITE', label: '쓰기' },
];

const LEVEL_STYLES: Record<AccessLevel, { card: string; icon: string; segment: string }> = {
  NONE: {
    card: 'border-gray-200',
    icon: 'text-foreground',
    segment: 'bg-gray-200 text-foreground',
  },
  READ: {
    card: 'border-blue-300 bg-blue-50/50',
    icon: 'text-blue-500',
    segment: 'bg-blue-100 text-blue-700',
  },
  WRITE: {
    card: 'border-green-300 bg-green-50/50',
    icon: 'text-green-500',
    segment: 'bg-green-100 text-green-700',
  },
};

/* ──────────────────────── Component ──────────────────────── */

interface AdminPermissionEditorProps {
  adminId: number;
}

export function AdminPermissionEditor({ adminId }: AdminPermissionEditorProps) {
  const [permissionMap, setPermissionMap] = useState<Record<string, AccessLevel>>({});
  const [isDirty, setIsDirty] = useState(false);

  const { data: categories, isLoading: isLoadingPerms } = usePermissionsByCategory();
  const { data: adminPermissions, isLoading: isLoadingAdminPerms } = useAdminPermissions(adminId);
  const { mutate: savePermissions, isPending: isSaving } = useSetAdminPermissions(adminId);

  useEffect(() => {
    if (adminPermissions && categories) {
      const map: Record<string, AccessLevel> = {};
      categories.forEach((cat) =>
        cat.permissions.forEach((p) => {
          map[p.code] = 'NONE';
        })
      );
      adminPermissions.forEach((entry) => {
        map[entry.permissionCode] = entry.accessLevel;
      });
      setPermissionMap(map);
      setIsDirty(false);
    }
  }, [adminPermissions, categories]);

  const handleAccessChange = (code: string, level: AccessLevel) => {
    setPermissionMap((prev) => ({ ...prev, [code]: level }));
    setIsDirty(true);
  };

  const handleSave = () => {
    savePermissions(permissionMap, {
      onSuccess: () => setIsDirty(false),
    });
  };

  const categoryStats = useMemo(() => {
    if (!categories) return {};
    const stats: Record<string, { write: number; read: number; total: number }> = {};
    categories.forEach((cat) => {
      const write = cat.permissions.filter((p) => permissionMap[p.code] === 'WRITE').length;
      const read = cat.permissions.filter((p) => permissionMap[p.code] === 'READ').length;
      stats[cat.category] = { write, read, total: cat.permissions.length };
    });
    return stats;
  }, [categories, permissionMap]);

  const totalStats = useMemo(() => {
    const values = Object.values(categoryStats);
    if (values.length === 0) return { enabled: 0, total: 0 };
    return {
      enabled: values.reduce((sum, s) => sum + s.write + s.read, 0),
      total: values.reduce((sum, s) => sum + s.total, 0),
    };
  }, [categoryStats]);

  if (isLoadingPerms || isLoadingAdminPerms) {
    return (
      <div className="bg-white rounded-xl border p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-24 rounded" />
            <div className="grid grid-cols-2 smalltablet:grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-24 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">권한 관리</h2>
          <Badge variant="secondary" className="text-xs">
            {totalStats.enabled}/{totalStats.total} 활성
          </Badge>
        </div>
        {isDirty && (
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '저장 중...' : '변경사항 저장'}
          </Button>
        )}
      </div>

      {/* Permission Cards */}
      <div className="space-y-5">
        {CATEGORY_ORDER.flatMap((catKey) => {
          const cat = categories?.find((c) => c.category === catKey);
          return cat ? [cat] : [];
        }).map((cat) => {
          const categoryLabel = CATEGORY_LABELS[cat.category] ?? cat.category;
          const CategoryIcon = CATEGORY_ICONS[cat.category] ?? Shield;
          const stats = categoryStats[cat.category];

          return (
            <section key={cat.category} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">{categoryLabel}</h3>
                  {stats && (
                    <span className="text-xs text-muted-foreground">
                      {stats.write + stats.read}/{stats.total}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 smalltablet:grid-cols-4 lg:grid-cols-5 gap-2">
                {cat.permissions.map((perm) => {
                  const Icon = PERMISSION_ICONS[perm.code] ?? Shield;
                  const level = permissionMap[perm.code] ?? 'NONE';
                  const styles = LEVEL_STYLES[level];

                  return (
                    <div
                      key={perm.code}
                      className={cn(
                        'rounded-lg border-2 p-3 flex flex-col items-center gap-2 transition-all duration-200 justify-center',
                        styles.card
                      )}
                    >
                      <Icon className={cn('h-6 w-6', styles.icon)} />
                      <p className="text-xs font-medium text-center leading-tight">{perm.name}</p>
                      <div className="flex gap-0.5 rounded-md bg-muted/50 p-0.5">
                        {ACCESS_LEVELS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleAccessChange(perm.code, opt.value)}
                            className={cn(
                              'px-2 py-1 text-xs rounded font-medium transition-colors',
                              level === opt.value ? styles.segment : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

    </div>
  );
}
