/**
 * Infrastructure Services Barrel Export
 */

// Legacy auth service (will be deprecated)
export * from './auth.service';

// Supabase services
export * from './supabase';
export * from './auth';

// Other services
export * from './notification.service';
export * from './storage.service';
export * from './analytics.service';
