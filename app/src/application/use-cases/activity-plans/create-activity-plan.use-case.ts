/**
 * Create Activity Plan Use Case
 */

import type { IActivityPlanRepository } from '../../ports/repositories';
import type { ActivityPlan, CreateActivityPlanDto } from '../../../domain/entities';

export class CreateActivityPlanUseCase {
  private readonly activityPlanRepository: IActivityPlanRepository;

  constructor(activityPlanRepository: IActivityPlanRepository) {
    this.activityPlanRepository = activityPlanRepository;
  }

  async execute(dto: CreateActivityPlanDto): Promise<ActivityPlan> {
    return await this.activityPlanRepository.create(dto);
  }
}
