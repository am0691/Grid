/**
 * SoulDetailLayout
 * 영혼 상세 페이지 레이아웃
 * - 탭 네비게이션: 개요, 그리드, 목양 케어, 타임라인
 * - useParams로 soulId 추출
 * - 컨텍스트를 통해 하위 페이지에 soul 정보 전달
 */

import { Outlet, useParams, NavLink, Navigate } from 'react-router-dom';
import { createContext, useContext } from 'react';
import { useSoulStore } from '@/store';
import type { Soul } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  Heart,
  Clock,
  User,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SoulDetailContextValue {
  soul: Soul;
  soulId: string;
}

const SoulDetailContext = createContext<SoulDetailContextValue | null>(null);

export function useSoulDetailContext() {
  const context = useContext(SoulDetailContext);
  if (!context) {
    throw new Error('useSoulDetailContext must be used within SoulDetailLayout');
  }
  return context;
}

const tabs = [
  {
    id: 'overview',
    label: '개요',
    path: '',
    icon: User,
  },
  {
    id: 'grid',
    label: '그리드',
    path: 'grid',
    icon: LayoutGrid,
  },
  {
    id: 'care',
    label: '목양 케어',
    path: 'care',
    icon: Heart,
  },
  {
    id: 'timeline',
    label: '타임라인',
    path: 'timeline',
    icon: Clock,
  },
];

export function SoulDetailLayout() {
  const { soulId } = useParams<{ soulId: string }>();
  const { getSoulById } = useSoulStore();

  // Validate soulId
  if (!soulId) {
    return <Navigate to="/" replace />;
  }

  // Fetch soul data
  const soul = getSoulById(soulId);

  // If soul not found, redirect to home
  if (!soul) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold mb-2">영혼을 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-4">
            요청하신 영혼 정보가 존재하지 않습니다.
          </p>
          <Button asChild>
            <NavLink to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </NavLink>
          </Button>
        </Card>
      </div>
    );
  }

  const trainingTypeLabel = soul.trainingType === 'convert' ? '전도' : '제자';
  const trainingTypeBadgeColor = soul.trainingType === 'convert'
    ? 'bg-growth-light text-growth border-growth/30'
    : 'bg-primary/10 text-primary border-primary/30';

  return (
    <SoulDetailContext.Provider value={{ soul, soulId }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="icon-sm"
                asChild
              >
                <NavLink to="/">
                  <ArrowLeft className="w-4 h-4" />
                </NavLink>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{soul.name}</h1>
              <Badge variant="outline" className={trainingTypeBadgeColor}>
                {trainingTypeLabel}
              </Badge>
            </div>
            <div className="ml-11 text-sm text-muted-foreground">
              시작일: {new Date(soul.startDate).toLocaleDateString('ko-KR')}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Card className="p-0 overflow-hidden">
          <nav className="flex border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const to = tab.path ? `/souls/${soulId}/${tab.path}` : `/souls/${soulId}`;

              return (
                <NavLink
                  key={tab.id}
                  to={to}
                  end={tab.path === ''}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative',
                      'hover:bg-muted/50',
                      isActive
                        ? 'text-primary bg-muted/30'
                        : 'text-muted-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Tab Content */}
          <div className="p-6">
            <Outlet context={{ soul, soulId }} />
          </div>
        </Card>
      </div>
    </SoulDetailContext.Provider>
  );
}
