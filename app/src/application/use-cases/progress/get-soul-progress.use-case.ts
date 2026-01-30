/**
 * Get Soul Progress Use Case
 */

import type { IProgressRepository } from '../../ports/repositories';
import type { SoulProgress } from '../../../domain/entities';

export class GetSoulProgressUseCase {
  private readonly progressRepository: IProgressRepository;

  constructor(progressRepository: IProgressRepository) {
    this.progressRepository = progressRepository;
  }

  async execute(soulId: string): Promise<SoulProgress | null> {
    return await this.progressRepository.findBySoulId(soulId);
  }
}
