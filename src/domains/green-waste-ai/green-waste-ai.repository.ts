/**
 * @fileoverview Green Action Repository
 * @description Repository layer for green action database operations
 */

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import {
  toPrismaQueryOptions,
  createPaginatedResult,
} from '@commons/helpers/pagination.helper';
import { IPaginatedResult } from '@commons/intefaces/pagination.interface';
import { green_action } from '@prisma/client';
import { QueryGreenActionDto } from './dto/query-green-action.dto';
import {
  GreenActionCategory,
  GreenActionStatus,
} from './enums/green-action.enum';
import { IUserGreenActionStats } from './interfaces/green-action.interface';

/**
 * Green Action Repository
 * @description Handles all database operations for green actions
 */
@Injectable()
export class GreenWasteAiRepository {
  /**
   * Inject database service
   * @param {DatabaseService} db - Prisma database service
   */
  constructor(private readonly db: DatabaseService) {}

  /**
   * Create a new green action
   * @param {object} data - Green action data
   * @returns {Promise<green_action>} Created green action
   */
  async create(data: {
    userId: string;
    category: string;
    description?: string;
    mediaUrl: string;
    mediaType: string;
    status?: string;
    aiScore?: number;
    aiFeedback?: string;
    aiLabels?: string;
    points?: number;
  }): Promise<green_action> {
    return this.db.green_action.create({
      data: {
        user_id: data.userId,
        category: data.category,
        description: data.description,
        media_url: data.mediaUrl,
        media_type: data.mediaType,
        status: data.status || GreenActionStatus.PENDING,
        ai_score: data.aiScore,
        ai_feedback: data.aiFeedback,
        ai_labels: data.aiLabels,
        points: data.points || 0,
      },
    });
  }

  /**
   * Find green action by ID
   * @param {string} id - Green action ID
   * @returns {Promise<green_action | null>} Green action or null
   */
  async findById(id: string): Promise<green_action | null> {
    return this.db.green_action.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  /**
   * Find green action by ID for specific user
   * @param {string} id - Green action ID
   * @param {string} userId - User ID
   * @returns {Promise<green_action | null>} Green action or null
   */
  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<green_action | null> {
    return this.db.green_action.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });
  }

  /**
   * Find all green actions for a user with pagination and filters
   * @param {string} userId - User ID
   * @param {QueryGreenActionDto} query - Query parameters
   * @returns {Promise<IPaginatedResult<green_action>>} Paginated green actions
   */
  async findByUserId(
    userId: string,
    query: QueryGreenActionDto,
  ): Promise<IPaginatedResult<green_action>> {
    const where = {
      user_id: userId,
      ...(query.category && { category: query.category }),
      ...(query.status && { status: query.status }),
    };

    const prismaOptions = toPrismaQueryOptions(query);

    const [data, total] = await Promise.all([
      this.db.green_action.findMany({
        where,
        ...prismaOptions,
      }),
      this.db.green_action.count({ where }),
    ]);

    return createPaginatedResult(data, total, query);
  }

  /**
   * Find all green actions with pagination and filters (admin)
   * @param {QueryGreenActionDto} query - Query parameters
   * @returns {Promise<IPaginatedResult<green_action>>} Paginated green actions
   */
  async findAll(
    query: QueryGreenActionDto,
  ): Promise<IPaginatedResult<green_action>> {
    const where = {
      ...(query.category && { category: query.category }),
      ...(query.status && { status: query.status }),
    };

    const prismaOptions = toPrismaQueryOptions(query);

    const [data, total] = await Promise.all([
      this.db.green_action.findMany({
        where,
        ...prismaOptions,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      }),
      this.db.green_action.count({ where }),
    ]);

    return createPaginatedResult(data, total, query);
  }

  /**
   * Update green action with AI verification results
   * @param {string} id - Green action ID
   * @param {object} data - Update data
   * @returns {Promise<green_action>} Updated green action
   */
  async updateVerification(
    id: string,
    data: {
      status: string;
      aiScore: number;
      aiFeedback: string;
      aiLabels: string;
      points: number;
    },
  ): Promise<green_action> {
    return this.db.green_action.update({
      where: { id },
      data: {
        status: data.status,
        ai_score: data.aiScore,
        ai_feedback: data.aiFeedback,
        ai_labels: data.aiLabels,
        points: data.points,
      },
    });
  }

  /**
   * Delete green action
   * @param {string} id - Green action ID
   * @returns {Promise<green_action>} Deleted green action
   */
  async delete(id: string): Promise<green_action> {
    return this.db.green_action.delete({
      where: { id },
    });
  }

  /**
   * Get user green action statistics
   * @param {string} userId - User ID
   * @returns {Promise<IUserGreenActionStats>} User statistics
   */
  async getUserStats(userId: string): Promise<IUserGreenActionStats> {
    const [totalActions, verifiedActions, pendingActions, categoryStats] =
      await Promise.all([
        this.db.green_action.count({
          where: { user_id: userId },
        }),
        this.db.green_action.count({
          where: {
            user_id: userId,
            status: GreenActionStatus.VERIFIED,
          },
        }),
        this.db.green_action.count({
          where: {
            user_id: userId,
            status: GreenActionStatus.PENDING,
          },
        }),
        this.db.green_action.groupBy({
          by: ['category'],
          where: { user_id: userId },
          _count: { id: true },
          _sum: { points: true },
        }),
      ]);

    /**
     * Calculate total points from verified actions
     */
    const totalPointsResult = await this.db.green_action.aggregate({
      where: {
        user_id: userId,
        status: GreenActionStatus.VERIFIED,
      },
      _sum: { points: true },
    });

    /**
     * Build category statistics object
     */
    const byCategory: IUserGreenActionStats['byCategory'] = {};
    for (const stat of categoryStats) {
      byCategory[stat.category as GreenActionCategory] = {
        count: stat._count.id,
        points: stat._sum.points || 0,
      };
    }

    return {
      totalActions,
      totalPoints: totalPointsResult._sum.points || 0,
      verifiedActions,
      pendingActions,
      byCategory,
    };
  }

  /**
   * Update user total points after green action verification
   * @param {string} userId - User ID
   * @param {number} points - Points to add
   * @returns {Promise<void>}
   */
  async updateUserPoints(userId: string, points: number): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: {
        total_points: {
          increment: points,
        },
      },
    });
  }

  /**
   * Get recent verified actions for leaderboard
   * @param {number} limit - Number of actions to return
   * @returns {Promise<green_action[]>} Recent verified actions
   */
  async getRecentVerifiedActions(limit: number = 10): Promise<green_action[]> {
    return this.db.green_action.findMany({
      where: {
        status: GreenActionStatus.VERIFIED,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });
  }
}
