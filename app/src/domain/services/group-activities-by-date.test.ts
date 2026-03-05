import { describe, it, expect } from 'vitest';
import { groupActivitiesByDate } from './group-activities-by-date';
import type { ActivityPlan } from '../entities/activity-plan';

function makePlan(overrides: Partial<ActivityPlan> & { scheduledAt: string; soulId: string }): ActivityPlan {
  return {
    id: 'plan-1',
    title: 'Test Activity',
    type: 'meeting',
    status: 'planned',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

const soulMap = new Map([
  ['soul-1', { name: '김철수', trainingType: 'convert' as const }],
  ['soul-2', { name: '이영희', trainingType: 'disciple' as const }],
]);

describe('groupActivitiesByDate', () => {
  // 기준일: 2026-03-05 (목요일)
  const baseDate = new Date('2026-03-05T09:00:00');

  it('오늘 예정된 활동을 "오늘" 그룹에 분류한다', () => {
    const plans: ActivityPlan[] = [
      makePlan({ id: 'p1', soulId: 'soul-1', title: '복음 나누기', scheduledAt: '2026-03-05T10:00:00' }),
    ];

    const groups = groupActivitiesByDate(plans, soulMap, baseDate);
    const todayGroup = groups.find(g => g.key === 'today');

    expect(todayGroup).toBeDefined();
    expect(todayGroup!.label).toBe('오늘');
    expect(todayGroup!.activities).toHaveLength(1);
    expect(todayGroup!.activities[0].title).toBe('복음 나누기');
    expect(todayGroup!.activities[0].soulName).toBe('김철수');
  });

  it('내일 예정된 활동을 "내일" 그룹에 분류한다', () => {
    const plans: ActivityPlan[] = [
      makePlan({ id: 'p1', soulId: 'soul-2', title: '성경 읽기', scheduledAt: '2026-03-06T14:00:00' }),
    ];

    const groups = groupActivitiesByDate(plans, soulMap, baseDate);
    const tomorrowGroup = groups.find(g => g.key === 'tomorrow');

    expect(tomorrowGroup).toBeDefined();
    expect(tomorrowGroup!.label).toBe('내일');
    expect(tomorrowGroup!.activities).toHaveLength(1);
    expect(tomorrowGroup!.activities[0].soulName).toBe('이영희');
  });

  it('이번 주 나머지 활동을 "이번 주" 그룹에 분류한다', () => {
    const plans: ActivityPlan[] = [
      // 2026-03-07 (토요일) - 이번 주
      makePlan({ id: 'p1', soulId: 'soul-1', title: '큐티 나눔', scheduledAt: '2026-03-07T10:00:00' }),
    ];

    const groups = groupActivitiesByDate(plans, soulMap, baseDate);
    const thisWeekGroup = groups.find(g => g.key === 'thisWeek');

    expect(thisWeekGroup).toBeDefined();
    expect(thisWeekGroup!.activities).toHaveLength(1);
  });

  it('다음 주 활동을 "다음 주" 그룹에 분류한다', () => {
    const plans: ActivityPlan[] = [
      // 2026-03-09 (월요일) - 다음 주
      makePlan({ id: 'p1', soulId: 'soul-1', title: '암송 점검', scheduledAt: '2026-03-10T10:00:00' }),
    ];

    const groups = groupActivitiesByDate(plans, soulMap, baseDate);
    const nextWeekGroup = groups.find(g => g.key === 'nextWeek');

    expect(nextWeekGroup).toBeDefined();
    expect(nextWeekGroup!.activities).toHaveLength(1);
  });

  it('완료된 활동은 제외한다', () => {
    const plans: ActivityPlan[] = [
      makePlan({ id: 'p1', soulId: 'soul-1', title: '완료 활동', scheduledAt: '2026-03-05T10:00:00', status: 'completed' }),
      makePlan({ id: 'p2', soulId: 'soul-1', title: '미완료 활동', scheduledAt: '2026-03-05T11:00:00', status: 'planned' }),
    ];

    const groups = groupActivitiesByDate(plans, soulMap, baseDate);
    const todayGroup = groups.find(g => g.key === 'today');

    expect(todayGroup!.activities).toHaveLength(1);
    expect(todayGroup!.activities[0].title).toBe('미완료 활동');
  });

  it('과거 활동은 제외한다', () => {
    const plans: ActivityPlan[] = [
      makePlan({ id: 'p1', soulId: 'soul-1', title: '과거 활동', scheduledAt: '2026-03-03T10:00:00' }),
    ];

    const groups = groupActivitiesByDate(plans, soulMap, baseDate);
    expect(groups.every(g => g.activities.length === 0)).toBe(true);
  });

  it('그룹 내 활동은 시간순으로 정렬된다', () => {
    const plans: ActivityPlan[] = [
      makePlan({ id: 'p1', soulId: 'soul-1', title: '오후 활동', scheduledAt: '2026-03-05T15:00:00' }),
      makePlan({ id: 'p2', soulId: 'soul-2', title: '오전 활동', scheduledAt: '2026-03-05T09:00:00' }),
    ];

    const groups = groupActivitiesByDate(plans, soulMap, baseDate);
    const todayGroup = groups.find(g => g.key === 'today');

    expect(todayGroup!.activities[0].title).toBe('오전 활동');
    expect(todayGroup!.activities[1].title).toBe('오후 활동');
  });

  it('활동이 없는 그룹은 빈 배열을 가진다', () => {
    const groups = groupActivitiesByDate([], soulMap, baseDate);
    groups.forEach(g => {
      expect(g.activities).toHaveLength(0);
    });
  });

  it('영역 정보가 포함된다', () => {
    const plans: ActivityPlan[] = [
      makePlan({ id: 'p1', soulId: 'soul-1', title: '활동', scheduledAt: '2026-03-05T10:00:00', areaId: 'salvation' as any }),
    ];

    const groups = groupActivitiesByDate(plans, soulMap, baseDate);
    const activity = groups.find(g => g.key === 'today')!.activities[0];

    expect(activity.areaId).toBe('salvation');
    expect(activity.trainingType).toBe('convert');
  });
});
