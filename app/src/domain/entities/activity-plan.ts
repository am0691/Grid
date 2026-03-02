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

/**
 * @deprecated Phase 2: PastoralLog로 이관됨. 새 코드에서는 PastoralLog의 rating/evaluationNotes 사용.
 * @see {@link ../pastoral-log.ts}
 */
export interface ActivityEvaluation {
  rating: 1 | 2 | 3 | 4 | 5;      // 1-5점 평가
  evaluationNotes?: string;       // 평가 코멘트
  actualOutcome?: string;         // 실제 결과/성과
  challengesFaced?: string;       // 어려웠던 점
  nextSteps?: string;             // 다음 단계 계획
  evaluatedAt: string;            // 평가 일시 (ISO string)
}

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
  /** @deprecated Phase 2: PastoralLog로 이관됨 */
  evaluation?: ActivityEvaluation;  // 활동 완료 후 평가
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
  evaluation?: ActivityEvaluation;
}

export interface ActivityPlanFilter {
  soulId?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  dateFrom?: string;
  dateTo?: string;
  areaId?: Area;
}
