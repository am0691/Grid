/**
 * Encouragement Entity (격려 시스템)
 */

export type EncouragementType = 'milestone' | 'weekly_summary' | 'encouragement' | 'reminder';

export interface Encouragement {
  id: string;
  trainerId: string;
  type: EncouragementType;
  title: string;
  message: string;
  relatedSoulId?: string;
  relatedSoulName?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateEncouragementDto {
  trainerId: string;
  type: EncouragementType;
  title: string;
  message: string;
  relatedSoulId?: string;
  relatedSoulName?: string;
}
