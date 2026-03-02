/**
 * Supabase Activity Plan Repository Implementation
 * Supabase activity_plans 테이블과 연동하는 활동계획 구현체
 * Demo Mode에서는 localStorage 사용
 */

import { supabase } from '../../services/supabase/client';
import type { ActivityPlan, CreateActivityPlanDto, UpdateActivityPlanDto } from '@/domain/entities/activity-plan';
import type { ActivityPlan as DbActivityPlan, ActivityPlanInsert, ActivityPlanUpdate } from '../../database/schema';

// Demo Mode 체크
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
const DEMO_PLANS_KEY = 'grid_demo_activity_plans';

// Demo Mode용 localStorage 헬퍼
interface DemoPlansStore {
  [soulId: string]: ActivityPlan[];
}

const getDemoPlans = (): DemoPlansStore => {
  try {
    const stored = localStorage.getItem(DEMO_PLANS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveDemoPlans = (plans: DemoPlansStore): void => {
  localStorage.setItem(DEMO_PLANS_KEY, JSON.stringify(plans));
};

/**
 * DB ActivityPlan을 Domain ActivityPlan으로 변환
 */
const mapDbToDomain = (dbPlan: DbActivityPlan): ActivityPlan => {
  return {
    id: dbPlan.id,
    soulId: dbPlan.soul_id,
    title: dbPlan.title,
    type: dbPlan.type,
    status: dbPlan.status,
    scheduledAt: dbPlan.scheduled_at,
    completedAt: dbPlan.completed_at ?? undefined,
    areaId: dbPlan.area_id as ActivityPlan['areaId'],
    week: dbPlan.week,
    location: dbPlan.location ?? undefined,
    description: dbPlan.description ?? undefined,
    notes: dbPlan.notes ?? undefined,
    createdAt: dbPlan.created_at,
    updatedAt: dbPlan.updated_at,
  };
};

/**
 * Soul의 모든 활동 계획 조회
 */
export const getPlansBySoulId = async (soulId: string): Promise<ActivityPlan[]> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoPlans = getDemoPlans();
    return demoPlans[soulId] || [];
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Soul 소유 확인
  const { data: soul, error: soulError } = await supabase
    .from('souls')
    .select('id')
    .eq('id', soulId)
    .eq('user_id', user.id)
    .single();

  if (soulError || !soul) {
    throw new Error('Soul not found or access denied');
  }

  const { data, error } = await supabase
    .from('activity_plans')
    .select('*')
    .eq('soul_id', soulId)
    .order('scheduled_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch activity plans: ${error.message}`);
  }

  return (data || []).map(mapDbToDomain);
};

/**
 * 특정 활동 계획 조회
 */
export const getPlanById = async (id: string): Promise<ActivityPlan | null> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoPlans = getDemoPlans();
    for (const soulPlans of Object.values(demoPlans)) {
      const plan = soulPlans.find(p => p.id === id);
      if (plan) return plan;
    }
    return null;
  }

  const { data, error } = await supabase
    .from('activity_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch activity plan: ${error.message}`);
  }

  return data ? mapDbToDomain(data) : null;
};

/**
 * 활동 계획 생성
 */
export const createPlan = async (input: CreateActivityPlanDto): Promise<ActivityPlan> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoPlans = getDemoPlans();
    const soulPlans = demoPlans[input.soulId] || [];

    const newPlan: ActivityPlan = {
      id: `demo-plan-${Date.now()}`,
      soulId: input.soulId,
      title: input.title,
      type: input.type,
      status: 'planned',
      scheduledAt: input.scheduledAt,
      areaId: input.areaId,
      week: input.week,
      location: input.location,
      description: input.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    soulPlans.unshift(newPlan);
    demoPlans[input.soulId] = soulPlans;
    saveDemoPlans(demoPlans);
    return newPlan;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Soul 소유 확인
  const { data: soul, error: soulError } = await supabase
    .from('souls')
    .select('id')
    .eq('id', input.soulId)
    .eq('user_id', user.id)
    .single();

  if (soulError || !soul) {
    throw new Error('Soul not found or access denied');
  }

  const insertData: ActivityPlanInsert = {
    soul_id: input.soulId,
    title: input.title,
    type: input.type,
    status: 'planned',
    scheduled_at: input.scheduledAt,
    completed_at: null,
    area_id: (input.areaId as string) || '',
    week: input.week || 0,
    location: input.location || null,
    description: input.description || null,
    notes: null,
  };

  const { data, error } = await supabase
    .from('activity_plans')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create activity plan: ${error.message}`);
  }

  return mapDbToDomain(data);
};

/**
 * 활동 계획 업데이트
 */
export const updatePlan = async (id: string, updates: UpdateActivityPlanDto): Promise<ActivityPlan> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoPlans = getDemoPlans();
    for (const [soulId, soulPlans] of Object.entries(demoPlans)) {
      const planIndex = soulPlans.findIndex(p => p.id === id);
      if (planIndex !== -1) {
        const plan = soulPlans[planIndex];
        const updatedPlan: ActivityPlan = {
          ...plan,
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.type !== undefined && { type: updates.type }),
          ...(updates.status !== undefined && { status: updates.status }),
          ...(updates.scheduledAt !== undefined && { scheduledAt: updates.scheduledAt }),
          ...(updates.completedAt !== undefined && { completedAt: updates.completedAt }),
          ...(updates.location !== undefined && { location: updates.location }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
          updatedAt: new Date().toISOString(),
        };
        soulPlans[planIndex] = updatedPlan;
        demoPlans[soulId] = soulPlans;
        saveDemoPlans(demoPlans);
        return updatedPlan;
      }
    }
    throw new Error('Activity plan not found');
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const updateData: ActivityPlanUpdate = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.scheduledAt !== undefined) updateData.scheduled_at = updates.scheduledAt;
  if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const { data, error } = await supabase
    .from('activity_plans')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update activity plan: ${error.message}`);
  }

  return mapDbToDomain(data);
};

/**
 * 활동 계획 삭제
 */
export const deletePlan = async (id: string): Promise<void> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoPlans = getDemoPlans();
    for (const [soulId, soulPlans] of Object.entries(demoPlans)) {
      const planIndex = soulPlans.findIndex(p => p.id === id);
      if (planIndex !== -1) {
        soulPlans.splice(planIndex, 1);
        demoPlans[soulId] = soulPlans;
        saveDemoPlans(demoPlans);
        return;
      }
    }
    return; // Not found, but don't throw error
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('activity_plans')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete activity plan: ${error.message}`);
  }
};

/**
 * 특정 영역/주차의 계획 조회
 */
export const getPlansByAreaAndWeek = async (
  soulId: string,
  areaId: string,
  week: number
): Promise<ActivityPlan[]> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('activity_plans')
    .select('*')
    .eq('soul_id', soulId)
    .eq('area_id', areaId)
    .eq('week', week)
    .order('scheduled_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch plans: ${error.message}`);
  }

  return (data || []).map(mapDbToDomain);
};
