/**
 * @fileoverview Leaderboard module
 * @description Module configuration for leaderboard feature
 */

import { Module } from '@nestjs/common';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardRepository } from './leaderboard.repository';

/**
 * Leaderboard module
 * @description Provides leaderboard endpoints and scheduler
 */
@Module({
  controllers: [LeaderboardController],
  providers: [LeaderboardService, LeaderboardRepository],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
