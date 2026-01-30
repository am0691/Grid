/**
 * Get Activity Plans Use Case
 */

import type { IActivityPlanRepository } from '../../ports/repositories';
import type { ActivityPlan, ActivityPlanFilter } from '../../../domain/entities';

export class GetActivityPlansUseCase {
  private readonly activityPlanRepository: IActivityPlanRepository;

  constructor(activityPlanRepository: IActivityPlanRepository) {
    this.activityPlanRepository = activityPlanRepository;
  }

  async execute(filter?: ActivityPlanFilter): Promise<ActivityPlan[]> {
    if (filter) {
      return await this.activityPlanRepository.findByFilter(filter);
    }

    // 기본적으로 전체 조회하지 않고 soulId를 필터로 요구
    throw new Error('Filter is required');
  }

  async executeBySoulId(soulId: string): Promise<ActivityPlan[]> {
    return await this.activityPlanRepository.findBySoulId(soulId);
  }
}
