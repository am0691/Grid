/**
 * Activity Plan UI Types
 * UI-specific type definitions for activity plan components
 */

import type { ActivityPlan } from '../../domain/entities/activity-plan';
import type { ActivityRecommendation } from '../../domain/entities/recommendation';

export type ActivityPlanSource = 'recommended' | 'personal';

export type ActivityPlanFilterType = 'all' | 'recommended' | 'personal' | 'completed' | 'incomplete';

export type ActivityPlanSortOption =
  | 'date-asc'
  | 'date-desc'
  | 'title-asc'
  | 'title-desc'
  | 'area'
  | 'status';

export interface ActivityPlanWithSource extends ActivityPlan {
  source: ActivityPlanSource;
  recommendation?: ActivityRecommendation;
}

export interface ActivityPlanFilters {
  type: ActivityPlanFilterType;
  areaId?: string;
  week?: number;
  searchQuery?: string;
}

export interface ActivityPlanUIState {
  isLoading: boolean;
  error?: string;
  selectedPlan?: ActivityPlan;
  filters: ActivityPlanFilters;
  sortBy: ActivityPlanSortOption;
}

export interface DragDropContext {
  sourceIndex: number;
  destinationIndex: number;
  planId: string;
}
