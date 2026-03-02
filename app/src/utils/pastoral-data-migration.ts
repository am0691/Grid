/**
 * Pastoral Data Migration Utility
 *
 * localStorage에 저장된 pastoral care 데이터를 PastoralLog 형식으로 변환합니다.
 * 순수 유틸리티 - UI 컴포넌트나 스토어 의존성 없음.
 */

import type { CreatePastoralLogDto } from '@/domain/entities/pastoral-log';

// ─── 타입 정의 ─────────────────────────────────────────────

export interface MigrationResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  errors: Array<{ source: string; id: string; error: string }>;
  backedUpKeys: string[];
  migratedLogs: CreatePastoralLogDto[];
}

export interface MigrationOptions {
  dryRun?: boolean;       // true면 변환만 하고 실제 저장/삭제 안 함
  backupPrefix?: string;  // 기본값: 'grid_backup_'
}

// ─── Helper ────────────────────────────────────────────────

function loadJson<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// ─── 변환 함수 ─────────────────────────────────────────────

function transformSpiritualState(soulId: string, state: any): CreatePastoralLogDto {
  return {
    soulId,
    mood: state.mood || 'stable',
    hungerLevel: state.hungerLevel || 3,
    closenessLevel: state.closenessLevel || 3,
    observations: state.observations,
    concerns: state.concerns,
    praises: state.praises,
    prayerNeeds: state.prayerNeeds,
    hasBreakthrough: false,
    recordedAt: state.recordedAt || state.createdAt,
  };
}

function transformBreakthrough(soulId: string, bt: any): CreatePastoralLogDto {
  return {
    soulId,
    activityPlanId: bt.activityPlanId,
    mood: 'growing',  // 돌파 경험 = 성장
    hungerLevel: 3,
    closenessLevel: 3,
    hasBreakthrough: true,
    breakthroughCategory: bt.category,
    breakthroughTitle: bt.title,
    breakthroughDescription: bt.description,
    bibleReferences: bt.bibleReferences,
    followUpActions: bt.followUpActions,
    recordedAt: bt.occurredAt || bt.createdAt,
  };
}

function transformActivityEvaluation(soulId: string, plan: any): CreatePastoralLogDto | null {
  if (!plan.evaluation) return null;
  const eval_ = plan.evaluation;
  const rating = eval_.rating as number;
  return {
    soulId,
    activityPlanId: plan.id,
    mood: rating >= 4 ? 'growing' : rating >= 3 ? 'stable' : 'struggling',
    hungerLevel: 3,
    closenessLevel: 3,
    rating: eval_.rating,
    evaluationNotes: eval_.evaluationNotes,
    hasBreakthrough: false,
    nextSteps: eval_.nextSteps,
    recordedAt: eval_.evaluatedAt || plan.updatedAt,
  };
}

// ─── 마이그레이션 실행 ─────────────────────────────────────

export async function migratePastoralData(options: MigrationOptions = {}): Promise<MigrationResult> {
  const { dryRun = false, backupPrefix = 'grid_backup_' } = options;

  const result: MigrationResult = {
    success: false,
    totalProcessed: 0,
    successCount: 0,
    failedCount: 0,
    errors: [],
    backedUpKeys: [],
    migratedLogs: [],
  };

  try {
    // 1. localStorage에서 데이터 로드
    const spiritualStates = loadJson<Record<string, any[]>>('grid_spiritual_states', {});
    const breakthroughs = loadJson<Record<string, any[]>>('grid_breakthroughs', {});

    // 2. SpiritualState 변환
    for (const [soulId, states] of Object.entries(spiritualStates)) {
      for (const state of states) {
        result.totalProcessed++;
        try {
          result.migratedLogs.push(transformSpiritualState(soulId, state));
          result.successCount++;
        } catch (e) {
          result.errors.push({ source: 'spiritual_state', id: state.id || 'unknown', error: String(e) });
          result.failedCount++;
        }
      }
    }

    // 3. Breakthrough 변환
    for (const [soulId, bts] of Object.entries(breakthroughs)) {
      for (const bt of bts) {
        result.totalProcessed++;
        try {
          result.migratedLogs.push(transformBreakthrough(soulId, bt));
          result.successCount++;
        } catch (e) {
          result.errors.push({ source: 'breakthrough', id: bt.id || 'unknown', error: String(e) });
          result.failedCount++;
        }
      }
    }

    // 4. 백업 및 정리 (dryRun이 아니고 마이그레이션된 데이터가 있을 때만)
    if (!dryRun && result.migratedLogs.length > 0) {
      const keysToBackup = ['grid_spiritual_states', 'grid_breakthroughs'];
      for (const key of keysToBackup) {
        const data = localStorage.getItem(key);
        if (data) {
          localStorage.setItem(`${backupPrefix}${key}`, data);
          localStorage.removeItem(key);
          result.backedUpKeys.push(key);
        }
      }
    }

    result.success = result.failedCount === 0;
  } catch (e) {
    result.errors.push({ source: 'migration', id: 'global', error: String(e) });
  }

  return result;
}

/**
 * ActivityPlan 배열에서 evaluation 필드를 추출해 PastoralLog DTO로 변환합니다.
 * ActivityPlan은 이미 Supabase에 저장되어 있으므로 evaluation만 추출합니다.
 */
export function migrateActivityEvaluations(
  plans: any[],
  soulId: string
): { logs: CreatePastoralLogDto[]; errors: Array<{ id: string; error: string }> } {
  const logs: CreatePastoralLogDto[] = [];
  const errors: Array<{ id: string; error: string }> = [];

  for (const plan of plans) {
    try {
      const log = transformActivityEvaluation(soulId, plan);
      if (log) logs.push(log);
    } catch (e) {
      errors.push({ id: plan.id || 'unknown', error: String(e) });
    }
  }

  return { logs, errors };
}

// ─── 정리 함수 ─────────────────────────────────────────────

/**
 * 마이그레이션 완료 후 더 이상 필요 없는 localStorage 키를 삭제합니다.
 */
export function cleanupMigratedData(): void {
  const keysToRemove = [
    'grid_spiritual_states',
    'grid_breakthroughs',
    'grid_milestones',  // ActivityTimeline으로 대체됨
  ];
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}

/**
 * 마이그레이션 대기 중인 데이터가 있는지 확인합니다.
 */
export function getMigrationStatus(): { hasPendingData: boolean; dataKeys: string[] } {
  const keys = ['grid_spiritual_states', 'grid_breakthroughs'];
  const dataKeys = keys.filter((k) => localStorage.getItem(k) !== null);
  return { hasPendingData: dataKeys.length > 0, dataKeys };
}
