/**
 * Database Infrastructure Exports
 *
 * Central export point for all database-related types and utilities
 */

// Export all schema types
export * from './schema';

// Re-export commonly used types for convenience
export type {
  Profile,
  Soul,
  Progress,
  ActivityPlan,
  ActivityRecommendation,
  SoulWithProfile,
  SoulWithDetails,
  ProgressWithSoul,
  ActivityPlanWithSoul,
  TrainingType,
  ProgressStatus,
  PlanType,
  AreaId,
  ConvertAreaId,
  DiscipleAreaId,
} from './schema';

// Re-export utility functions
export {
  TRAINING_AREAS,
  getTrainingAreas,
  isValidAreaId,
} from './schema';
