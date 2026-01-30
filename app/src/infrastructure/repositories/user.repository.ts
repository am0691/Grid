/**
 * User Repository Implementation
 */

import type { IUserRepository } from '../../application/ports/repositories';
import type { User, UserProfile } from '../../domain/entities';

export class UserRepository implements IUserRepository {
  // TODO: 실제 데이터베이스나 API와 연동

  async findById(_id: string): Promise<User | null> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async findByEmail(_email: string): Promise<User | null> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async findProfile(_id: string): Promise<UserProfile | null> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async create(_user: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async update(_id: string, _data: Partial<UserProfile>): Promise<User> {
    // TODO: 구현
    throw new Error('Not implemented');
  }
}
