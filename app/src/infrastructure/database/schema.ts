/**
 * GRID Database Schema TypeScript Definitions
 *
 * This file contains TypeScript types that match the Supabase database schema.
 * Generated from: /Users/seo/dev/Grid/supabase/migrations/001_initial_schema.sql
 */

// ============================================================================
// Enums
// ============================================================================

export type TrainingType = 'convert' | 'disciple';
export type ProgressStatus = 'completed' | 'current' | 'future';
export type SpiritualMood = 'growing' | 'stable' | 'struggling';
export type ActivityType = 'meeting' | 'call' | 'study' | 'event' | 'prayer' | 'other';
export type ActivityStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';

// ============================================================================
// Database Table Types
// ============================================================================

/**
 * User profile information linked to Supabase Auth
 */
export interface Profile {
  id: string; // UUID
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Individuals being trained (disciples or converts)
 */
export interface Soul {
  id: string; // UUID
  user_id: string; // UUID - references profiles.id
  name: string;
  training_type: TrainingType;
  start_date: string; // ISO 8601 date (YYYY-MM-DD)
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  // Phase 1 추가 필드
  phone_number: string | null;
  email: string | null;
  address: string | null;
  birth_date: string | null;
  notes: string | null;
  is_active: boolean;
  profile: Record<string, unknown> | null; // JSONB
}

/**
 * Progress tracking for each training area and week
 */
export interface Progress {
  id: string; // UUID
  soul_id: string; // UUID - references souls.id
  area_id: string;
  week: number;
  status: ProgressStatus;
  completed_at: string | null; // ISO 8601 date (YYYY-MM-DD)
  memo: string | null;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Planned activities for souls
 */
export interface ActivityPlan {
  id: string; // UUID
  soul_id: string; // UUID - references souls.id
  title: string;
  type: ActivityType; // 'meeting' | 'call' | ...
  status: ActivityStatus; // 'planned' | 'in-progress' | ...
  scheduled_at: string; // ISO 8601 timestamp
  completed_at: string | null; // ISO 8601 timestamp
  area_id: string;
  week: number;
  location: string | null;
  description: string | null;
  notes: string | null;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Template recommendations for activities
 */
export interface ActivityRecommendation {
  id: string; // UUID
  training_type: TrainingType;
  area_id: string;
  week: number;
  title: string;
  description: string;
  bible_verse: string | null;
  tips: string | null;
}

/**
 * Pastoral log entries (통합 목양 일지)
 */
export interface PastoralLog {
  id: string; // UUID
  soul_id: string; // UUID - references souls.id
  activity_plan_id: string | null; // UUID - references activity_plans.id
  user_id: string; // UUID - references auth.users(id)

  // Activity evaluation
  rating: number | null; // 1-5
  evaluation_notes: string | null;

  // Spiritual state (required)
  mood: SpiritualMood;
  hunger_level: number; // 1-5
  closeness_level: number; // 1-5
  observations: string | null;
  concerns: string | null;
  praises: string | null;
  prayer_needs: string | null;

  // Breakthrough
  has_breakthrough: boolean;
  breakthrough_category: string | null;
  breakthrough_title: string | null;
  breakthrough_description: string | null;
  bible_references: Record<string, unknown>[] | null; // JSONB

  // Next steps
  next_steps: string | null;
  follow_up_actions: string[] | null; // JSONB

  // Timestamps
  recorded_at: string; // ISO 8601 timestamp
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

// ============================================================================
// Insert Types (for creating new records)
// ============================================================================

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type SoulInsert = Omit<Soul, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProgressInsert = Omit<Progress, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  status?: ProgressStatus;
  created_at?: string;
  updated_at?: string;
};

export type ActivityPlanInsert = Omit<ActivityPlan, 'id' | 'created_at' | 'updated_at' | 'completed_at'> & {
  id?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ActivityRecommendationInsert = Omit<ActivityRecommendation, 'id'> & {
  id?: string;
};

export type PastoralLogInsert = Omit<PastoralLog, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

// ============================================================================
// Update Types (for updating existing records)
// ============================================================================

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

export type SoulUpdate = Partial<Omit<Soul, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type ProgressUpdate = Partial<Omit<Progress, 'id' | 'soul_id' | 'created_at' | 'updated_at'>>;

export type ActivityPlanUpdate = Partial<Omit<ActivityPlan, 'id' | 'soul_id' | 'created_at' | 'updated_at'>>;

export type ActivityRecommendationUpdate = Partial<Omit<ActivityRecommendation, 'id' | 'training_type' | 'area_id' | 'week'>>;

export type PastoralLogUpdate = Partial<Omit<PastoralLog, 'id' | 'soul_id' | 'user_id' | 'created_at' | 'updated_at'>>;

// ============================================================================
// Relations Types (with joined data)
// ============================================================================

/**
 * Soul with related user profile
 */
export interface SoulWithProfile extends Omit<Soul, 'profile'> {
  profile: Profile;
}

/**
 * Progress with related soul
 */
export interface ProgressWithSoul extends Progress {
  soul: Soul;
}

/**
 * Activity plan with related soul
 */
export interface ActivityPlanWithSoul extends ActivityPlan {
  soul: Soul;
}

/**
 * Soul with all related data
 */
export interface SoulWithDetails extends Omit<Soul, 'profile'> {
  profile: Profile;
  progress: Progress[];
  activity_plans: ActivityPlan[];
}

/**
 * Pastoral log with related soul
 */
export interface PastoralLogWithSoul extends PastoralLog {
  soul: Soul;
}

// ============================================================================
// Query Filter Types
// ============================================================================

export interface SoulFilter {
  user_id?: string;
  training_type?: TrainingType;
  start_date_from?: string;
  start_date_to?: string;
}

export interface ProgressFilter {
  soul_id?: string;
  area_id?: string;
  week?: number;
  status?: ProgressStatus;
}

export interface ActivityPlanFilter {
  soul_id?: string;
  area_id?: string;
  week?: number;
  type?: ActivityType;
  status?: ActivityStatus;
}

export interface ActivityRecommendationFilter {
  training_type?: TrainingType;
  area_id?: string;
  week?: number;
}

export interface PastoralLogFilter {
  soul_id?: string;
  mood?: SpiritualMood;
  has_breakthrough?: boolean;
  recorded_at_from?: string;
  recorded_at_to?: string;
  activity_plan_id?: string;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Result type for database operations
 */
export type DatabaseResult<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  column: string;
  ascending?: boolean;
}

// ============================================================================
// Database Schema Type (for Supabase client)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      souls: {
        Row: Soul;
        Insert: SoulInsert;
        Update: SoulUpdate;
      };
      progress: {
        Row: Progress;
        Insert: ProgressInsert;
        Update: ProgressUpdate;
      };
      activity_plans: {
        Row: ActivityPlan;
        Insert: ActivityPlanInsert;
        Update: ActivityPlanUpdate;
      };
      activity_recommendations: {
        Row: ActivityRecommendation;
        Insert: ActivityRecommendationInsert;
        Update: ActivityRecommendationUpdate;
      };
      pastoral_logs: {
        Row: PastoralLog;
        Insert: PastoralLogInsert;
        Update: PastoralLogUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_current_week: {
        Args: {
          p_soul_id: string;
          p_area_id: string;
        };
        Returns: number;
      };
      get_weeks_since_start: {
        Args: {
          p_soul_id: string;
        };
        Returns: number;
      };
    };
    Enums: {
      training_type: TrainingType;
      progress_status: ProgressStatus;
      spiritual_mood: SpiritualMood;
      activity_type: ActivityType;
      activity_status: ActivityStatus;
    };
  };
}

// ============================================================================
// Area Configuration (Frontend Reference)
// ============================================================================

/**
 * Training area definitions (used in area_id fields)
 */
export const TRAINING_AREAS = {
  CONVERT: {
    bible_reading: '성경읽기',
    prayer: '기도',
    church_attendance: '교회출석',
    fellowship: '교제',
  },
  DISCIPLE: {
    bible_reading: '성경읽기',
    prayer: '기도',
    evangelism: '전도',
    discipleship: '양육',
  },
} as const;

export type ConvertAreaId = keyof typeof TRAINING_AREAS.CONVERT;
export type DiscipleAreaId = keyof typeof TRAINING_AREAS.DISCIPLE;
export type AreaId = ConvertAreaId | DiscipleAreaId;

/**
 * Get training areas for a specific training type
 */
export function getTrainingAreas(trainingType: TrainingType): Record<string, string> {
  return trainingType === 'convert' ? TRAINING_AREAS.CONVERT : TRAINING_AREAS.DISCIPLE;
}

/**
 * Validate area ID for training type
 */
export function isValidAreaId(trainingType: TrainingType, areaId: string): boolean {
  const areas = getTrainingAreas(trainingType);
  return areaId in areas;
}
