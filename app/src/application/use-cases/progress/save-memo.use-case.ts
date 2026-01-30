/**
 * Save Memo Use Case
 */

import type { IProgressRepository } from '../../ports/repositories';
import type { MemoHistoryItem } from '../../../domain/entities';
import type { Area } from '../../../types';

export interface SaveMemoRequest {
  soulId: string;
  areaId: Area;
  week: number;
  memo: string;
}

export class SaveMemoUseCase {
  private readonly progressRepository: IProgressRepository;

  constructor(progressRepository: IProgressRepository) {
    this.progressRepository = progressRepository;
  }

  async execute(request: SaveMemoRequest): Promise<MemoHistoryItem> {
    return await this.progressRepository.saveMemo(request);
  }
}
