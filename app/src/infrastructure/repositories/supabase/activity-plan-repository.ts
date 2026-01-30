/**
 * Supabase Activity Plan Repository Implementation
 * Supabase activity_plans 테이블과 연동하는 활동계획 구현체
 */

import { supabase } from '../../services/supabase/client';
import type { ActivityPlan as DbActivityPlan, ActivityPlanInsert, ActivityPlanUpdate } from '../../database/schema';

/**
 * 활동 계획 인터페이스 (앱에서 사용)
 */
export interface ActivityPlan {
  id: string;
  soulId: string;
  areaId: string;
  week: number;
  planType: 'recommended' | 'custom';
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanInput {
  soulId: string;
  areaId: string;
  week: number;
  title: string;
  description?: string;
  planType?: 'recommended' | 'custom';
}

export interface UpdatePlanInput {
  title?: string;
  description?: string;
  isCompleted?: boolean;
}

/**
 * DB ActivityPlan을 Domain ActivityPlan으로 변환
 */
const mapDbToDomain = (dbPlan: DbActivityPlan): ActivityPlan => {
  return {
    id: dbPlan.id,
    soulId: dbPlan.soul_id,
    areaId: dbPlan.area_id,
    week: dbPlan.week,
    planType: dbPlan.plan_type,
    title: dbPlan.title,
    description: dbPlan.description,
    isCompleted: dbPlan.is_completed,
    createdAt: dbPlan.created_at,
    updatedAt: dbPlan.updated_at,
  };
};

/**
 * Soul의 모든 활동 계획 조회
 */
export const getPlansBySoulId = async (soulId: string): Promise<ActivityPlan[]> => {
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
    .order('week', { ascending: true })
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
export const createPlan = async (input: CreatePlanInput): Promise<ActivityPlan> => {
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
    area_id: input.areaId,
    week: input.week,
    title: input.title,
    description: input.description || null,
    plan_type: input.planType || 'custom',
    is_completed: false,
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
export const updatePlan = async (id: string, updates: UpdatePlanInput): Promise<ActivityPlan> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const updateData: ActivityPlanUpdate = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;

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
 * 활동 계획 완료 토글
 */
export const togglePlanComplete = async (id: string): Promise<ActivityPlan> => {
  const plan = await getPlanById(id);

  if (!plan) {
    throw new Error('Activity plan not found');
  }

  return updatePlan(id, { isCompleted: !plan.isCompleted });
};

/**
 * 활동 계획 삭제
 */
export const deletePlan = async (id: string): Promise<void> => {
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
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch plans: ${error.message}`);
  }

  return (data || []).map(mapDbToDomain);
};
