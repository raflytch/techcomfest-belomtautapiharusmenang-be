/**
 * @fileoverview Application configuration service
 * @description Wrapper for @nestjs/config providing type-safe access to environment variables
 */

import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

/**
 * Configuration service for accessing environment variables
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: NestConfigService) {}

  /**
   * Get environment variable value with type safety
   * @template T - Type of the value
   * @param {string} key - Environment variable key
   * @param {T} [defaultValue] - Default value if not found
   * @returns {T} Environment variable value
   */
  get<T = string>(key: string, defaultValue?: T): T {
    return this.configService.get<T>(key, defaultValue as T);
  }

  /**
   * Get database connection URL
   * @returns {string} DATABASE_URL environment variable
   */
  get databaseUrl(): string {
    return this.get<string>('DATABASE_URL', '');
  }

  /**
   * Get application port
   * @returns {number} PORT environment variable, defaults to 3000
   */
  get port(): number {
    return this.get<number>('PORT', 3000);
  }

  /**
   * Get current environment
   * @returns {string} NODE_ENV value
   */
  get nodeEnv(): string {
    return this.get<string>('NODE_ENV', 'development');
  }

  /**
   * Check if running in production
   * @returns {boolean} True if NODE_ENV is production
   */
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  /**
   * Check if running in development
   * @returns {boolean} True if NODE_ENV is development
   */
  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  /**
   * Get JWT secret key
   * @returns {string} JWT_SECRET environment variable
   */
  get jwtSecret(): string {
    return this.get<string>('JWT_SECRET', 'default-secret-key');
  }

  /**
   * Get JWT expiration time
   * @returns {string} JWT_EXPIRES_IN environment variable
   */
  get jwtExpiresIn(): string {
    return this.get<string>('JWT_EXPIRES_IN', '7d');
  }
}
