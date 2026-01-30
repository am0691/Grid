/**
 * Activity Recommendation Entity
 * 활동 추천 엔티티
 */

import type { Area } from '../value-objects/area';
import type { TrainingType } from '../value-objects/training-type';

export interface ActivityRecommendation {
  id: string;
  trainingType: TrainingType;
  areaId: Area;
  week: number;
  title: string;
  description: string;
  bibleVerse?: {
    reference: string;  // 예: "요한복음 1:12"
    text: string;       // 성경 구절 본문
  };
  activities: string[];  // 구체적인 활동 목록
  tips?: string[];       // 양육자를 위한 팁
  goals?: string[];      // 이 주차의 목표
}

export interface WeeklyRecommendation {
  week: number;
  areas: {
    areaId: Area;
    recommendations: ActivityRecommendation[];
  }[];
}
