/**
 * @fileoverview Green Waste AI Controller
 * @description Controller for green action endpoints with AI verification
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../commons/guards/jwt-auth.guard';
import { RolesGuard } from '../../commons/guards/roles.guard';
import { Roles } from '../../commons/decorators/roles.decorator';
import { CurrentUser } from '../../commons/decorators/current-user.decorator';
import { JwtPayload } from '../../commons/strategies/jwt.strategy';
import { GreenWasteAiService } from './green-waste-ai.service';
import { CreateGreenActionDto } from './dto/create-green-action.dto';
import { QueryGreenActionDto } from './dto/query-green-action.dto';

/**
 * Green Waste AI Controller
 * @description Handles all green action related HTTP requests
 */
@ApiTags('Green Actions')
@Controller('green-actions')
export class GreenWasteAiController {
  /**
   * Inject green waste AI service
   * @param {GreenWasteAiService} greenWasteAiService - Green waste AI service
   */
  constructor(private readonly greenWasteAiService: GreenWasteAiService) {}

  /**
   * Get categories and sub-categories info (public endpoint)
   * @returns {Promise<object>} Categories information
   */
  @Get('categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get categories info',
    description: 'Get all available categories and sub-categories (public)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories info retrieved successfully',
  })
  async getCategoriesInfo() {
    const categories = {
      GREEN_WASTE: {
        name: 'Green Waste - Pilah & Olah Sampah',
        description: 'Sorting and processing waste properly',
        subCategories: [
          {
            id: 'ORGANIC_WASTE',
            name: 'Pilah Sampah Organik',
            description: 'Sorting organic/biodegradable waste',
            criteria: 'Minimum 2 types of waste detected, proper bins visible',
            basePoints: 50,
          },
          {
            id: 'INORGANIC_RECYCLE',
            name: 'Pilah Sampah Anorganik Daur Ulang',
            description:
              'Sorting recyclable inorganic waste (plastic, paper, metal)',
            criteria: 'Minimum 2 types of recyclables, separate containers',
            basePoints: 50,
          },
          {
            id: 'HAZARDOUS_WASTE',
            name: 'Penanganan Sampah Berbahaya (B3)',
            description:
              'Handling hazardous waste (batteries, lamps, expired medicine)',
            criteria: 'Hazardous items detected, special container visible',
            basePoints: 70,
          },
        ],
      },
      GREEN_HOME: {
        name: 'Green Home - Tanam Pohon & Area Hijau',
        description: 'Planting trees and creating green areas at home',
        subCategories: [
          {
            id: 'PLANT_TREE',
            name: 'Tanam Pohon/Tanaman Baru',
            description: 'Planting new trees or plants',
            criteria: 'Planting activity visible, plants/seedlings detected',
            basePoints: 60,
            bonus: 'Before-after comparison: +20 points',
          },
          {
            id: 'URBAN_FARMING',
            name: 'Urban Farming',
            description: 'Growing vegetables in pots or small hydroponics',
            criteria: 'Urban garden/hydroponics setup visible',
            basePoints: 50,
          },
          {
            id: 'GREEN_CORNER',
            name: 'Mini Green Corner',
            description: 'Creating a mini green corner at home',
            criteria: 'Dedicated green space with multiple plants',
            basePoints: 40,
          },
        ],
      },
      GREEN_CONSUMPTION: {
        name: 'Green Consumption - Produk Organik/Ramah Lingkungan',
        description: 'Using organic or eco-friendly products',
        subCategories: [
          {
            id: 'ORGANIC_PRODUCT',
            name: 'Produk Organik',
            description: 'Buying organic products (soap, skincare, food)',
            criteria: 'Organic products visible, eco-friendly packaging',
            basePoints: 30,
            bonus: 'UMKM product detected: +10 points',
          },
          {
            id: 'REFILL_STATION',
            name: 'Refill Station/Bulk Store',
            description: 'Shopping at refill stations or bulk stores',
            criteria: 'Refill station/bulk store visible, no-plastic packaging',
            basePoints: 35,
          },
          {
            id: 'REUSABLE_ITEMS',
            name: 'Pakai Barang Reusable',
            description: 'Using reusable bags, tumblers, containers',
            criteria: 'Reusable items visible (bags, tumbler, containers)',
            basePoints: 25,
          },
        ],
      },
      GREEN_COMMUNITY: {
        name: 'Green Community - Aksi Kolektif',
        description: 'Collective environmental actions',
        subCategories: [
          {
            id: 'COMMUNITY_CLEANUP',
            name: 'Kerja Bakti',
            description: 'Community cleanup activities',
            criteria: 'Group cleanup activity, collected trash visible',
            basePoints: 80,
          },
          {
            id: 'RIVER_CLEANUP',
            name: 'Bersih Sungai',
            description: 'River or water body cleaning',
            criteria: 'River cleaning activity, collected debris',
            basePoints: 90,
          },
          {
            id: 'CAR_FREE_DAY',
            name: 'Car Free Day Hijau',
            description: 'Green car-free day activities',
            criteria: 'Car-free day activity (cycling, walking, green events)',
            basePoints: 60,
          },
          {
            id: 'OTHER_COLLECTIVE',
            name: 'Aksi Kolektif Lainnya',
            description: 'Other collective green actions',
            criteria: 'Group environmental activity visible',
            basePoints: 50,
          },
        ],
      },
    };

    return {
      statusCode: HttpStatus.OK,
      message: 'Categories info retrieved successfully',
      data: categories,
    };
  }

  /**
   * Submit a new green action with media
   * @param {JwtPayload} user - Current authenticated user
   * @param {CreateGreenActionDto} dto - Green action data
   * @param {Express.Multer.File} file - Media file (image/video)
   * @returns {Promise<object>} Created green action response
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('media'))
  @ApiOperation({
    summary: 'Submit a new green action',
    description:
      'Submit a green action with media (image/video) for AI verification',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Green action data with media file',
    schema: {
      type: 'object',
      required: ['category', 'subCategory', 'media'],
      properties: {
        category: {
          type: 'string',
          enum: [
            'GREEN_WASTE',
            'GREEN_HOME',
            'GREEN_CONSUMPTION',
            'GREEN_COMMUNITY',
          ],
          description: 'Main category of the green action',
        },
        subCategory: {
          type: 'string',
          description: 'Sub-category of the green action',
        },
        description: {
          type: 'string',
          description: 'Optional description of the action',
        },
        location: {
          type: 'string',
          description: 'Optional location/district',
        },
        media: {
          type: 'string',
          format: 'binary',
          description:
            'Image or video file (max 10MB for images, 100MB for videos)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Green action submitted and verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or file type',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Not authenticated',
  })
  async submitAction(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateGreenActionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.greenWasteAiService.submitAction(
      user.sub,
      dto,
      file,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Green action submitted successfully',
      data: result,
    };
  }

  /**
   * Get current user's green actions
   * @param {JwtPayload} user - Current authenticated user
   * @param {QueryGreenActionDto} query - Query parameters
   * @returns {Promise<object>} Paginated green actions
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my green actions',
    description: 'Get paginated list of current user green actions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Green actions retrieved successfully',
  })
  async getMyActions(
    @CurrentUser() user: JwtPayload,
    @Query() query: QueryGreenActionDto,
  ) {
    const result = await this.greenWasteAiService.getUserActions(
      user.sub,
      query,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Green actions retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * Get current user's green action statistics
   * @param {JwtPayload} user - Current authenticated user
   * @returns {Promise<object>} User statistics
   */
  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my green action statistics',
    description: 'Get statistics of current user green actions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
  })
  async getMyStats(@CurrentUser() user: JwtPayload) {
    const stats = await this.greenWasteAiService.getUserStats(user.sub);

    return {
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  /**
   * Get all green actions (admin only)
   * @param {QueryGreenActionDto} query - Query parameters
   * @returns {Promise<object>} Paginated green actions
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DLH')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all green actions (Admin/DLH only)',
    description: 'Get paginated list of all green actions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Green actions retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied - Admin/DLH only',
  })
  async getAllActions(@Query() query: QueryGreenActionDto) {
    const result = await this.greenWasteAiService.getAllActions(query);

    return {
      statusCode: HttpStatus.OK,
      message: 'Green actions retrieved successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * Get a single green action by ID
   * @param {JwtPayload} user - Current authenticated user
   * @param {string} id - Green action ID
   * @returns {Promise<object>} Green action details
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get green action by ID',
    description: 'Get details of a specific green action',
  })
  @ApiParam({
    name: 'id',
    description: 'Green action UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Green action retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Green action not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  async getActionById(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'DLH';
    const result = await this.greenWasteAiService.getActionById(
      id,
      user.sub,
      isAdmin,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Green action retrieved successfully',
      data: result,
    };
  }

  /**
   * Delete a green action
   * @param {JwtPayload} user - Current authenticated user
   * @param {string} id - Green action ID
   * @returns {Promise<object>} Deletion confirmation
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete green action',
    description: 'Delete a specific green action (own action or admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'Green action UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Green action deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Green action not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  async deleteAction(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'DLH';
    await this.greenWasteAiService.deleteAction(id, user.sub, isAdmin);

    return {
      statusCode: HttpStatus.OK,
      message: 'Green action deleted successfully',
    };
  }

  /**
   * Retry verification for a failed action
   * @param {JwtPayload} user - Current authenticated user
   * @param {string} id - Green action ID
   * @returns {Promise<object>} Updated green action
   */
  @Post(':id/retry')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retry verification',
    description: 'Retry AI verification for a failed/needs improvement action',
  })
  @ApiParam({
    name: 'id',
    description: 'Green action UUID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Verification retry initiated',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Green action not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Action already verified',
  })
  async retryVerification(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const result = await this.greenWasteAiService.retryVerification(
      id,
      user.sub,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Verification retry initiated',
      data: result,
    };
  }
}
