/**
 * Delete Activity Plan Use Case
 */

import type { IActivityPlanRepository } from '../../ports/repositories';

export class DeleteActivityPlanUseCase {
  private readonly activityPlanRepository: IActivityPlanRepository;

  constructor(activityPlanRepository: IActivityPlanRepository) {
    this.activityPlanRepository = activityPlanRepository;
  }

  async execute(id: string): Promise<void> {
    const plan = await this.activityPlanRepository.findById(id);

    if (!plan) {
      throw new Error('Activity plan not found');
    }

    await this.activityPlanRepository.delete(id);
  }
}
