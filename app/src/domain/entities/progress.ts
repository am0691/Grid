/**
 * Progress Entity
 * 진도 엔티티
 */

import type { Area } from '../value-objects/area';

export type ProgressStatus = 'completed' | 'current' | 'future';

export interface ProgressItem {
  week: number;        // 주차 (Convert) 또는 월차 (Disciple)
  status: ProgressStatus;
  completedAt?: string; // 완료 날짜 (ISO string)
  memo?: string;       // 메모
}

export interface AreaProgress {
  areaId: Area;
  currentWeek: number;  // 현재 진행 중인 주차/월차
  items: ProgressItem[];
}

export interface SoulProgress {
  soulId: string;
  areaProgress: AreaProgress[];
  overallProgress: number;  // 전체 진도율 (0-100)
  lastUpdatedAt: string;
}

export interface UpdateProgressDto {
  soulId: string;
  areaId: Area;
  week: number;
  status: ProgressStatus;
  completedAt?: string;
  memo?: string;
}

export interface MemoHistoryItem {
  id: string;
  soulId: string;
  areaId: Area;
  week: number;
  memo: string;
  createdAt: string;
}
