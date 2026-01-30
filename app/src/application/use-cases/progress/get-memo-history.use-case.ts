/**
 * Get Memo History Use Case
 */

import type { IProgressRepository } from '../../ports/repositories';
import type { MemoHistoryItem } from '../../../domain/entities';

export class GetMemoHistoryUseCase {
  private readonly progressRepository: IProgressRepository;

  constructor(progressRepository: IProgressRepository) {
    this.progressRepository = progressRepository;
  }

  async execute(soulId: string): Promise<MemoHistoryItem[]> {
    return await this.progressRepository.findMemoHistory(soulId);
  }
}
