/**
 * @fileoverview Leaderboard service
 * @description Business logic for leaderboard operations (ALL_TIME based on user.total_points)
 */

import { Injectable } from '@nestjs/common';
import { LeaderboardRepository } from './leaderboard.repository';
import { QueryLeaderboardDto } from './dto';
import { ILeaderboardEntry, IUserRankResponse } from './interfaces';

/**
 * Leaderboard service
 * @description Handles leaderboard logic (scheduler handles rewards automatically)
 */
@Injectable()
export class LeaderboardService {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  /**
   * Get leaderboard with pagination (ALL_TIME)
   * @param {QueryLeaderboardDto} query - Query parameters
   * @returns {Promise<object>} Paginated leaderboard
   */
  async getLeaderboard(query: QueryLeaderboardDto) {
    const result = await this.leaderboardRepository.getLeaderboard(query);

    return {
      data: result.data as ILeaderboardEntry[],
      meta: result.meta,
    };
  }

  /**
   * Get user's current rank (ALL_TIME)
   * @param {string} userId - User ID
   * @returns {Promise<IUserRankResponse>} User rank info
   */
  async getUserRank(userId: string): Promise<IUserRankResponse> {
    return this.leaderboardRepository.getUserRank(userId);
  }

  /**
   * Get top 3 users by total_points (ALL_TIME)
   * @returns {Promise<any[]>} Top 3 users
   */
  async getTopThree() {
    return this.leaderboardRepository.getTopUsers(3);
  }
}
