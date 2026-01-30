/**
 * Update Progress Use Case
 */

import type { IProgressRepository } from '../../ports/repositories';
import type { UpdateProgressDto } from '../../../domain/entities';

export class UpdateProgressUseCase {
  private readonly progressRepository: IProgressRepository;

  constructor(progressRepository: IProgressRepository) {
    this.progressRepository = progressRepository;
  }

  async execute(dto: UpdateProgressDto): Promise<void> {
    await this.progressRepository.update(dto);
  }
}
