/**
 * Soul Entity
 * 영혼(양육 받는 사람) 엔티티
 */

import type { TrainingType } from '../value-objects/training-type';

export interface SoulProfile {
  // Basic background
  ageGroup?: 'teens' | '20s' | '30s' | '40s' | '50s' | '60s+';
  gender?: 'male' | 'female';
  occupation?: string;
  mbti?: string;

  // Faith background
  faithBackground?: 'new' | 'returned' | 'transferred' | 'seeker';
  previousChurchExperience?: string;
  hasSalvationAssurance?: boolean;
  salvationDate?: string;

  // Personality & learning
  personalityType?: 'analytical' | 'relational' | 'experiential' | 'practical';
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  preferredMeetingType?: 'in-person' | 'online' | 'both';

  // Interests & gifts
  interests?: string[];
  perceivedGifts?: string[];
  servingAreas?: string[];

  // Pastoral notes
  spiritualGoals?: string;
  challenges?: string;
  specialNeeds?: string;
}

export interface Soul {
  id: string;
  name: string;
  trainingType: TrainingType;
  startDate: string;    // 시작일 (ISO string)
  createdAt: string;
  updatedAt: string;
  trainerId?: string;   // 양육자 ID
  isActive: boolean;    // 활성 상태
  // from SoulDetails
  phoneNumber?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  notes?: string;
  // SoulProfile as JSONB
  profile?: SoulProfile;
}

/** @deprecated Use Soul directly. SoulDetails is now an alias for Soul. */
export type SoulDetails = Soul;

export interface CreateSoulDto {
  name: string;
  trainingType: TrainingType;
  startDate: string;
  trainerId?: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
  profile?: SoulProfile;
}

export interface UpdateSoulDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  notes?: string;
  isActive?: boolean;
  profile?: SoulProfile;
}
