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
  ActivityType,
  ActivityStatus,
  Database,
} from '@/infrastructure/database/schema';

// Domain Entity Types
export type {
  ActivityPlan as ActivityPlanEntity,
  CreateActivityPlanDto,
  UpdateActivityPlanDto,
} from '@/domain/entities/activity-plan';

// Store Types
export type {
  CreateSoulInput,
  UpdateSoulInput,
} from '@/store/soulStore';

// Hook Types
export type { SoulFilter } from '@/presentation/hooks/useSouls';
