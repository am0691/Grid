/**
 * Activity Plan Complete Demo
 * Full working example with mock data
 */

import { useState } from 'react';
import type { Soul } from '@/types';
import type { ActivityPlan } from '@/domain/entities/activity-plan';
import type { ActivityRecommendation } from '@/domain/entities/recommendation';
import { ActivityPlanPanel } from './ActivityPlanPanel';
import { WeeklyActivityView } from './WeeklyActivityView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock Data
const mockSoul: Soul = {
  id: 'soul-1',
  name: '김제자',
  trainingType: 'disciple',
  startDate: '2024-01-01',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-29T00:00:00Z',
};

const mockPlans: ActivityPlan[] = [
  {
    id: 'plan-1',
    soulId: 'soul-1',
    title: '로마서 1:16-17 암송 점검',
    type: 'meeting',
    status: 'completed',
    scheduledAt: '2024-02-10T14:00:00Z',
    completedAt: '2024-02-10T15:30:00Z',
    areaId: 'memorization',
    week: 2,
    description: '복음의 능력에 대한 확신을 나누며 암송 말씀을 함께 낭송',
    notes: '매우 잘 암송함. 말씀의 의미를 정확히 이해하고 있음.',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-10T15:30:00Z',
  },
  {
    id: 'plan-2',
    soulId: 'soul-1',
    title: 'QT 나눔 시간',
    type: 'meeting',
    status: 'planned',
    scheduledAt: '2024-02-20T10:00:00Z',
    areaId: 'devotion',
    week: 3,
    description: '이번 주 경건의 시간에 받은 은혜 나누기',
    notes: '',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'plan-3',
    soulId: 'soul-1',
    title: '전도 실습',
    type: 'event',
    status: 'planned',
    scheduledAt: '2024-02-25T15:00:00Z',
    areaId: 'witness',
    week: 3,
    description: '캠퍼스 전도 동행',
    notes: '',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'plan-4',
    soulId: 'soul-1',
    title: '성경공부 마무리',
    type: 'study',
    status: 'completed',
    scheduledAt: '2024-02-05T19:00:00Z',
    completedAt: '2024-02-05T20:30:00Z',
    areaId: 'bibleStudy',
    week: 2,
    description: '구원의 확신 교재 2과 마무리',
    notes: '구원의 확신에 대해 확실히 이해함',
    createdAt: '2024-01-30T00:00:00Z',
    updatedAt: '2024-02-05T20:30:00Z',
  },
];

const mockRecommendations: ActivityRecommendation[] = [
  {
    id: 'rec-1',
    trainingType: 'disciple',
    areaId: 'memorization',
    week: 3,
    title: '암송 격려하기',
    description: '암송한 말씀을 함께 낭송하고 격려의 시간을 가지세요',
    bibleVerse: {
      reference: '로마서 1:16',
      text: '내가 복음을 부끄러워하지 아니하노니 이 복음은 모든 믿는 자에게 구원을 주시는 하나님의 능력이 됨이라',
    },
    activities: [
      '암송 말씀을 함께 낭송하기',
      '말씀의 의미 나누기',
      '일상에서 적용할 수 있는 방법 토의하기',
    ],
    tips: [
      '완벽하지 않아도 격려해주세요',
      '말씀의 의미를 이해했는지 확인하세요',
      '일상 적용 예시를 함께 나누세요',
    ],
    goals: ['복음의 능력을 확신하기', '말씀을 마음에 새기기'],
  },
  {
    id: 'rec-2',
    trainingType: 'disciple',
    areaId: 'devotion',
    week: 3,
    title: '경건의 시간 점검',
    description: 'QT의 중요성을 깨닫고 규칙적인 경건의 시간을 갖도록 격려하세요',
    bibleVerse: {
      reference: '여호수아 1:8',
      text: '이 율법책을 네 입에서 떠나지 말게 하며 주야로 그것을 묵상하여',
    },
    activities: [
      'QT 나눔 (이번 주 받은 은혜)',
      '규칙적인 경건의 시간 계획 세우기',
      '기도 제목 나누고 함께 기도하기',
    ],
    tips: [
      '부담 주지 말고 작은 시작을 격려하세요',
      '구체적인 시간대를 정하도록 도와주세요',
    ],
    goals: ['규칙적인 경건의 시간 확립', '말씀 묵상의 기쁨 경험'],
  },
  {
    id: 'rec-3',
    trainingType: 'disciple',
    areaId: 'witness',
    week: 3,
    title: '복음 증거 실습',
    description: '복음을 전하는 경험을 통해 증거의 기쁨을 경험하도록 돕습니다',
    activities: [
      '간단한 복음 제시 연습',
      '전도 대상자 위해 함께 기도',
      '실제 전도 상황 동행',
    ],
    tips: [
      '먼저 기도로 시작하세요',
      '부담 없이 자연스럽게 접근하세요',
      '결과보다 순종에 초점을 맞추세요',
    ],
    goals: ['복음의 능력 확신', '증거의 기쁨 경험'],
  },
];

/**
 * Complete Activity Plan Demo Component
 */
export function ActivityPlanDemo() {
  const [plans, setPlans] = useState<ActivityPlan[]>(mockPlans);
  const [view, setView] = useState<'panel' | 'weekly'>('panel');
  const [selectedWeek, setSelectedWeek] = useState(3);

  // Handlers
  const handleCreatePlan = async (data: any) => {
    const newPlan: ActivityPlan = {
      id: `plan-${Date.now()}`,
      soulId: mockSoul.id,
      title: data.title,
      type: 'meeting',
      status: 'planned',
      scheduledAt: new Date().toISOString(),
      areaId: data.areaId,
      week: data.week,
      description: data.description || '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPlans([...plans, newPlan]);
    console.log('Created plan:', newPlan);
  };

  const handleToggleComplete = (planId: string) => {
    setPlans(
      plans.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              status: plan.status === 'completed' ? 'planned' : 'completed',
              completedAt:
                plan.status === 'completed' ? undefined : new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : plan
      )
    );
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('이 활동을 삭제하시겠습니까?')) {
      setPlans(plans.filter((plan) => plan.id !== planId));
      console.log('Deleted plan:', planId);
    }
  };

  const stats = {
    total: plans.length,
    completed: plans.filter((p) => p.status === 'completed').length,
    recommended: mockRecommendations.length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Plan Components Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-2">Demo Soul Information</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>이름: {mockSoul.name}</p>
                <p>훈련 타입: {mockSoul.trainingType === 'disciple' ? 'Disciple (12개월)' : 'Convert (13주)'}</p>
                <p>시작일: {mockSoul.startDate}</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Statistics</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>전체 활동: {stats.total}개</p>
                <p>완료: {stats.completed}개</p>
                <p>추천: {stats.recommended}개</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">View Mode:</span>
            <Tabs value={view} onValueChange={(v) => setView(v as 'panel' | 'weekly')}>
              <TabsList>
                <TabsTrigger value="panel">Activity Panel</TabsTrigger>
                <TabsTrigger value="weekly">Weekly View</TabsTrigger>
              </TabsList>
            </Tabs>
            {view === 'weekly' && (
              <div className="flex items-center gap-2">
                <span className="text-sm">Week:</span>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="px-2 py-1 border rounded text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((week) => (
                    <option key={week} value={week}>
                      {week}월차
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Component Display */}
      <div className="h-[700px]">
        {view === 'panel' ? (
          <ActivityPlanPanel
            soul={mockSoul}
            plans={plans}
            recommendations={mockRecommendations}
            onCreatePlan={handleCreatePlan}
            onToggleComplete={handleToggleComplete}
            onDeletePlan={handleDeletePlan}
          />
        ) : (
          <WeeklyActivityView
            soul={mockSoul}
            week={selectedWeek}
            plans={plans}
            recommendations={mockRecommendations}
            onToggleComplete={handleToggleComplete}
            onDeletePlan={handleDeletePlan}
          />
        )}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-1">Activity Panel View</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Use tabs to filter activities (All/Recommended/Personal/Completed/Incomplete)</li>
              <li>Click "필터" button to filter by week or area</li>
              <li>Click "활동 추가" to create new personal activities</li>
              <li>Check/uncheck boxes to toggle completion status</li>
              <li>Hover over cards to see edit/delete options</li>
              <li>Click "활동 계획에 추가" on recommended activities to create plans</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Weekly View</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Activities are grouped by training area</li>
              <li>Recommended activities shown with dashed borders</li>
              <li>Personal activities shown in compact mode</li>
              <li>Change week using the dropdown above</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Keyboard Navigation</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Tab to navigate between elements</li>
              <li>Enter/Space to activate buttons</li>
              <li>Escape to close dialogs</li>
              <li>Arrow keys in dropdowns</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ActivityPlanDemo;
