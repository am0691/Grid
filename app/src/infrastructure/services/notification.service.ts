/**
 * Notification Service Implementation
 */

import type { INotificationService } from '../../application/ports/services';

export class NotificationService implements INotificationService {
  // TODO: 실제 알림 서비스와 연동

  async sendEmail(_to: string, _subject: string, _body: string): Promise<void> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async sendPush(_userId: string, _title: string, _message: string): Promise<void> {
    // TODO: 구현
    throw new Error('Not implemented');
  }

  async scheduleReminder(_soulId: string, _scheduledAt: string, _message: string): Promise<void> {
    // TODO: 구현
    throw new Error('Not implemented');
  }
}
