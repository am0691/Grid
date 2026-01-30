/**
 * GRID Database Query Examples
 *
 * This file contains example queries for common database operations.
 * Use these as reference when implementing your database layer.
 *
 * NOTE: Replace 'supabase' with your actual Supabase client instance.
 */

import type {
  SoulInsert,
  ProgressInsert,
  ActivityPlanInsert,
  ActivityRecommendation,
  TrainingType,
} from './schema';

// ============================================================================
// PROFILES
// ============================================================================

/**
 * Get current user's profile
 */
export async function getCurrentProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

/**
 * Update current user's profile
 */
export async function updateProfile(userId: string, updates: {
  full_name?: string;
  avatar_url?: string;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

// ============================================================================
// SOULS
// ============================================================================

/**
 * Get all souls for current user
 */
export async function getAllSouls(userId: string) {
  const { data, error } = await supabase
    .from('souls')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get souls by training type
 */
export async function getSoulsByType(userId: string, trainingType: TrainingType) {
  const { data, error } = await supabase
    .from('souls')
    .select('*')
    .eq('user_id', userId)
    .eq('training_type', trainingType)
    .order('name');

  return { data, error };
}

/**
 * Get single soul with all details
 */
export async function getSoulWithDetails(soulId: string) {
  const { data, error } = await supabase
    .from('souls')
    .select(`
      *,
      progress (*),
      activity_plans (*)
    `)
    .eq('id', soulId)
    .single();

  return { data, error };
}

/**
 * Create a new soul
 */
export async function createSoul(soul: SoulInsert) {
  const { data, error } = await supabase
    .from('souls')
    .insert(soul)
    .select()
    .single();

  return { data, error };
}

/**
 * Update soul
 */
export async function updateSoul(soulId: string, updates: {
  name?: string;
  training_type?: TrainingType;
  start_date?: string;
}) {
  const { data, error } = await supabase
    .from('souls')
    .update(updates)
    .eq('id', soulId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete soul (cascades to progress and activity_plans)
 */
export async function deleteSoul(soulId: string) {
  const { error } = await supabase
    .from('souls')
    .delete()
    .eq('id', soulId);

  return { error };
}

// ============================================================================
// PROGRESS
// ============================================================================

/**
 * Get all progress for a soul
 */
export async function getSoulProgress(soulId: string) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('soul_id', soulId)
    .order('week');

  return { data, error };
}

/**
 * Get progress for specific area
 */
export async function getAreaProgress(soulId: string, areaId: string) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('soul_id', soulId)
    .eq('area_id', areaId)
    .order('week');

  return { data, error };
}

/**
 * Get current week progress
 */
export async function getCurrentProgress(soulId: string) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('soul_id', soulId)
    .eq('status', 'current');

  return { data, error };
}

/**
 * Create progress record
 */
export async function createProgress(progress: ProgressInsert) {
  const { data, error } = await supabase
    .from('progress')
    .insert(progress)
    .select()
    .single();

  return { data, error };
}

/**
 * Update progress status
 */
export async function updateProgressStatus(
  progressId: string,
  status: 'completed' | 'current' | 'future',
  completedAt?: string
) {
  const updates: any = { status };
  if (status === 'completed' && completedAt) {
    updates.completed_at = completedAt;
  }

  const { data, error } = await supabase
    .from('progress')
    .update(updates)
    .eq('id', progressId)
    .select()
    .single();

  return { data, error };
}

/**
 * Add memo to progress
 */
export async function addProgressMemo(progressId: string, memo: string) {
  const { data, error } = await supabase
    .from('progress')
    .update({ memo })
    .eq('id', progressId)
    .select()
    .single();

  return { data, error };
}

/**
 * Complete current week and advance to next
 */
export async function completeWeekAndAdvance(
  soulId: string,
  areaId: string,
  currentWeek: number
) {
  // Mark current week as completed
  const { error: completeError } = await supabase
    .from('progress')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString().split('T')[0],
    })
    .eq('soul_id', soulId)
    .eq('area_id', areaId)
    .eq('week', currentWeek);

  if (completeError) return { error: completeError };

  // Mark next week as current
  const { data, error } = await supabase
    .from('progress')
    .update({ status: 'current' })
    .eq('soul_id', soulId)
    .eq('area_id', areaId)
    .eq('week', currentWeek + 1)
    .select()
    .single();

  return { data, error };
}

// ============================================================================
// ACTIVITY PLANS
// ============================================================================

/**
 * Get all activity plans for a soul
 */
export async function getSoulActivityPlans(soulId: string) {
  const { data, error } = await supabase
    .from('activity_plans')
    .select('*')
    .eq('soul_id', soulId)
    .order('week');

  return { data, error };
}

/**
 * Get activity plans for specific week
 */
export async function getWeekActivityPlans(soulId: string, areaId: string, week: number) {
  const { data, error } = await supabase
    .from('activity_plans')
    .select('*')
    .eq('soul_id', soulId)
    .eq('area_id', areaId)
    .eq('week', week);

  return { data, error };
}

/**
 * Get incomplete activity plans
 */
export async function getIncompleteActivities(soulId: string) {
  const { data, error } = await supabase
    .from('activity_plans')
    .select('*')
    .eq('soul_id', soulId)
    .eq('is_completed', false)
    .order('week');

  return { data, error };
}

/**
 * Create activity plan
 */
export async function createActivityPlan(plan: ActivityPlanInsert) {
  const { data, error } = await supabase
    .from('activity_plans')
    .insert(plan)
    .select()
    .single();

  return { data, error };
}

/**
 * Create activity plan from recommendation
 */
export async function createPlanFromRecommendation(
  soulId: string,
  areaId: string,
  week: number,
  recommendation: ActivityRecommendation
) {
  const plan: ActivityPlanInsert = {
    soul_id: soulId,
    area_id: areaId,
    week,
    plan_type: 'recommended',
    title: recommendation.title,
    description: `${recommendation.description}\n\n성경구절: ${recommendation.bible_verse}\n\n팁: ${recommendation.tips}`,
    is_completed: false,
  };

  return createActivityPlan(plan);
}

/**
 * Update activity plan
 */
export async function updateActivityPlan(
  planId: string,
  updates: {
    title?: string;
    description?: string;
    is_completed?: boolean;
  }
) {
  const { data, error } = await supabase
    .from('activity_plans')
    .update(updates)
    .eq('id', planId)
    .select()
    .single();

  return { data, error };
}

/**
 * Toggle activity completion
 */
export async function toggleActivityCompletion(planId: string, isCompleted: boolean) {
  const { data, error } = await supabase
    .from('activity_plans')
    .update({ is_completed: isCompleted })
    .eq('id', planId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete activity plan
 */
export async function deleteActivityPlan(planId: string) {
  const { error } = await supabase
    .from('activity_plans')
    .delete()
    .eq('id', planId);

  return { error };
}

// ============================================================================
// ACTIVITY RECOMMENDATIONS
// ============================================================================

/**
 * Get recommendations for training type and area
 */
export async function getRecommendations(
  trainingType: TrainingType,
  areaId: string
) {
  const { data, error } = await supabase
    .from('activity_recommendations')
    .select('*')
    .eq('training_type', trainingType)
    .eq('area_id', areaId)
    .order('week');

  return { data, error };
}

/**
 * Get recommendation for specific week
 */
export async function getWeekRecommendation(
  trainingType: TrainingType,
  areaId: string,
  week: number
) {
  const { data, error } = await supabase
    .from('activity_recommendations')
    .select('*')
    .eq('training_type', trainingType)
    .eq('area_id', areaId)
    .eq('week', week)
    .single();

  return { data, error };
}

/**
 * Get all recommendations for training type
 */
export async function getAllRecommendationsForType(trainingType: TrainingType) {
  const { data, error } = await supabase
    .from('activity_recommendations')
    .select('*')
    .eq('training_type', trainingType)
    .order('area_id')
    .order('week');

  return { data, error };
}

// ============================================================================
// HELPER FUNCTIONS (Database Functions)
// ============================================================================

/**
 * Get current week for a soul in an area
 */
export async function getCurrentWeek(soulId: string, areaId: string) {
  const { data, error } = await supabase
    .rpc('get_current_week', {
      p_soul_id: soulId,
      p_area_id: areaId,
    });

  return { data, error };
}

/**
 * Get weeks since soul started training
 */
export async function getWeeksSinceStart(soulId: string) {
  const { data, error } = await supabase
    .rpc('get_weeks_since_start', {
      p_soul_id: soulId,
    });

  return { data, error };
}

// ============================================================================
// COMPLEX QUERIES
// ============================================================================

/**
 * Get soul dashboard data (single query)
 */
export async function getSoulDashboard(soulId: string) {
  const { data, error } = await supabase
    .from('souls')
    .select(`
      *,
      progress (
        id,
        area_id,
        week,
        status,
        completed_at
      ),
      activity_plans (
        id,
        area_id,
        week,
        title,
        is_completed
      )
    `)
    .eq('id', soulId)
    .single();

  return { data, error };
}

/**
 * Get user overview with all souls and progress
 */
export async function getUserOverview(userId: string) {
  const { data, error } = await supabase
    .from('souls')
    .select(`
      id,
      name,
      training_type,
      start_date,
      progress (
        status,
        area_id
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get weekly summary for all souls
 */
export async function getWeeklySummary(userId: string) {
  // Get all souls with current week progress and incomplete activities
  const { data, error } = await supabase
    .from('souls')
    .select(`
      id,
      name,
      training_type,
      progress!inner (
        id,
        area_id,
        week,
        status
      ),
      activity_plans!inner (
        id,
        title,
        is_completed
      )
    `)
    .eq('user_id', userId)
    .eq('progress.status', 'current')
    .eq('activity_plans.is_completed', false);

  return { data, error };
}

// Note: Replace 'supabase' with your actual Supabase client instance
declare const supabase: any;
