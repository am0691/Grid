/**
 * Logout Use Case
 */

import type { IAuthService } from '../../ports/services';

export class LogoutUseCase {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async execute(): Promise<void> {
    await this.authService.logout();
  }
}
