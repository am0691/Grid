/**
 * Supabase Progress Repository Implementation
 * Supabase progress 테이블과 연동하는 진도 관리 구현체
 * Demo Mode에서는 localStorage 사용
 */

import { supabase } from '../../services/supabase/client';
import type { AreaProgress, ProgressItem } from '../../../domain/entities';
import type { Progress, ProgressInsert } from '../../database/schema';
import type { Area } from '../../../types';

// Demo Mode 체크
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
const DEMO_PROGRESS_KEY = 'grid_demo_progress';

// Demo Mode용 localStorage 헬퍼
interface DemoProgressStore {
  [soulId: string]: AreaProgress[];
}

const getDemoProgress = (): DemoProgressStore => {
  try {
    const stored = localStorage.getItem(DEMO_PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveDemoProgress = (progress: DemoProgressStore): void => {
  localStorage.setItem(DEMO_PROGRESS_KEY, JSON.stringify(progress));
};

/**
 * DB Progress를 Domain ProgressItem으로 변환
 */
const mapDbToProgressItem = (dbProgress: Progress): ProgressItem => {
  return {
    week: dbProgress.week,
    status: dbProgress.status,
    completedAt: dbProgress.completed_at || undefined,
    memo: dbProgress.memo || undefined,
  };
};

/**
 * Soul의 모든 진도 조회 (영역별로 그룹화)
 */
export const getProgressBySoulId = async (soulId: string): Promise<AreaProgress[]> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoProgress = getDemoProgress();
    return demoProgress[soulId] || [];
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Soul이 현재 사용자 소유인지 확인
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
    .from('progress')
    .select('*')
    .eq('soul_id', soulId)
    .order('area_id', { ascending: true })
    .order('week', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch progress: ${error.message}`);
  }

  // 영역별로 그룹화
  const progressByArea = new Map<string, ProgressItem[]>();

  (data || []).forEach((item) => {
    if (!progressByArea.has(item.area_id)) {
      progressByArea.set(item.area_id, []);
    }
    progressByArea.get(item.area_id)!.push(mapDbToProgressItem(item));
  });

  // AreaProgress 배열로 변환
  const areaProgress: AreaProgress[] = [];
  progressByArea.forEach((items, areaId) => {
    const currentWeek = items.find(item => item.status === 'current')?.week || 1;
    areaProgress.push({
      areaId: areaId as Area,
      currentWeek,
      items,
    });
  });

  return areaProgress;
};

/**
 * 특정 진도 항목 조회
 */
export const getProgressItem = async (
  soulId: string,
  areaId: Area,
  week: number
): Promise<ProgressItem | null> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoProgress = getDemoProgress();
    const soulProgress = demoProgress[soulId] || [];
    const areaProgress = soulProgress.find(p => p.areaId === areaId);
    if (!areaProgress) return null;
    return areaProgress.items.find(i => i.week === week) || null;
  }

  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('soul_id', soulId)
    .eq('area_id', areaId)
    .eq('week', week)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch progress item: ${error.message}`);
  }

  return data ? mapDbToProgressItem(data) : null;
};

/**
 * 진도 항목 생성 또는 업데이트 (Upsert)
 */
export const upsertProgress = async (
  soulId: string,
  areaId: Area,
  week: number,
  updates: Partial<ProgressItem>
): Promise<ProgressItem> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoProgress = getDemoProgress();
    const soulProgress = demoProgress[soulId] || [];

    let areaProgress = soulProgress.find(p => p.areaId === areaId);
    if (!areaProgress) {
      areaProgress = { areaId, currentWeek: 1, items: [] };
      soulProgress.push(areaProgress);
    }

    let item = areaProgress.items.find(i => i.week === week);
    if (item) {
      Object.assign(item, updates);
    } else {
      item = { week, status: updates.status || 'future', ...updates };
      areaProgress.items.push(item);
      areaProgress.items.sort((a, b) => a.week - b.week);
    }

    // Update currentWeek if needed
    const currentItem = areaProgress.items.find(i => i.status === 'current');
    if (currentItem) {
      areaProgress.currentWeek = currentItem.week;
    }

    demoProgress[soulId] = soulProgress;
    saveDemoProgress(demoProgress);
    return item;
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

  const upsertData: ProgressInsert = {
    soul_id: soulId,
    area_id: areaId,
    week,
    status: updates.status || 'future',
    completed_at: updates.completedAt || null,
    memo: updates.memo || null,
  };

  const { data, error } = await supabase
    .from('progress')
    .upsert(upsertData, {
      onConflict: 'soul_id,area_id,week',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert progress: ${error.message}`);
  }

  return mapDbToProgressItem(data);
};

/**
 * 진도 완료 토글
 */
export const toggleProgressComplete = async (
  soulId: string,
  areaId: Area,
  week: number
): Promise<ProgressItem> => {
  const currentItem = await getProgressItem(soulId, areaId, week);

  const isCompleting = currentItem?.status !== 'completed';
  const newStatus = isCompleting ? 'completed' : 'current';
  const completedAt = isCompleting ? new Date().toISOString().split('T')[0] : null;

  return upsertProgress(soulId, areaId, week, {
    status: newStatus,
    completedAt: completedAt || undefined,
  });
};

/**
 * 메모 저장
 */
export const saveProgressMemo = async (
  soulId: string,
  areaId: Area,
  week: number,
  memo: string
): Promise<ProgressItem> => {
  return upsertProgress(soulId, areaId, week, { memo });
};

/**
 * 특정 영역의 모든 진도 항목 일괄 생성
 */
export const initializeAreaProgress = async (
  soulId: string,
  areaId: Area,
  maxWeeks: number
): Promise<void> => {
  // Demo Mode: localStorage 사용
  if (isDemoMode) {
    const demoProgress = getDemoProgress();
    const soulProgress = demoProgress[soulId] || [];

    // 이미 존재하면 스킵
    if (soulProgress.some(p => p.areaId === areaId)) {
      return;
    }

    const items: ProgressItem[] = Array.from({ length: maxWeeks }, (_, i) => ({
      week: i + 1,
      status: i === 0 ? 'current' : 'future',
    }));

    soulProgress.push({
      areaId,
      currentWeek: 1,
      items,
    });

    demoProgress[soulId] = soulProgress;
    saveDemoProgress(demoProgress);
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const progressItems: ProgressInsert[] = Array.from({ length: maxWeeks }, (_, i) => ({
    soul_id: soulId,
    area_id: areaId,
    week: i + 1,
    status: i === 0 ? 'current' : 'future',
    memo: null,
    completed_at: null,
  }));

  const { error } = await supabase
    .from('progress')
    .upsert(progressItems, {
      onConflict: 'soul_id,area_id,week',
      ignoreDuplicates: false,
    });

  if (error) {
    throw new Error(`Failed to initialize progress: ${error.message}`);
  }
};

/**
 * Soul의 모든 진도 초기화
 */
export const initializeAllProgress = async (
  soulId: string,
  trainingType: 'convert' | 'disciple'
): Promise<void> => {
  const { CONVERT_AREAS, DISCIPLE_AREAS } = await import('../../../types');
  const areas = trainingType === 'convert' ? CONVERT_AREAS : DISCIPLE_AREAS;
  const maxWeeks = trainingType === 'convert' ? 13 : 12;

  for (const area of areas) {
    await initializeAreaProgress(soulId, area.id as Area, maxWeeks);
  }
};
