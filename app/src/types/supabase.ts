/**
 * Supabase Type Exports
 * Re-export all Supabase-related types for easy access
 */

// Database Schema Types
export type {
  Profile,
  Soul,
  Progress,
  ActivityPlan,
  ActivityRecommendation,
  SoulInsert,
  SoulUpdate,
  ProgressInsert,
  ProgressUpdate,
  ActivityPlanInsert,
  ActivityPlanUpdate,
  TrainingType,
  ProgressStatus,
  PlanType,
  Database,
} from '@/infrastructure/database/schema';

// Repository Types
export type {
  ActivityPlan as ActivityPlanEntity,
  CreatePlanInput,
  UpdatePlanInput,
} from '@/infrastructure/repositories/supabase/activity-plan-repository';

// Store Types
export type {
  CreateSoulInput,
  UpdateSoulInput,
} from '@/store/soulStore';

// Hook Types
export type { SoulFilter } from '@/presentation/hooks/useSouls';
