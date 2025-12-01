/**
 * @fileoverview Scheduler service
 * @description Handles scheduled tasks for daily leaderboard rewards at 23:59 WIB
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from '../../database/database.service';
import { MailerService } from '../mailer/mailer.service';
import { INDONESIA_TIMEZONE } from './enums/scheduler.enum';
import {
  IDailyRewardResult,
  IDailyRewardWinner,
  ITopUserData,
} from './interfaces/scheduler.interface';
import {
  CRON_JOB_NAME,
  CRON_SCHEDULE,
  DAILY_BONUS_POINTS,
  TOP_USERS_COUNT,
} from './constants/scheduler.constant';

/**
 * Scheduler service
 * @description Manages daily leaderboard reward distribution at 23:59 WIB
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
   * Daily Reward (23:59 WIB)
   * @description Distributes bonus points to top 3 users at 23:59 WIB
   * All regions in Indonesia follow this single WIB schedule
   */
  @Cron(CRON_SCHEDULE.DAILY_REWARD, {
    name: CRON_JOB_NAME,
    timeZone: INDONESIA_TIMEZONE.IANA,
  })
  async handleDailyReward(): Promise<IDailyRewardResult | null> {
    this.logger.log('🏆 Starting daily leaderboard reward at 23:59 WIB...');
    return this.distributeDailyReward();
  }

  /**
   * Get top N users by total_points (ALL_TIME leaderboard)
   * @param {number} topN - Number of top users
   * @returns {Promise<ITopUserData[]>} Top users
   */
  private async getTopUsers(
    topN: number = TOP_USERS_COUNT,
  ): Promise<ITopUserData[]> {
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
   * @returns {Promise<{ id: string; email: string; name: string; total_points: number }>} Updated user
   */
  private async addBonusPoints(
    userId: string,
    bonusPoints: number,
  ): Promise<{
    id: string;
    email: string;
    name: string;
    total_points: number;
  }> {
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
   * Distribute daily reward to top 3 users
   * @returns {Promise<IDailyRewardResult | null>} Reward result
   */
  private async distributeDailyReward(): Promise<IDailyRewardResult | null> {
    try {
      const topUsers = await this.getTopUsers(TOP_USERS_COUNT);

      if (topUsers.length === 0) {
        this.logger.log('No users with points. Skipping reward distribution.');
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
         * Send email notification to winner (fire and forget)
         */
        this.sendRewardEmail(user, rank, bonusPoints, updatedUser.total_points);

        this.logger.log(
          `🥇 Rank ${rank}: ${user.name} received ${bonusPoints} bonus points`,
        );
      }

      const now = new Date();
      const result: IDailyRewardResult = {
        date: now.toISOString().split('T')[0],
        timestamp: now.toISOString(),
        winners,
        totalBonusDistributed,
      };

      this.logger.log(
        `✅ Daily reward completed. Total bonus: ${totalBonusDistributed} points to ${winners.length} winners`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Daily reward distribution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send reward email to winner (fire and forget)
   * @param {ITopUserData} user - User data
   * @param {1 | 2 | 3} rank - User rank
   * @param {number} bonusPoints - Bonus points awarded
   * @param {number} newTotalPoints - New total points
   */
  private sendRewardEmail(
    user: ITopUserData,
    rank: 1 | 2 | 3,
    bonusPoints: number,
    newTotalPoints: number,
  ): void {
    this.mailerService
      .sendLeaderboardRewardEmail(user.email, {
        userName: user.name,
        rank,
        todayPoints: user.totalPoints,
        bonusPoints,
        newTotalPoints,
        date: new Date(),
      })
      .catch((err) =>
        this.logger.error(
          `Failed to send reward email to ${user.email}: ${err.message}`,
        ),
      );
  }
}
