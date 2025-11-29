/**
 * @fileoverview Safe user interface
 * @description User response interface without sensitive data
 */

import { UserRole } from '@prisma/client';

/**
 * Safe user response interface (without sensitive data)
 * @description Excludes password_hash from response
 */
export interface ISafeUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  googleId?: string | null;
  umkmName: string | null;
  umkmDescription: string | null;
  umkmLogoUrl: string | null;
  umkmAddress: string | null;
  umkmCategory: string | null;
  totalPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
