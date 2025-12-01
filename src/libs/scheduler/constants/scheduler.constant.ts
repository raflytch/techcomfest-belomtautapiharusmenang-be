/**
 * @fileoverview Scheduler constants
 * @description Constant definitions for scheduler module
 */

/**
 * Daily bonus points configuration for top 3 users
 * @description Small bonus rewards for fairness
 * - Rank 1: 15 points
 * - Rank 2: 10 points
 * - Rank 3: 5 points
 */
export const DAILY_BONUS_POINTS: Record<1 | 2 | 3, number> = {
  1: 15,
  2: 10,
  3: 5,
} as const;

/**
 * Cron schedule configuration
 * @description Daily reward distribution at 23:59 WIB
 */
export const CRON_SCHEDULE = {
  /** Cron expression: minute 59, hour 23 (11:59 PM WIB) */
  DAILY_REWARD: '59 23 * * *',
} as const;

/**
 * Cron job name
 * @description Unique identifier for the daily reward job
 */
export const CRON_JOB_NAME = 'daily-reward-wib';

/**
 * Number of top users to reward daily
 */
export const TOP_USERS_COUNT = 3;
