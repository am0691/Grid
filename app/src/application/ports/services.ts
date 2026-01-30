/**
 * External Service Ports (Interfaces)
 * 외부 서비스 인터페이스
 */

import type { User } from '../../domain/entities';

/**
 * Authentication Service Interface
 */
export interface IAuthService {
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshToken(): Promise<string>;
  verifyToken(token: string): Promise<boolean>;
}

/**
 * Notification Service Interface
 */
export interface INotificationService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendPush(userId: string, title: string, message: string): Promise<void>;
  scheduleReminder(soulId: string, scheduledAt: string, message: string): Promise<void>;
}

/**
 * Storage Service Interface
 */
export interface IStorageService {
  upload(file: File, path: string): Promise<string>; // returns URL
  download(url: string): Promise<Blob>;
  delete(url: string): Promise<void>;
}

/**
 * Analytics Service Interface
 */
export interface IAnalyticsService {
  trackEvent(eventName: string, properties?: Record<string, any>): void;
  trackPageView(pageName: string): void;
  setUserId(userId: string): void;
}
