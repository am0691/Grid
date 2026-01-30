/**
 * Activity Plan Entity
 * 활동 계획 엔티티
 */

import type { Area } from '../value-objects/area';

export type ActivityType =
  | 'meeting'        // 만남/양육
  | 'call'           // 전화
  | 'study'          // 공부
  | 'event'          // 행사
  | 'prayer'         // 기도
  | 'other';         // 기타

export type ActivityStatus =
  | 'planned'        // 계획됨
  | 'in-progress'    // 진행중
  | 'completed'      // 완료
  | 'cancelled';     // 취소

export interface ActivityPlan {
  id: string;
  soulId: string;
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  scheduledAt: string;   // 예정 일시 (ISO string)
  completedAt?: string;  // 완료 일시 (ISO string)
  areaId?: Area;         // 연관된 영역
  week?: number;         // 연관된 주차/월차
  location?: string;     // 장소
  description?: string;  // 설명
  notes?: string;        // 메모
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityPlanDto {
  soulId: string;
  title: string;
  type: ActivityType;
  scheduledAt: string;
  areaId?: Area;
  week?: number;
  location?: string;
  description?: string;
}

export interface UpdateActivityPlanDto {
  title?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  scheduledAt?: string;
  completedAt?: string;
  areaId?: Area;
  week?: number;
  location?: string;
  description?: string;
  notes?: string;
}

export interface ActivityPlanFilter {
  soulId?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  dateFrom?: string;
  dateTo?: string;
  areaId?: Area;
}
