/**
 * Get Soul Use Case
 */

import type { ISoulRepository } from '../../ports/repositories';
import type { Soul } from '../../../domain/entities';

export class GetSoulUseCase {
  private readonly soulRepository: ISoulRepository;

  constructor(soulRepository: ISoulRepository) {
    this.soulRepository = soulRepository;
  }

  async execute(id: string): Promise<Soul | null> {
    return await this.soulRepository.findById(id);
  }
}
