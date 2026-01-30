/**
 * Activity Plan Repository Implementation
 */

import type { IActivityPlanRepository } from '../../application/ports/repositories';
import type { ActivityPlan, CreateActivityPlanDto, UpdateActivityPlanDto, ActivityPlanFilter } from '../../domain/entities';

export class ActivityPlanRepository implements IActivityPlanRepository {
  // TODO: 실제 데이터베이스나 API와 연동

  async findById(_id: string): Promise<ActivityPlan | null> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async findBySoulId(_soulId: string): Promise<ActivityPlan[]> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async findByFilter(_filter: ActivityPlanFilter): Promise<ActivityPlan[]> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async create(_dto: CreateActivityPlanDto): Promise<ActivityPlan> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async update(_id: string, _dto: UpdateActivityPlanDto): Promise<ActivityPlan> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async delete(_id: string): Promise<void> {
    // TODO: 구현
    throw new Error('Not implemented');
  }
}
