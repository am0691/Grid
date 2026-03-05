/**
 * Domain Service: 활동 계획을 날짜별로 그룹핑
 * Pure function — no side effects, no dependencies on infrastructure
 */

import type { ActivityPlan } from '../entities/activity-plan';
import type { Area } from '../value-objects/area';

export interface UpcomingActivity {
  id: string;
  soulId: string;
  soulName: string;
  title: string;
  scheduledAt: string;
  status: ActivityPlan['status'];
  areaId?: Area;
  trainingType: 'convert' | 'disciple';
}

export interface ActivityDateGroup {
  key: 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek';
  label: string;
  dateRange: string;
  activities: UpcomingActivity[];
}

interface SoulInfo {
  name: string;
  trainingType: 'convert' | 'disciple';
}

export function groupActivitiesByDate(
  plans: ActivityPlan[],
  soulMap: Map<string, SoulInfo>,
  now: Date = new Date(),
): ActivityDateGroup[] {
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2);
  const endOfWeek = getEndOfWeek(today);
  const endOfNextWeek = addDays(endOfWeek, 7);

  const groups: ActivityDateGroup[] = [
    { key: 'today', label: '오늘', dateRange: formatDate(today), activities: [] },
    { key: 'tomorrow', label: '내일', dateRange: formatDate(tomorrow), activities: [] },
    { key: 'thisWeek', label: '이번 주', dateRange: `${formatDate(dayAfterTomorrow)}~${formatDate(endOfWeek)}`, activities: [] },
    { key: 'nextWeek', label: '다음 주', dateRange: `${formatDate(addDays(endOfWeek, 1))}~${formatDate(endOfNextWeek)}`, activities: [] },
  ];

  const filtered = plans
    .filter(p => p.status !== 'completed' && p.status !== 'cancelled')
    .filter(p => {
      const d = startOfDay(new Date(p.scheduledAt));
      return d >= today && d < endOfNextWeek;
    });

  for (const plan of filtered) {
    const d = startOfDay(new Date(plan.scheduledAt));
    const soulInfo = soulMap.get(plan.soulId);
    const activity: UpcomingActivity = {
      id: plan.id,
      soulId: plan.soulId,
      soulName: soulInfo?.name ?? '(알 수 없음)',
      title: plan.title,
      scheduledAt: plan.scheduledAt,
      status: plan.status,
      areaId: plan.areaId,
      trainingType: soulInfo?.trainingType ?? 'convert',
    };

    if (d.getTime() === today.getTime()) {
      groups[0].activities.push(activity);
    } else if (d.getTime() === tomorrow.getTime()) {
      groups[1].activities.push(activity);
    } else if (d <= endOfWeek) {
      groups[2].activities.push(activity);
    } else {
      groups[3].activities.push(activity);
    }
  }

  // 각 그룹 내 시간순 정렬
  for (const group of groups) {
    group.activities.sort((a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }

  return groups;
}

// --- Pure date helpers (no external deps needed) ---

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getEndOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + daysUntilSunday);
  return d;
}

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
