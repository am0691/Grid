/**
 * Training Type Value Object
 * 양육 타입 (Convert/Disciple)
 */

export type TrainingType = 'convert' | 'disciple';

export const CONVERT_WEEKS = 13;
export const DISCIPLE_MONTHS = 12;

export function getMaxWeeks(trainingType: TrainingType): number {
  return trainingType === 'convert' ? CONVERT_WEEKS : DISCIPLE_MONTHS;
}

export function getWeekLabel(trainingType: TrainingType): string {
  return trainingType === 'convert' ? '주차' : '월차';
}
