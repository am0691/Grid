/**
 * Get Souls Use Case
 */

import type { ISoulRepository } from '../../ports/repositories';
import type { Soul } from '../../../domain/entities';

export class GetSoulsUseCase {
  private readonly soulRepository: ISoulRepository;

  constructor(soulRepository: ISoulRepository) {
    this.soulRepository = soulRepository;
  }

  async execute(trainerId?: string): Promise<Soul[]> {
    if (trainerId) {
      return await this.soulRepository.findByTrainerId(trainerId);
    }
    return await this.soulRepository.findAll();
  }
}
