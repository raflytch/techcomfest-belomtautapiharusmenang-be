/**
 * @fileoverview Scheduler service
 * @description Handles scheduled tasks for Indonesia timezones (WIB, WITA, WIT)
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from '@database/database.service';
import { MailerService } from '@libs/mailer/mailer.service';

/**
 * Indonesia timezone enum
 * @description Three timezone regions in Indonesia
 */
export enum IndonesiaTimezone {
  WIB = 'WIB',
  WITA = 'WITA',
  WIT = 'WIT',
}

/**
 * Bonus points configuration for top 3 users
 * @description Daily reward points for rank 1, 2, 3 (small bonus for fairness)
 */
const DAILY_BONUS_POINTS = {
  1: 15,
  2: 10,
  3: 5,
} as const;

/**
 * Daily reward winner interface
 * @description Winner data for daily reward distribution
 */
export interface IDailyRewardWinner {
  userId: string;
  email: string;
  name: string;
  rank: 1 | 2 | 3;
  totalPoints: number;
  bonusPoints: number;
  newTotalPoints: number;
}

/**
 * Daily reward result interface
 * @description Result of daily reward distribution
 */
export interface IDailyRewardResult {
  date: string;
  timezone: IndonesiaTimezone;
  winners: IDailyRewardWinner[];
  totalBonusDistributed: number;
}

/**
 * Scheduler service
 * @description Manages scheduled tasks for all Indonesia timezones
 */
@Injectable()
export class SchedulerService {
  /**
   * Logger instance
   */
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * WIB Daily Reward (23:59 WIB)
   * @description Distributes bonus points to top 3 users in WIB timezone
   */
  @Cron('59 23 * * *', {
    name: 'daily-reward-wib',
    timeZone: 'Asia/Jakarta',
  })
  async handleDailyRewardWIB(): Promise<IDailyRewardResult | null> {
    this.logger.log(
      '🏆 [WIB] Starting daily leaderboard reward at 23:59 WIB...',
    );
    return this.distributeDailyReward(IndonesiaTimezone.WIB);
  }

  /**
   * WITA Daily Reward (23:59 WITA)
   * @description Distributes bonus points to top 3 users in WITA timezone
   */
  @Cron('59 23 * * *', {
    name: 'daily-reward-wita',
    timeZone: 'Asia/Makassar',
  })
  async handleDailyRewardWITA(): Promise<IDailyRewardResult | null> {
    this.logger.log(
      '🏆 [WITA] Starting daily leaderboard reward at 23:59 WITA...',
    );
    return this.distributeDailyReward(IndonesiaTimezone.WITA);
  }

  /**
   * WIT Daily Reward (23:59 WIT)
   * @description Distributes bonus points to top 3 users in WIT timezone
   */
  @Cron('59 23 * * *', {
    name: 'daily-reward-wit',
    timeZone: 'Asia/Jayapura',
  })
  async handleDailyRewardWIT(): Promise<IDailyRewardResult | null> {
    this.logger.log(
      '🏆 [WIT] Starting daily leaderboard reward at 23:59 WIT...',
    );
    return this.distributeDailyReward(IndonesiaTimezone.WIT);
  }

  /**
   * Get top N users by total_points (ALL_TIME leaderboard)
   * @param {number} topN - Number of top users
   * @returns {Promise<any[]>} Top users
   */
  private async getTopUsers(topN: number = 3): Promise<any[]> {
    const topUsers = await this.db.user.findMany({
      where: {
        role: 'WARGA',
        is_active: true,
        total_points: { gt: 0 },
      },
      select: {
        id: true,
        email: true,
        name: true,
        total_points: true,
      },
      orderBy: { total_points: 'desc' },
      take: topN,
    });

    return topUsers.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      totalPoints: user.total_points,
    }));
  }

  /**
   * Add bonus points to user
   * @param {string} userId - User ID
   * @param {number} bonusPoints - Bonus points to add
   * @returns {Promise<any>} Updated user
   */
  private async addBonusPoints(
    userId: string,
    bonusPoints: number,
  ): Promise<any> {
    return this.db.user.update({
      where: { id: userId },
      data: {
        total_points: { increment: bonusPoints },
      },
      select: {
        id: true,
        email: true,
        name: true,
        total_points: true,
      },
    });
  }

  /**
   * Distribute daily reward to top 3 users (called by cron handlers)
   * @param {IndonesiaTimezone} timezone - Timezone identifier
   * @returns {Promise<IDailyRewardResult | null>} Reward result
   */
  private async distributeDailyReward(
    timezone: IndonesiaTimezone,
  ): Promise<IDailyRewardResult | null> {
    try {
      const topUsers = await this.getTopUsers(3);

      if (topUsers.length === 0) {
        this.logger.log(
          `[${timezone}] No users with points. Skipping reward distribution.`,
        );
        return null;
      }

      const winners: IDailyRewardWinner[] = [];
      let totalBonusDistributed = 0;

      /**
       * Process each top user
       */
      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        const rank = (i + 1) as 1 | 2 | 3;
        const bonusPoints = DAILY_BONUS_POINTS[rank];

        /**
         * Add bonus points to user
         */
        const updatedUser = await this.addBonusPoints(user.id, bonusPoints);

        const winner: IDailyRewardWinner = {
          userId: user.id,
          email: user.email,
          name: user.name,
          rank,
          totalPoints: user.totalPoints,
          bonusPoints,
          newTotalPoints: updatedUser.total_points,
        };

        winners.push(winner);
        totalBonusDistributed += bonusPoints;

        /**
         * Send email notification to winner
         */
        this.mailerService
          .sendLeaderboardRewardEmail(user.email, {
            userName: user.name,
            rank,
            todayPoints: user.totalPoints,
            bonusPoints,
            newTotalPoints: updatedUser.total_points,
            date: new Date(),
          })
          .catch((err) =>
            this.logger.error(
              `[${timezone}] Failed to send reward email to ${user.email}: ${err.message}`,
            ),
          );

        this.logger.log(
          `🥇 [${timezone}] Rank ${rank}: ${user.name} received ${bonusPoints} bonus points`,
        );
      }

      const result: IDailyRewardResult = {
        date: new Date().toISOString().split('T')[0],
        timezone,
        winners,
        totalBonusDistributed,
      };

      this.logger.log(
        `✅ [${timezone}] Daily reward completed. Total bonus: ${totalBonusDistributed} points to ${winners.length} winners`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `[${timezone}] Daily reward distribution failed: ${error.message}`,
      );
      throw error;
    }
  }
}
