/**
 * Login Use Case
 */

import type { IAuthService } from '../../ports/services';
import type { User } from '../../../domain/entities';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export class LoginUseCase {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const { email, password } = request;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    return await this.authService.login(email, password);
  }
}
