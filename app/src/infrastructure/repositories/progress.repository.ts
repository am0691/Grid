/**
 * Progress Repository Implementation
 */

import type { IProgressRepository } from '../../application/ports/repositories';
import type { SoulProgress, UpdateProgressDto, MemoHistoryItem } from '../../domain/entities';

export class ProgressRepository implements IProgressRepository {
  // TODO: 실제 데이터베이스나 API와 연동

  async findBySoulId(_soulId: string): Promise<SoulProgress | null> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async update(_dto: UpdateProgressDto): Promise<void> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async findMemoHistory(_soulId: string): Promise<MemoHistoryItem[]> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async saveMemo(_item: Omit<MemoHistoryItem, 'id' | 'createdAt'>): Promise<MemoHistoryItem> {
    // TODO: 구현
    throw new Error('Not implemented');
  }
}
