/**
 * Activity Timeline (활동 타임라인)
 * ActivityPlan + PastoralLog를 통합하여 날짜 기준 시간순으로 표시
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Phone,
  BookOpen,
  PartyPopper,
  Heart,
  MoreHorizontal,
  ClipboardList,
  Star,
  Sparkles,
  Filter,
  History,
} from 'lucide-react';
import { useActivityPlanStore } from '@/store/activityPlanStore';
import { usePastoralLogStore } from '@/store/pastoralLogStore';
import type { ActivityPlan, ActivityType } from '@/domain/entities/activity-plan';
import type { PastoralLog } from '@/domain/entities/pastoral-log';

// ─── Props ────────────────────────────────────────────────

interface ActivityTimelineProps {
  soulId: string;
  soulName: string;
}

// ─── 통합 타임라인 아이템 타입 ─────────────────────────────

type TimelineItemKind = 'plan' | 'log';

interface TimelineItem {
  kind: TimelineItemKind;
  id: string;
  date: string; // ISO string (정렬 기준)
  data: ActivityPlan | PastoralLog;
}

// ─── 날짜 범위 옵션 ────────────────────────────────────────

type DateRange = '1w' | '1m' | '3m' | 'all';

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  '1w': '최근 1주',
  '1m': '최근 1개월',
  '3m': '최근 3개월',
  all: '전체',
};

// ─── 활동 타입 필터 옵션 ───────────────────────────────────

type FilterType = ActivityType | 'pastoral_log' | 'all';

const FILTER_LABELS: Record<FilterType, string> = {
  all: '전체',
  meeting: '만남/양육',
  call: '전화',
  study: '성경공부',
  event: '행사',
  prayer: '기도',
  other: '기타',
  pastoral_log: '목양 일지',
};

// ─── 아이콘 헬퍼 ──────────────────────────────────────────

function ActivityTypeIcon({ type, className }: { type: ActivityType; className?: string }) {
  const props = { className: className ?? 'h-4 w-4' };
  switch (type) {
    case 'meeting': return <Calendar {...props} />;
    case 'call':    return <Phone {...props} />;
    case 'study':   return <BookOpen {...props} />;
    case 'event':   return <PartyPopper {...props} />;
    case 'prayer':  return <Heart {...props} />;
    default:        return <MoreHorizontal {...props} />;
  }
}

// ─── 상태 배지 ────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  planned: '예정',
  'in-progress': '진행중',
  completed: '완료',
  cancelled: '취소',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  planned: 'secondary',
  'in-progress': 'default',
  completed: 'outline',
  cancelled: 'destructive',
};

// ─── 무드 배지 ────────────────────────────────────────────

const MOOD_LABELS: Record<string, string> = {
  growing: '성장중',
  stable: '정체기',
  struggling: '위기',
};

const MOOD_COLORS: Record<string, string> = {
  growing: 'bg-growth-light text-growth border-growth/20',
  stable: 'bg-warning-light text-warning border-warning/20',
  struggling: 'bg-danger-light text-danger border-danger/20',
};

// ─── 날짜 포맷 ────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });
}

// ─── ActivityPlan 아이템 ───────────────────────────────────

function PlanTimelineItem({ plan }: { plan: ActivityPlan }) {
  return (
    <div className="p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-muted-foreground shrink-0">
            <ActivityTypeIcon type={plan.type} />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{plan.title}</p>
            <p className="text-xs text-muted-foreground">{FILTER_LABELS[plan.type]}</p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANTS[plan.status]} className="shrink-0 text-xs">
          {STATUS_LABELS[plan.status]}
        </Badge>
      </div>

      {plan.description && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
      )}

      {plan.location && (
        <p className="mt-1 text-xs text-muted-foreground">📍 {plan.location}</p>
      )}

      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {formatDate(plan.scheduledAt)}
      </div>
    </div>
  );
}

// ─── PastoralLog 아이템 ────────────────────────────────────

function LogTimelineItem({ log }: { log: PastoralLog }) {
  const summary = log.observations
    ? log.observations.slice(0, 60) + (log.observations.length > 60 ? '...' : '')
    : null;

  return (
    <div
      className={`p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors ${
        log.hasBreakthrough ? 'border-warning/30 ring-1 ring-warning/10' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-muted-foreground shrink-0">
            <ClipboardList className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-sm flex items-center gap-1">
              목양 일지
              {log.hasBreakthrough && (
                <Sparkles className="h-3.5 w-3.5 text-warning shrink-0" />
              )}
            </p>
            {log.breakthroughTitle && log.hasBreakthrough && (
              <p className="text-xs text-warning font-medium truncate">
                {log.breakthroughTitle}
              </p>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${MOOD_COLORS[log.mood]}`}
        >
          {MOOD_LABELS[log.mood]}
        </span>
      </div>

      {summary && (
        <p className="mt-2 text-xs text-muted-foreground">{summary}</p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDate(log.recordedAt)}
        </div>
        {log.rating != null && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < log.rating! ? 'text-warning fill-warning' : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────

export function ActivityTimeline({ soulId }: ActivityTimelineProps) {
  const plans = useActivityPlanStore((s) => s.plans[soulId] || []);
  const logs  = usePastoralLogStore((s) => s.logs[soulId]  || []);

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dateRange, setDateRange]   = useState<DateRange>('all');

  // 날짜 범위 계산
  const cutoff = useMemo(() => {
    const now = Date.now();
    if (dateRange === '1w') return now - 7 * 24 * 60 * 60 * 1000;
    if (dateRange === '1m') return now - 30 * 24 * 60 * 60 * 1000;
    if (dateRange === '3m') return now - 90 * 24 * 60 * 60 * 1000;
    return 0;
  }, [dateRange]);

  // 통합 아이템 생성
  const allItems = useMemo<TimelineItem[]>(() => {
    const planItems: TimelineItem[] = plans.map((p) => ({
      kind: 'plan',
      id: p.id,
      date: p.scheduledAt,
      data: p,
    }));

    const logItems: TimelineItem[] = logs.map((l) => ({
      kind: 'log',
      id: l.id,
      date: l.recordedAt,
      data: l,
    }));

    return [...planItems, ...logItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [plans, logs]);

  // 필터 적용
  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      // 날짜 범위
      if (cutoff > 0 && new Date(item.date).getTime() < cutoff) return false;

      // 타입 필터
      if (filterType === 'all') return true;
      if (filterType === 'pastoral_log') return item.kind === 'log';
      return item.kind === 'plan' && (item.data as ActivityPlan).type === filterType;
    });
  }, [allItems, filterType, cutoff]);

  // 월별 그룹핑
  const grouped = useMemo(() => {
    const map = new Map<string, TimelineItem[]>();
    for (const item of filtered) {
      const key = formatMonth(item.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-5 w-5 text-primary" />
            활동 내역
            <span className="text-sm font-normal text-muted-foreground">
              ({filtered.length}건)
            </span>
          </CardTitle>

          <div className="flex items-center gap-2 flex-wrap">
            {/* 타입 필터 */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
                <SelectTrigger className="h-8 text-xs w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FILTER_LABELS) as FilterType[]).map((key) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {FILTER_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 날짜 범위 */}
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="h-8 text-xs w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map((key) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {DATE_RANGE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">표시할 활동 내역이 없습니다</p>
            <p className="text-xs mt-1 opacity-70">
              활동 계획이나 목양 일지를 추가하면 여기에 표시됩니다
            </p>
            {(filterType !== 'all' || dateRange !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => { setFilterType('all'); setDateRange('all'); }}
              >
                필터 초기화
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[480px] pr-2">
            <div className="space-y-6">
              {grouped.map(([month, items]) => (
                <div key={month}>
                  {/* 월 헤더 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {month}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">{items.length}건</span>
                  </div>

                  {/* 세로 타임라인 */}
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />

                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="relative">
                          {/* 타임라인 점 */}
                          <div
                            className={`absolute -left-[18px] top-3.5 w-3 h-3 rounded-full border-2 border-background ${
                              item.kind === 'log'
                                ? (item.data as PastoralLog).hasBreakthrough
                                  ? 'bg-warning'
                                  : 'bg-primary'
                                : 'bg-muted-foreground'
                            }`}
                          />

                          {item.kind === 'plan' ? (
                            <PlanTimelineItem plan={item.data as ActivityPlan} />
                          ) : (
                            <LogTimelineItem log={item.data as PastoralLog} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
