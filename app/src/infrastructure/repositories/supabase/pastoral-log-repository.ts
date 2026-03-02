/**
 * Supabase Pastoral Log Repository Implementation
 * Supabase pastoral_logs 테이블과 연동하는 목양 일지 구현체
 * Demo Mode에서는 localStorage 사용
 */

import { supabase } from '../../services/supabase/client';
import type { PastoralLog as DbPastoralLog, PastoralLogInsert, PastoralLogUpdate } from '../../database/schema';
import type { PastoralLog, CreatePastoralLogDto, UpdatePastoralLogDto, PastoralLogFilter } from '../../../domain/entities/pastoral-log';

// Demo Mode 체크
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
const DEMO_LOGS_KEY = 'grid_demo_pastoral_logs';

// Demo Mode용 localStorage 헬퍼
interface DemoLogsStore {
  [soulId: string]: PastoralLog[];
}

const getDemoLogs = (): DemoLogsStore => {
  try {
    const stored = localStorage.getItem(DEMO_LOGS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveDemoLogs = (logs: DemoLogsStore): void => {
  localStorage.setItem(DEMO_LOGS_KEY, JSON.stringify(logs));
};

/**
 * DB PastoralLog을 Domain PastoralLog으로 변환
 */
const mapDbToDomain = (db: DbPastoralLog): PastoralLog => {
  return {
    id: db.id,
    soulId: db.soul_id,
    activityPlanId: db.activity_plan_id ?? undefined,
    rating: db.rating as PastoralLog['rating'] ?? undefined,
    evaluationNotes: db.evaluation_notes ?? undefined,
    mood: db.mood,
    hungerLevel: db.hunger_level as PastoralLog['hungerLevel'],
    closenessLevel: db.closeness_level as PastoralLog['closenessLevel'],
    observations: db.observations ?? undefined,
    concerns: db.concerns ?? undefined,
    praises: db.praises ?? undefined,
    prayerNeeds: db.prayer_needs ?? undefined,
    hasBreakthrough: db.has_breakthrough,
    breakthroughCategory: db.breakthrough_category as PastoralLog['breakthroughCategory'],
    breakthroughTitle: db.breakthrough_title ?? undefined,
    breakthroughDescription: db.breakthrough_description ?? undefined,
    bibleReferences: db.bible_references
      ? (db.bible_references as unknown as PastoralLog['bibleReferences'])
      : undefined,
    nextSteps: db.next_steps ?? undefined,
    followUpActions: db.follow_up_actions
      ? (db.follow_up_actions as unknown as string[])
      : undefined,
    recordedAt: db.recorded_at,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
};

/**
 * Domain CreatePastoralLogDto를 DB Insert 형식으로 변환
 */
const mapDomainToDbInsert = (
  input: CreatePastoralLogDto,
  userId: string,
): PastoralLogInsert => {
  return {
    soul_id: input.soulId,
    user_id: userId,
    activity_plan_id: input.activityPlanId ?? null,
    rating: input.rating ?? null,
    evaluation_notes: input.evaluationNotes ?? null,
    mood: input.mood,
    hunger_level: input.hungerLevel,
    closeness_level: input.closenessLevel,
    observations: input.observations ?? null,
    concerns: input.concerns ?? null,
    praises: input.praises ?? null,
    prayer_needs: input.prayerNeeds ?? null,
    has_breakthrough: input.hasBreakthrough ?? false,
    breakthrough_category: input.breakthroughCategory ?? null,
    breakthrough_title: input.breakthroughTitle ?? null,
    breakthrough_description: input.breakthroughDescription ?? null,
    bible_references: input.bibleReferences
      ? (input.bibleReferences as unknown as DbPastoralLog['bible_references'])
      : null,
    next_steps: input.nextSteps ?? null,
    follow_up_actions: input.followUpActions ?? null,
    recorded_at: input.recordedAt ?? new Date().toISOString(),
  };
};

/**
 * Domain UpdatePastoralLogDto를 DB Update 형식으로 변환
 */
const mapDomainToDbUpdate = (updates: UpdatePastoralLogDto): PastoralLogUpdate => {
  const dbUpdate: PastoralLogUpdate = {};

  if (updates.activityPlanId !== undefined) dbUpdate.activity_plan_id = updates.activityPlanId ?? null;
  if (updates.rating !== undefined) dbUpdate.rating = updates.rating ?? null;
  if (updates.evaluationNotes !== undefined) dbUpdate.evaluation_notes = updates.evaluationNotes ?? null;
  if (updates.mood !== undefined) dbUpdate.mood = updates.mood;
  if (updates.hungerLevel !== undefined) dbUpdate.hunger_level = updates.hungerLevel;
  if (updates.closenessLevel !== undefined) dbUpdate.closeness_level = updates.closenessLevel;
  if (updates.observations !== undefined) dbUpdate.observations = updates.observations ?? null;
  if (updates.concerns !== undefined) dbUpdate.concerns = updates.concerns ?? null;
  if (updates.praises !== undefined) dbUpdate.praises = updates.praises ?? null;
  if (updates.prayerNeeds !== undefined) dbUpdate.prayer_needs = updates.prayerNeeds ?? null;
  if (updates.hasBreakthrough !== undefined) dbUpdate.has_breakthrough = updates.hasBreakthrough;
  if (updates.breakthroughCategory !== undefined) dbUpdate.breakthrough_category = updates.breakthroughCategory ?? null;
  if (updates.breakthroughTitle !== undefined) dbUpdate.breakthrough_title = updates.breakthroughTitle ?? null;
  if (updates.breakthroughDescription !== undefined) dbUpdate.breakthrough_description = updates.breakthroughDescription ?? null;
  if (updates.bibleReferences !== undefined) {
    dbUpdate.bible_references = updates.bibleReferences
      ? (updates.bibleReferences as unknown as DbPastoralLog['bible_references'])
      : null;
  }
  if (updates.nextSteps !== undefined) dbUpdate.next_steps = updates.nextSteps ?? null;
  if (updates.followUpActions !== undefined) dbUpdate.follow_up_actions = updates.followUpActions ?? null;
  if (updates.recordedAt !== undefined) dbUpdate.recorded_at = updates.recordedAt;

  return dbUpdate;
};

/**
 * Soul의 모든 목양 일지 조회 (최신순)
 */
export const getPastoralLogsBySoul = async (soulId: string): Promise<PastoralLog[]> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoLogs = getDemoLogs();
    return demoLogs[soulId] || [];
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
    .from('pastoral_logs')
    .select('*')
    .eq('soul_id', soulId)
    .order('recorded_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch pastoral logs: ${error.message}`);
  }

  return (data || []).map(mapDbToDomain);
};

/**
 * 특정 목양 일지 조회
 */
export const getPastoralLogById = async (id: string): Promise<PastoralLog | null> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoLogs = getDemoLogs();
    for (const soulLogs of Object.values(demoLogs)) {
      const log = soulLogs.find(l => l.id === id);
      if (log) return log;
    }
    return null;
  }

  const { data, error } = await supabase
    .from('pastoral_logs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch pastoral log: ${error.message}`);
  }

  return data ? mapDbToDomain(data) : null;
};

/**
 * 목양 일지 생성
 */
export const createPastoralLog = async (input: CreatePastoralLogDto): Promise<PastoralLog> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoLogs = getDemoLogs();
    const soulLogs = demoLogs[input.soulId] || [];
    const now = new Date().toISOString();

    const newLog: PastoralLog = {
      id: `demo-log-${Date.now()}`,
      soulId: input.soulId,
      activityPlanId: input.activityPlanId,
      rating: input.rating,
      evaluationNotes: input.evaluationNotes,
      mood: input.mood,
      hungerLevel: input.hungerLevel,
      closenessLevel: input.closenessLevel,
      observations: input.observations,
      concerns: input.concerns,
      praises: input.praises,
      prayerNeeds: input.prayerNeeds,
      hasBreakthrough: input.hasBreakthrough ?? false,
      breakthroughCategory: input.breakthroughCategory,
      breakthroughTitle: input.breakthroughTitle,
      breakthroughDescription: input.breakthroughDescription,
      bibleReferences: input.bibleReferences,
      nextSteps: input.nextSteps,
      followUpActions: input.followUpActions,
      recordedAt: input.recordedAt ?? now,
      createdAt: now,
      updatedAt: now,
    };

    soulLogs.unshift(newLog);
    demoLogs[input.soulId] = soulLogs;
    saveDemoLogs(demoLogs);
    return newLog;
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

  const insertData = mapDomainToDbInsert(input, user.id);

  const { data, error } = await supabase
    .from('pastoral_logs')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create pastoral log: ${error.message}`);
  }

  return mapDbToDomain(data);
};

/**
 * 목양 일지 업데이트
 */
export const updatePastoralLog = async (id: string, updates: UpdatePastoralLogDto): Promise<PastoralLog> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoLogs = getDemoLogs();
    for (const [soulId, soulLogs] of Object.entries(demoLogs)) {
      const logIndex = soulLogs.findIndex(l => l.id === id);
      if (logIndex !== -1) {
        const log = soulLogs[logIndex];
        const updatedLog: PastoralLog = {
          ...log,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        soulLogs[logIndex] = updatedLog;
        demoLogs[soulId] = soulLogs;
        saveDemoLogs(demoLogs);
        return updatedLog;
      }
    }
    throw new Error('Pastoral log not found');
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const updateData = mapDomainToDbUpdate(updates);

  const { data, error } = await supabase
    .from('pastoral_logs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update pastoral log: ${error.message}`);
  }

  return mapDbToDomain(data);
};

/**
 * 목양 일지 삭제
 */
export const deletePastoralLog = async (id: string): Promise<void> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoLogs = getDemoLogs();
    for (const [soulId, soulLogs] of Object.entries(demoLogs)) {
      const logIndex = soulLogs.findIndex(l => l.id === id);
      if (logIndex !== -1) {
        soulLogs.splice(logIndex, 1);
        demoLogs[soulId] = soulLogs;
        saveDemoLogs(demoLogs);
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
    .from('pastoral_logs')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete pastoral log: ${error.message}`);
  }
};

/**
 * 필터 조건으로 목양 일지 조회
 */
export const getPastoralLogsFiltered = async (filter: PastoralLogFilter): Promise<PastoralLog[]> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoLogs = getDemoLogs();
    let allLogs: PastoralLog[] = [];

    if (filter.soulId) {
      allLogs = demoLogs[filter.soulId] || [];
    } else {
      allLogs = Object.values(demoLogs).flat();
    }

    return allLogs.filter(log => {
      if (filter.mood && log.mood !== filter.mood) return false;
      if (filter.hasBreakthrough !== undefined && log.hasBreakthrough !== filter.hasBreakthrough) return false;
      if (filter.dateFrom && log.recordedAt < filter.dateFrom) return false;
      if (filter.dateTo && log.recordedAt > filter.dateTo) return false;
      if (filter.activityPlanId && log.activityPlanId !== filter.activityPlanId) return false;
      return true;
    });
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('pastoral_logs')
    .select('*')
    .eq('user_id', user.id);

  if (filter.soulId) {
    query = query.eq('soul_id', filter.soulId);
  }
  if (filter.mood) {
    query = query.eq('mood', filter.mood);
  }
  if (filter.hasBreakthrough !== undefined) {
    query = query.eq('has_breakthrough', filter.hasBreakthrough);
  }
  if (filter.dateFrom) {
    query = query.gte('recorded_at', filter.dateFrom);
  }
  if (filter.dateTo) {
    query = query.lte('recorded_at', filter.dateTo);
  }
  if (filter.activityPlanId) {
    query = query.eq('activity_plan_id', filter.activityPlanId);
  }

  query = query.order('recorded_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch filtered pastoral logs: ${error.message}`);
  }

  return (data || []).map(mapDbToDomain);
};
