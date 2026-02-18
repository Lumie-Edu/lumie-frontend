'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  usePermissionsByCategory,
  usePositionPermissions,
  useSetPositionPermissions,
  type AccessLevel,
} from '@/entities/permission';
import { useActivePositions } from '@/entities/position';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  { value: 'WRITE', label: '전체' },
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

export function PermissionEditor() {
  const [selectedPositionId, setSelectedPositionId] = useState<number>(0);
  const [permissionMap, setPermissionMap] = useState<Record<string, AccessLevel>>({});
  const [isDirty, setIsDirty] = useState(false);

  const { data: positions, isLoading: isLoadingPositions } = useActivePositions();
  const { data: categories, isLoading: isLoadingPerms } = usePermissionsByCategory();
  const { data: positionPermissions, isLoading: isLoadingPosPerms } = usePositionPermissions(selectedPositionId);
  const { mutate: savePermissions, isPending: isSaving } = useSetPositionPermissions(selectedPositionId);

  useEffect(() => {
    if (positionPermissions && categories) {
      const map: Record<string, AccessLevel> = {};
      categories.forEach((cat) =>
        cat.permissions.forEach((p) => {
          map[p.code] = 'NONE';
        })
      );
      positionPermissions.forEach((entry) => {
        map[entry.permissionCode] = entry.accessLevel;
      });
      setPermissionMap(map);
      setIsDirty(false);
    }
  }, [positionPermissions, categories]);

  const handleAccessChange = (code: string, level: AccessLevel) => {
    setPermissionMap((prev) => ({ ...prev, [code]: level }));
    setIsDirty(true);
  };

  const handleCategoryBulk = (category: { permissions: { code: string }[] }, level: AccessLevel) => {
    setPermissionMap((prev) => {
      const next = { ...prev };
      category.permissions.forEach((p) => {
        next[p.code] = level;
      });
      return next;
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    savePermissions(permissionMap, {
      onSuccess: () => setIsDirty(false),
    });
  };

  const selectedPosition = positions?.find((p) => p.id === selectedPositionId);

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

  return (
    <div className="space-y-4">
      {/* Position Select + Save */}
      <div className="flex items-center gap-3">
        <Select
          value={selectedPositionId ? String(selectedPositionId) : ''}
          onValueChange={(v) => setSelectedPositionId(Number(v))}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="직책 선택" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingPositions ? (
              <SelectItem value="loading" disabled>로딩 중...</SelectItem>
            ) : (
              positions?.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {isDirty && (
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        )}
      </div>

      {/* Permission Cards */}
      {!selectedPositionId ? (
        <div className="text-center py-10 bg-muted/50 rounded-lg">
          <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">직책을 선택하여 권한을 설정하세요.</p>
        </div>
      ) : isLoadingPerms || isLoadingPosPerms ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-32 rounded" />
              <div className="grid grid-cols-2 smalltablet:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-36 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-1">
          {selectedPosition && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{selectedPosition.name}</span> 직책의 권한을 설정합니다.
            </p>
          )}

          {CATEGORY_ORDER.flatMap((catKey) => {
            const cat = categories?.find((c) => c.category === catKey);
            return cat ? [cat] : [];
          }).map((cat) => {
            const categoryLabel = CATEGORY_LABELS[cat.category] ?? cat.category;
            const CategoryIcon = CATEGORY_ICONS[cat.category] ?? Shield;
            const stats = categoryStats[cat.category];

            return (
              <section key={cat.category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-base font-semibold">{categoryLabel}</h2>
                    {stats && (
                      <Badge variant="secondary" className="text-xs">
                        {stats.write + stats.read}/{stats.total}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {ACCESS_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => handleCategoryBulk(cat, level.value)}
                        className="px-2 py-1 text-xs rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        전체 {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 smalltablet:grid-cols-3 gap-3">
                  {cat.permissions.map((perm) => {
                    const Icon = PERMISSION_ICONS[perm.code] ?? Shield;
                    const level = permissionMap[perm.code] ?? 'NONE';
                    const styles = LEVEL_STYLES[level];

                    return (
                      <div
                        key={perm.code}
                        className={cn(
                          'rounded-xl border-2 p-4 flex flex-col items-center text-center transition-all duration-200',
                          styles.card
                        )}
                      >
                        <Icon className={cn('h-8 w-8 mb-2', styles.icon)} />
                        <p className="text-sm font-medium leading-tight">{perm.name}</p>
                        {perm.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{perm.description}</p>
                        )}
                        <div className="flex w-full mt-auto pt-3 gap-0.5 rounded-lg bg-muted/50 p-0.5">
                          {ACCESS_LEVELS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleAccessChange(perm.code, opt.value)}
                              className={cn(
                                'flex-1 text-xs py-1.5 rounded-md font-medium transition-colors',
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
      )}
    </div>
  );
}
