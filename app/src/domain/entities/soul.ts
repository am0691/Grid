/**
 * Soul Entity
 * 영혼(양육 받는 사람) 엔티티
 */

import type { TrainingType } from '../value-objects/training-type';

export interface Soul {
  id: string;
  name: string;
  trainingType: TrainingType;
  startDate: string;    // 시작일 (ISO string)
  createdAt: string;
  updatedAt: string;
  trainerId?: string;   // 양육자 ID
  isActive: boolean;    // 활성 상태
}

export interface SoulDetails extends Soul {
  phoneNumber?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  notes?: string;
}

export interface CreateSoulDto {
  name: string;
  trainingType: TrainingType;
  startDate: string;
  trainerId?: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
}

export interface UpdateSoulDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  notes?: string;
  isActive?: boolean;
}
