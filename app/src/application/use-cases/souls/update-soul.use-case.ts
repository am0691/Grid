/**
 * Update Soul Use Case
 */

import type { ISoulRepository } from '../../ports/repositories';
import type { Soul, UpdateSoulDto } from '../../../domain/entities';

export class UpdateSoulUseCase {
  private readonly soulRepository: ISoulRepository;

  constructor(soulRepository: ISoulRepository) {
    this.soulRepository = soulRepository;
  }

  async execute(id: string, dto: UpdateSoulDto): Promise<Soul> {
    const soul = await this.soulRepository.findById(id);

    if (!soul) {
      throw new Error('Soul not found');
    }

    return await this.soulRepository.update(id, dto);
  }
}
