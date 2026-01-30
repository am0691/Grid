/**
 * Get Current User Use Case
 */

import type { IAuthService } from '../../ports/services';
import type { User } from '../../../domain/entities';

export class GetCurrentUserUseCase {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async execute(): Promise<User | null> {
    return await this.authService.getCurrentUser();
  }
}
