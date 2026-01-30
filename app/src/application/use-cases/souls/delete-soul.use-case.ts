/**
 * Delete Soul Use Case
 */

import type { ISoulRepository } from '../../ports/repositories';

export class DeleteSoulUseCase {
  private readonly soulRepository: ISoulRepository;

  constructor(soulRepository: ISoulRepository) {
    this.soulRepository = soulRepository;
  }

  async execute(id: string): Promise<void> {
    const soul = await this.soulRepository.findById(id);

    if (!soul) {
      throw new Error('Soul not found');
    }

    await this.soulRepository.delete(id);
  }
}
