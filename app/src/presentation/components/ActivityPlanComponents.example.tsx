/**
 * Activity Plan Components Usage Example
 *
 * This file demonstrates how to use the activity plan UI components
 */

import { useState } from 'react';
import type { Soul } from '@/types';
import type { ActivityPlan } from '@/domain/entities/activity-plan';
import type { ActivityRecommendation } from '@/domain/entities/recommendation';
import {
  ActivityPlanCard,
  ActivityPlanPanel,
  AddActivityPlanDialog,
  WeeklyActivityView,
} from './index';

// Example usage of ActivityPlanCard
export function ActivityPlanCardExample() {
  const soul: Soul = {
    id: '1',
    name: '홍길동',
    trainingType: 'disciple',
    startDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const plan: ActivityPlan = {
    id: '1',
    soulId: '1',
    title: '암송 점검',
    type: 'meeting',
    status: 'planned',
    scheduledAt: '2024-02-15T10:00:00Z',
    areaId: 'memorization',
    week: 3,
    description: '로마서 1:16-17 암송 점검 및 격려',
    notes: '',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  };

  const handleToggleComplete = (planId: string) => {
    console.log('Toggle complete:', planId);
  };

  const handleEdit = (plan: ActivityPlan) => {
    console.log('Edit plan:', plan);
  };

  const handleDelete = (planId: string) => {
    console.log('Delete plan:', planId);
  };

  return (
    <ActivityPlanCard
      plan={plan}
      soul={soul}
      onToggleComplete={handleToggleComplete}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}

// Example usage of ActivityPlanPanel
export function ActivityPlanPanelExample() {
  const soul: Soul = {
    id: '1',
    name: '홍길동',
    trainingType: 'disciple',
    startDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const plans: ActivityPlan[] = [
    {
      id: '1',
      soulId: '1',
      title: '암송 점검',
      type: 'meeting',
      status: 'completed',
      scheduledAt: '2024-02-15T10:00:00Z',
      completedAt: '2024-02-15T11:00:00Z',
      areaId: 'memorization',
      week: 3,
      description: '로마서 1:16-17 암송 점검',
      createdAt: '2024-02-01',
      updatedAt: '2024-02-15',
    },
    {
      id: '2',
      soulId: '1',
      title: '경건의 시간 나눔',
      type: 'meeting',
      status: 'planned',
      scheduledAt: '2024-02-20T14:00:00Z',
      areaId: 'devotion',
      week: 4,
      description: 'QT 나눔 및 기도 제목 공유',
      createdAt: '2024-02-10',
      updatedAt: '2024-02-10',
    },
  ];

  const recommendations: ActivityRecommendation[] = [
    {
      id: 'rec-1',
      trainingType: 'disciple',
      areaId: 'memorization',
      week: 3,
      title: '암송 격려하기',
      description: '암송한 말씀을 함께 낭송하고 격려의 시간을 가지세요',
      activities: [
        '암송 말씀 함께 낭송하기',
        '말씀의 의미 나누기',
        '일상 적용 방법 토의',
      ],
      tips: ['부담 주지 말고 격려 위주로', '완벽하지 않아도 칭찬하기'],
    },
  ];

  const handleCreatePlan = async (data: any) => {
    console.log('Create plan:', data);
    // API call to create plan
  };

  const handleToggleComplete = (planId: string) => {
    console.log('Toggle complete:', planId);
    // API call to update status
  };

  const handleDeletePlan = async (planId: string) => {
    console.log('Delete plan:', planId);
    // API call to delete plan
  };

  return (
    <div className="h-[600px]">
      <ActivityPlanPanel
        soul={soul}
        plans={plans}
        recommendations={recommendations}
        onCreatePlan={handleCreatePlan}
        onToggleComplete={handleToggleComplete}
        onDeletePlan={handleDeletePlan}
      />
    </div>
  );
}

// Example usage of AddActivityPlanDialog
export function AddActivityPlanDialogExample() {
  const [open, setOpen] = useState(false);

  const soul: Soul = {
    id: '1',
    name: '홍길동',
    trainingType: 'convert',
    startDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const handleSubmit = async (data: any) => {
    console.log('Submit:', data);
    // API call to create activity plan
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>활동 추가</button>
      <AddActivityPlanDialog
        soul={soul}
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        defaultAreaId="salvation"
        defaultWeek={2}
      />
    </>
  );
}

// Example usage of WeeklyActivityView
export function WeeklyActivityViewExample() {
  const soul: Soul = {
    id: '1',
    name: '홍길동',
    trainingType: 'disciple',
    startDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const plans: ActivityPlan[] = [
    {
      id: '1',
      soulId: '1',
      title: '암송 점검',
      type: 'meeting',
      status: 'completed',
      scheduledAt: '2024-02-15T10:00:00Z',
      completedAt: '2024-02-15T11:00:00Z',
      areaId: 'memorization',
      week: 3,
      createdAt: '2024-02-01',
      updatedAt: '2024-02-15',
    },
    {
      id: '2',
      soulId: '1',
      title: '경건의 시간 나눔',
      type: 'meeting',
      status: 'planned',
      scheduledAt: '2024-02-20T14:00:00Z',
      areaId: 'devotion',
      week: 3,
      createdAt: '2024-02-10',
      updatedAt: '2024-02-10',
    },
  ];

  const recommendations: ActivityRecommendation[] = [
    {
      id: 'rec-1',
      trainingType: 'disciple',
      areaId: 'memorization',
      week: 3,
      title: '암송 격려하기',
      description: '암송한 말씀을 함께 낭송하고 격려의 시간을 가지세요',
      activities: ['암송 말씀 함께 낭송하기', '말씀의 의미 나누기'],
    },
  ];

  const handleToggleComplete = (planId: string) => {
    console.log('Toggle complete:', planId);
  };

  const handleDeletePlan = async (planId: string) => {
    console.log('Delete plan:', planId);
  };

  return (
    <div className="h-[600px]">
      <WeeklyActivityView
        soul={soul}
        week={3}
        plans={plans}
        recommendations={recommendations}
        onToggleComplete={handleToggleComplete}
        onDeletePlan={handleDeletePlan}
      />
    </div>
  );
}

// Full integration example with GridView
export function GridViewIntegrationExample() {
  return (
    <div>
      <h2>Grid View Integration</h2>
      <p>
        The activity plan components are integrated into GridView. When viewing a soul's
        GRID:
      </p>
      <ol>
        <li>Click the "활동 계획" tab to switch from grid view to activity view</li>
        <li>
          Hover over grid cells to see a small activity icon - click it to view activities
          for that week
        </li>
        <li>Use the filters to narrow down activities by type, area, or week</li>
        <li>Toggle completion status with checkboxes</li>
        <li>Add new personal activities with the "활동 추가" button</li>
      </ol>
    </div>
  );
}
