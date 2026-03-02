/**
 * Route Constants
 * Application route paths and path generators
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  SOULS: '/souls',
  SOUL_DETAIL: (soulId: string) => `/souls/${soulId}`,
  SOUL_GRID: (soulId: string) => `/souls/${soulId}/grid`,
  SOUL_CARE: (soulId: string) => `/souls/${soulId}/care`,
  SOUL_TIMELINE: (soulId: string) => `/souls/${soulId}/timeline`,
  INSIGHTS: '/insights',
  SETTINGS: '/settings',
} as const;
