/**
 * LocalStorage to Supabase Migration Utility
 * 기존 localStorage 데이터를 Supabase로 마이그레이션
 */

import { supabase } from '@/infrastructure/services/supabase/client';
import type { Soul, AreaProgress } from '@/types';
import { createSoul } from '@/infrastructure/repositories/supabase/soul-repository';
import { upsertProgress } from '@/infrastructure/repositories/supabase/progress-repository';

interface LocalStorageData {
  souls: Soul[];
  progress: Record<string, AreaProgress[]>;
}

/**
 * localStorage에서 GRID 데이터 읽기
 */
const getLocalStorageData = (): LocalStorageData | null => {
  try {
    const data = localStorage.getItem('grid-storage');
    if (!data) return null;

    const parsed = JSON.parse(data);
    return parsed.state || null;
  } catch (error) {
    console.error('Failed to read localStorage data:', error);
    return null;
  }
};

/**
 * Soul 마이그레이션
 */
const migrateSouls = async (souls: Soul[]): Promise<Map<string, string>> => {
  const idMapping = new Map<string, string>(); // oldId -> newId

  for (const soul of souls) {
    try {
      const newSoul = await createSoul({
        name: soul.name,
        trainingType: soul.trainingType,
        startDate: soul.startDate,
      });

      idMapping.set(soul.id, newSoul.id);
      console.log(`✓ Migrated soul: ${soul.name}`);
    } catch (error) {
      console.error(`✗ Failed to migrate soul: ${soul.name}`, error);
    }
  }

  return idMapping;
};

/**
 * Progress 마이그레이션
 */
const migrateProgress = async (
  progress: Record<string, AreaProgress[]>,
  idMapping: Map<string, string>
): Promise<void> => {
  for (const [oldSoulId, areaProgresses] of Object.entries(progress)) {
    const newSoulId = idMapping.get(oldSoulId);

    if (!newSoulId) {
      console.warn(`⚠ Skipping progress for unknown soul: ${oldSoulId}`);
      continue;
    }

    for (const areaProgress of areaProgresses) {
      for (const item of areaProgress.items) {
        try {
          await upsertProgress(newSoulId, areaProgress.areaId, item.week, {
            status: item.status,
            completedAt: item.completedAt,
            memo: item.memo,
          });
        } catch (error) {
          console.error(
            `✗ Failed to migrate progress: soul=${newSoulId}, area=${areaProgress.areaId}, week=${item.week}`,
            error
          );
        }
      }

      console.log(
        `✓ Migrated progress for area: ${areaProgress.areaId} (${areaProgress.items.length} items)`
      );
    }
  }
};

/**
 * 메인 마이그레이션 함수
 */
export const migrateLocalStorageToSupabase = async (): Promise<{
  success: boolean;
  message: string;
  details?: {
    soulsCount: number;
    progressCount: number;
  };
}> => {
  try {
    // 1. 사용자 인증 확인
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: 'User not authenticated. Please log in first.',
      };
    }

    // 2. localStorage 데이터 읽기
    const localData = getLocalStorageData();

    if (!localData || !localData.souls || localData.souls.length === 0) {
      return {
        success: false,
        message: 'No data found in localStorage to migrate.',
      };
    }

    console.log(`📦 Found ${localData.souls.length} souls to migrate`);

    // 3. Souls 마이그레이션
    console.log('🔄 Migrating souls...');
    const idMapping = await migrateSouls(localData.souls);

    if (idMapping.size === 0) {
      return {
        success: false,
        message: 'Failed to migrate any souls.',
      };
    }

    // 4. Progress 마이그레이션
    console.log('🔄 Migrating progress...');
    await migrateProgress(localData.progress, idMapping);

    // 5. 마이그레이션 완료 표시 (localStorage에 플래그 저장)
    localStorage.setItem('grid-migration-completed', new Date().toISOString());

    return {
      success: true,
      message: 'Migration completed successfully!',
      details: {
        soulsCount: idMapping.size,
        progressCount: Object.keys(localData.progress).length,
      },
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * 마이그레이션 필요 여부 확인
 */
export const isMigrationNeeded = (): boolean => {
  // 이미 마이그레이션 완료된 경우
  const migrationCompleted = localStorage.getItem('grid-migration-completed');
  if (migrationCompleted) return false;

  // localStorage에 데이터가 있는지 확인
  const localData = getLocalStorageData();
  return localData !== null && localData.souls.length > 0;
};

/**
 * localStorage 백업
 */
export const backupLocalStorage = (): string | null => {
  try {
    const data = localStorage.getItem('grid-storage');
    if (!data) return null;

    // 백업 파일 다운로드
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grid-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return data;
  } catch (error) {
    console.error('Failed to backup localStorage:', error);
    return null;
  }
};

/**
 * localStorage 초기화 (마이그레이션 후)
 */
export const clearLocalStorageData = (): void => {
  const confirmed = window.confirm(
    'Are you sure you want to clear localStorage data? Make sure you have backed up your data first.'
  );

  if (confirmed) {
    localStorage.removeItem('grid-storage');
    console.log('✓ localStorage cleared');
  }
};
