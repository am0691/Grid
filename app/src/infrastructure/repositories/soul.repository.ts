/**
 * Soul Repository Implementation
 * 실제 데이터 저장소와 연동하는 구현체
 */

import type { ISoulRepository } from '../../application/ports/repositories';
import type { Soul, CreateSoulDto, UpdateSoulDto, SoulProgress } from '../../domain/entities';

export class SoulRepository implements ISoulRepository {
  // TODO: 실제 데이터베이스나 API와 연동

  async findById(_id: string): Promise<Soul | null> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async findByTrainerId(_trainerId: string): Promise<Soul[]> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async findAll(): Promise<Soul[]> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async create(_dto: CreateSoulDto): Promise<Soul> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async update(_id: string, _dto: UpdateSoulDto): Promise<Soul> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async delete(_id: string): Promise<void> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async findWithProgress(_id: string): Promise<SoulProgress | null> {
    // TODO: 구현
    throw new Error('Not implemented');
  }
}
