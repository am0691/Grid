/**
 * Analytics Service Implementation
 */

import type { IAnalyticsService } from '../../application/ports/services';

export class AnalyticsService implements IAnalyticsService {
  // TODO: 실제 분석 서비스와 연동 (Google Analytics, Mixpanel 등)

  trackEvent(eventName: string, properties?: Record<string, any>): void {
    // TODO: 구현
    console.log('Track event:', eventName, properties);
  }

  trackPageView(pageName: string): void {
    // TODO: 구현
    console.log('Track page view:', pageName);
  }

  setUserId(userId: string): void {
    // TODO: 구현
    console.log('Set user ID:', userId);
  }
}
