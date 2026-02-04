'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  UserCog,
  TrendingUp,
  ClipboardCheck,
  FileText,
  Headphones,
  Megaphone,
  FolderOpen,
  MessageCircleQuestion,
  MessageSquare,
  BookOpen,
  LayoutGrid,
  Star,
  Building2,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  Settings,
  CalendarCheck,
  ClipboardList,
  Send,
  CreditCard,
  Package,
  Wallet,
  GraduationCap,
  BarChart3,
  Calendar,
  ChartPie,
  Target,
  LineChart,
  SearchX,
  Sparkles,
  ArrowUpRight,
  Building,
  Globe,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface NavItem {
  href: string | null;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: '유저 관리',
    icon: Users,
    items: [
      { href: '/admin/students', label: '수강생 관리', icon: GraduationCap },
      { href: '/admin/staff', label: '직원 관리', icon: UserCog },
      { href: null, label: '출석 관리', icon: CalendarCheck },
    ],
  },
  {
    label: '학습 관리',
    icon: TrendingUp,
    items: [
      { href: null, label: '과제 관리', icon: ClipboardList },
      { href: '/admin/grades', label: '성적 관리', icon: BarChart3 },
      { href: '/admin/omr-grading', label: '시험 채점', icon: ClipboardCheck },
      { href: '/admin/reports', label: '학습 리포트', icon: FileText },
      { href: '/admin/listening', label: '리스닝 생성', icon: Headphones },
    ],
  },
  {
    label: '분석',
    icon: ChartPie,
    items: [
      { href: null, label: '백분위/석차', icon: Target },
      { href: null, label: '성적 안정성', icon: LineChart },
      { href: null, label: '성장 추이', icon: ArrowUpRight },
      { href: null, label: '오답 분석', icon: SearchX },
    ],
  },
  {
    label: '소통',
    icon: MessageSquare,
    items: [
      { href: '/admin/announcements', label: '학원 공지', icon: Megaphone },
      { href: null, label: '문자 전송', icon: Send },
      { href: '/admin/resources', label: '학원 자료실', icon: FolderOpen },
      { href: '/admin/qna', label: 'QnA 관리', icon: MessageCircleQuestion },
      { href: '/admin/schedules', label: '상담 관리', icon: Calendar },
    ],
  },
  {
    label: '운영 관리',
    icon: Wallet,
    items: [
      { href: null, label: '비용 수납', icon: CreditCard },
      { href: null, label: '재고 관리', icon: Package },
      { href: null, label: '교재 관리', icon: BookOpen },
    ],
  },
  {
    label: '학원 정보',
    icon: Building2,
    items: [
      { href: '/admin/academies', label: '단과 관리', icon: LayoutGrid },
      { href: '/admin/reviews', label: '리뷰 관리', icon: Star },
      { href: null, label: '학원 성장률', icon: Building },
    ],
  },
];

const singleMenuItems: NavItem[] = [
  { href: null, label: 'AI', icon: Sparkles },
  { href: null, label: '홈페이지', icon: Globe },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent group-data-[collapsible=icon]:justify-center">
              <span className="text-2xl font-bold leading-none group-data-[collapsible=icon]:hidden">Lumie</span>
              <span className="text-2xl font-bold leading-none hidden group-data-[collapsible=icon]:block">L</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {singleMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href
                  ? pathname === item.href || pathname.startsWith(item.href + '/')
                  : false;
                const isAI = item.label === 'AI';

                if (item.href) {
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className="text-base font-semibold">
                        <Link href={item.href}>
                          <Icon className="!h-5 !w-5" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                if (isAI) {
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton tooltip={item.label} className="text-base font-semibold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white cursor-not-allowed">
                        <Icon className="!h-5 !w-5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton tooltip={item.label} className="text-base font-semibold text-muted-foreground cursor-not-allowed">
                      <Icon className="!h-5 !w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {navGroups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <Collapsible key={group.label} defaultOpen className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={group.label} className="text-base font-semibold">
                          <GroupIcon className="!h-5 !w-5" />
                          <span>{group.label}</span>
                          <ChevronRight className="ml-auto !h-5 !w-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.items.map((item) => {
                            const isActive = item.href
                              ? pathname === item.href || pathname.startsWith(item.href + '/')
                              : false;
                            const Icon = item.icon;

                            if (item.href) {
                              return (
                                <SidebarMenuSubItem key={item.label}>
                                  <SidebarMenuSubButton asChild isActive={isActive} size="md" className="text-base">
                                    <Link href={item.href}>
                                      <Icon className="h-4 w-4" />
                                      <span>{item.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            }

                            return (
                              <SidebarMenuSubItem key={item.label}>
                                <SidebarMenuSubButton size="md" className="text-base text-muted-foreground cursor-not-allowed">
                                  <Icon className="h-4 w-4" />
                                  <span>{item.label}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/avatars/admin.png" alt="관리자" />
                    <AvatarFallback className="rounded-lg">관리</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">관리자</span>
                    <span className="truncate text-xs text-muted-foreground">admin@lumie.kr</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
