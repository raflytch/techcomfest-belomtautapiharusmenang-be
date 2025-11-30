/**
 * @fileoverview Leaderboard controller
 * @description REST API endpoints for leaderboard operations (ALL_TIME based on user.total_points)
 */

import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@commons/guards/jwt-auth.guard';
import { CurrentUser } from '@commons/decorators/current-user.decorator';
import { JwtPayload } from '@commons/strategies/jwt.strategy';
import { LeaderboardService } from './leaderboard.service';
import { QueryLeaderboardDto } from './dto';

/**
 * Leaderboard controller
 * @description Handles leaderboard endpoints (ALL_TIME ranking by total_points)
 */
@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * Get leaderboard (public, ALL_TIME)
   * @param {QueryLeaderboardDto} query - Query parameters
   * @returns {Promise<object>} Paginated leaderboard
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get leaderboard',
    description: 'Get paginated ALL_TIME leaderboard based on total_points',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leaderboard retrieved' })
  async getLeaderboard(@Query() query: QueryLeaderboardDto) {
    const result = await this.leaderboardService.getLeaderboard(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Leaderboard retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * Get top 3 users (ALL_TIME by total_points)
   * @returns {Promise<object>} Top 3 users
   */
  @Get('top-three')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get top 3 users',
    description: 'Get top 3 users by total points (ALL_TIME)',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Top 3 retrieved' })
  async getTopThree() {
    const topThree = await this.leaderboardService.getTopThree();
    return {
      statusCode: HttpStatus.OK,
      message: 'Top 3 users retrieved successfully',
      data: topThree.map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        name: user.name,
        totalPoints: user.totalPoints,
        totalActions: user.totalActions,
      })),
    };
  }

  /**
   * Get my rank (authenticated, ALL_TIME)
   * @param {JwtPayload} user - Current user
   * @returns {Promise<object>} User rank info
   */
  @Get('my-rank')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my rank',
    description: 'Get current user rank in ALL_TIME leaderboard',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rank retrieved' })
  async getMyRank(@CurrentUser() user: JwtPayload) {
    const rank = await this.leaderboardService.getUserRank(user.sub);
    return {
      statusCode: HttpStatus.OK,
      message: 'Your rank retrieved successfully',
      data: rank,
    };
  }
}
