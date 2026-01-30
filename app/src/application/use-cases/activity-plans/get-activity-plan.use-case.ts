/**
 * Get Activity Plan Use Case
 */

import type { IActivityPlanRepository } from '../../ports/repositories';
import type { ActivityPlan } from '../../../domain/entities';

export class GetActivityPlanUseCase {
  private readonly activityPlanRepository: IActivityPlanRepository;

  constructor(activityPlanRepository: IActivityPlanRepository) {
    this.activityPlanRepository = activityPlanRepository;
  }

  async execute(id: string): Promise<ActivityPlan | null> {
    return await this.activityPlanRepository.findById(id);
  }
}
