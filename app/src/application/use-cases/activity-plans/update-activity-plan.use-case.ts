/**
 * Update Activity Plan Use Case
 */

import type { IActivityPlanRepository } from '../../ports/repositories';
import type { ActivityPlan, UpdateActivityPlanDto } from '../../../domain/entities';

export class UpdateActivityPlanUseCase {
  private readonly activityPlanRepository: IActivityPlanRepository;

  constructor(activityPlanRepository: IActivityPlanRepository) {
    this.activityPlanRepository = activityPlanRepository;
  }

  async execute(id: string, dto: UpdateActivityPlanDto): Promise<ActivityPlan> {
    const plan = await this.activityPlanRepository.findById(id);

    if (!plan) {
      throw new Error('Activity plan not found');
    }

    return await this.activityPlanRepository.update(id, dto);
  }
}
