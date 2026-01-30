/**
 * User Entity
 * 사용자(양육자) 엔티티
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  role?: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'trainer' | 'admin';

export interface UserProfile extends User {
  bio?: string;
  church?: string;
  phoneNumber?: string;
}
