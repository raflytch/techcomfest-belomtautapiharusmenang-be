/**
 * @fileoverview Green Waste AI Service
 * @description Service for handling green actions with AI verification
 */

import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GoogleGenAiService } from '@libs/google-genai/google-gen-ai.service';
import { CloudinaryService } from '@libs/cloudinary/cloudinary.service';
import { GreenWasteAiRepository } from './green-waste-ai.repository';
import { CreateGreenActionDto } from './dto/create-green-action.dto';
import { QueryGreenActionDto } from './dto/query-green-action.dto';
import {
  GreenActionCategory,
  GreenActionMediaType,
  GreenActionStatus,
} from './enums/green-action.enum';
import {
  IAiAnalysisResult,
  IGreenActionResponse,
  IUserGreenActionStats,
} from './interfaces/green-action.interface';
import { IPaginatedResult } from '@commons/intefaces/pagination.interface';
import { MediaType } from '@libs/google-genai/interfaces/google-gen-ai.interface';

/**
 * Green Waste AI Service
 * @description Handles green action creation, AI verification, and management
 */
@Injectable()
export class GreenWasteAiService {
  private readonly logger = new Logger(GreenWasteAiService.name);

  /**
   * Points criteria based on AI score for each category
   */
  private readonly POINTS_CRITERIA = {
    [GreenActionCategory.GREEN_WASTE]: {
      ORGANIC_WASTE: { basePoints: 50, minScore: 60 },
      INORGANIC_RECYCLE: { basePoints: 50, minScore: 60 },
      HAZARDOUS_WASTE: { basePoints: 70, minScore: 75 },
    },
    [GreenActionCategory.GREEN_HOME]: {
      PLANT_TREE: { basePoints: 60, minScore: 70 },
      URBAN_FARMING: { basePoints: 50, minScore: 65 },
      GREEN_CORNER: { basePoints: 40, minScore: 60 },
    },
    [GreenActionCategory.GREEN_CONSUMPTION]: {
      ORGANIC_PRODUCT: { basePoints: 30, minScore: 60 },
      REFILL_STATION: { basePoints: 35, minScore: 60 },
      REUSABLE_ITEMS: { basePoints: 25, minScore: 55 },
    },
    [GreenActionCategory.GREEN_COMMUNITY]: {
      COMMUNITY_CLEANUP: { basePoints: 80, minScore: 70 },
      RIVER_CLEANUP: { basePoints: 90, minScore: 70 },
      CAR_FREE_DAY: { basePoints: 60, minScore: 65 },
      OTHER_COLLECTIVE: { basePoints: 50, minScore: 60 },
    },
  };

  /**
   * AI prompt templates for each category
   */
  private readonly AI_PROMPTS = {
    [GreenActionCategory.GREEN_WASTE]: `You are an AI assistant that verifies green actions for waste sorting.
Analyze this image/video and determine if it shows proper waste sorting activity.

VERIFICATION CRITERIA FOR GREEN WASTE:
1. For ORGANIC_WASTE: Look for food waste, plant materials, biodegradable items being sorted into a designated container
2. For INORGANIC_RECYCLE: Look for plastic, paper, metal, glass being sorted into separate recycling containers
3. For HAZARDOUS_WASTE: Look for batteries, lamps, paint cans, expired medicine being placed in a special hazardous waste container

IMPORTANT CHECKS:
- Multiple waste bins/containers visible (minimum 2 for organic/inorganic, special container for hazardous)
- Clear visibility of waste items being sorted
- Person actively sorting (if video) or sorted result (if image)
- Proper labeling or color-coded bins (green for organic, yellow/blue for recyclables, red for hazardous)

Respond in this exact JSON format:
{
  "score": <number 0-100>,
  "labels": ["list", "of", "detected", "objects"],
  "categoryMatch": <true/false>,
  "feedback": "<feedback message in Indonesian for the user>",
  "detectedItems": {
    "wasteTypes": ["list of waste types detected"],
    "containers": ["types of containers/bins detected"],
    "sortingActivity": <true/false>
  }
}`,

    [GreenActionCategory.GREEN_HOME]: `You are an AI assistant that verifies green actions for planting and green areas.
Analyze this image/video and determine if it shows green home activities.

VERIFICATION CRITERIA FOR GREEN HOME:
1. For PLANT_TREE: Look for tree/plant planting activity, soil digging, seedlings, watering
2. For URBAN_FARMING: Look for vegetable plants in pots, hydroponics setup, urban garden
3. For GREEN_CORNER: Look for a dedicated green space with multiple plants at home

IMPORTANT CHECKS:
- Visible plants, seedlings, or gardening materials
- Signs of planting activity (soil, pots, gardening tools)
- Before-after comparison if available (bonus points)
- Indoor or outdoor green space setup

Respond in this exact JSON format:
{
  "score": <number 0-100>,
  "labels": ["list", "of", "detected", "objects"],
  "categoryMatch": <true/false>,
  "feedback": "<feedback message in Indonesian for the user>",
  "detectedItems": {
    "plants": ["types of plants detected"],
    "gardeningItems": ["pots", "soil", "tools", etc.],
    "plantingActivity": <true/false>,
    "isBeforeAfter": <true/false>
  }
}`,

    [GreenActionCategory.GREEN_CONSUMPTION]: `You are an AI assistant that verifies green consumption actions.
Analyze this image/video and determine if it shows eco-friendly consumption behavior.

VERIFICATION CRITERIA FOR GREEN CONSUMPTION:
1. For ORGANIC_PRODUCT: Look for organic products, eco-friendly packaging, UMKM products
2. For REFILL_STATION: Look for refill station shopping, bulk store items, no-plastic packaging
3. For REUSABLE_ITEMS: Look for reusable bags, tumblers, containers being used

IMPORTANT CHECKS:
- Visible organic/eco-friendly products or packaging
- UMKM store logo or name (for bonus points)
- Reusable bags, containers, or tumblers
- No single-use plastic visible

Respond in this exact JSON format:
{
  "score": <number 0-100>,
  "labels": ["list", "of", "detected", "objects"],
  "categoryMatch": <true/false>,
  "feedback": "<feedback message in Indonesian for the user>",
  "detectedItems": {
    "products": ["organic/eco-friendly products detected"],
    "reusableItems": ["reusable items detected"],
    "umkmDetected": <true/false>,
    "umkmName": "<name if detected or null>"
  }
}`,

    [GreenActionCategory.GREEN_COMMUNITY]: `You are an AI assistant that verifies community green actions.
Analyze this image/video and determine if it shows collective green activities.

VERIFICATION CRITERIA FOR GREEN COMMUNITY:
1. For COMMUNITY_CLEANUP: Look for group cleanup activities, collected trash, cleaning tools
2. For RIVER_CLEANUP: Look for river/water body cleaning, collected debris
3. For CAR_FREE_DAY: Look for car-free day activities, cycling, walking, green events
4. For OTHER_COLLECTIVE: Look for other group environmental activities

IMPORTANT CHECKS:
- Multiple people participating (if visible)
- Cleaning tools, collected waste, or environmental activity evidence
- Community setting (public spaces, rivers, streets)
- Signs or banners indicating organized event (bonus)

Respond in this exact JSON format:
{
  "score": <number 0-100>,
  "labels": ["list", "of", "detected", "objects"],
  "categoryMatch": <true/false>,
  "feedback": "<feedback message in Indonesian for the user>",
  "detectedItems": {
    "participants": <estimated number or "multiple">,
    "cleanupEvidence": ["collected trash", "cleaning tools", etc.],
    "location": "<type of location>",
    "isOrganizedEvent": <true/false>
  }
}`,
  };

  /**
   * Inject required services
   * @param {GreenWasteAiRepository} repository - Green action repository
   * @param {GoogleGenAiService} genAiService - Google Gen AI service
   * @param {CloudinaryService} cloudinaryService - Cloudinary upload service
   */
  constructor(
    private readonly repository: GreenWasteAiRepository,
    private readonly genAiService: GoogleGenAiService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Submit a new green action with media for AI verification
   * @param {string} userId - User ID
   * @param {CreateGreenActionDto} dto - Action creation data
   * @param {Express.Multer.File} file - Media file (image/video)
   * @returns {Promise<IGreenActionResponse>} Created and verified green action
   */
  async submitAction(
    userId: string,
    dto: CreateGreenActionDto,
    file: Express.Multer.File,
  ): Promise<IGreenActionResponse> {
    this.logger.log(`Submitting green action for user ${userId}`);

    /**
     * Validate file type and determine media type
     */
    const mediaType = this.getMediaType(file.mimetype);

    /**
     * Upload media to Cloudinary
     */
    const uploadResult =
      mediaType === GreenActionMediaType.IMAGE
        ? await this.cloudinaryService.uploadActionProof(file)
        : await this.cloudinaryService.uploadActionVideo(file);

    this.logger.log(`Media uploaded to Cloudinary: ${uploadResult.url}`);

    /**
     * Run AI verification on the media
     */
    const aiResult = await this.verifyWithAi(
      file.buffer,
      file.mimetype,
      dto.category,
      dto.subCategory,
      dto.description,
    );

    /**
     * Calculate final points based on AI score
     */
    const { points, status } = this.calculatePointsAndStatus(
      aiResult.score,
      dto.category,
      dto.subCategory,
    );

    /**
     * Create green action in database
     */
    const greenAction = await this.repository.create({
      userId,
      category: dto.category,
      description: dto.description,
      mediaUrl: uploadResult.url,
      mediaType,
      status,
      aiScore: aiResult.score,
      aiFeedback: aiResult.feedback,
      aiLabels: JSON.stringify(aiResult.labels),
      points,
    });

    /**
     * Update user total points if action is verified
     */
    if (status === GreenActionStatus.VERIFIED) {
      await this.repository.updateUserPoints(userId, points);
      this.logger.log(`User ${userId} earned ${points} points`);
    }

    return this.mapToResponse(greenAction);
  }

  /**
   * Get user's green actions with pagination and filters
   * @param {string} userId - User ID
   * @param {QueryGreenActionDto} query - Query parameters
   * @returns {Promise<IPaginatedResult<IGreenActionResponse>>} Paginated green actions
   */
  async getUserActions(
    userId: string,
    query: QueryGreenActionDto,
  ): Promise<IPaginatedResult<IGreenActionResponse>> {
    const result = await this.repository.findByUserId(userId, query);

    return {
      data: result.data.map((action) => this.mapToResponse(action)),
      meta: result.meta,
    };
  }

  /**
   * Get all green actions (admin only)
   * @param {QueryGreenActionDto} query - Query parameters
   * @returns {Promise<IPaginatedResult<IGreenActionResponse>>} Paginated green actions
   */
  async getAllActions(
    query: QueryGreenActionDto,
  ): Promise<IPaginatedResult<IGreenActionResponse>> {
    const result = await this.repository.findAll(query);

    return {
      data: result.data.map((action) => this.mapToResponse(action)),
      meta: result.meta,
    };
  }

  /**
   * Get a single green action by ID
   * @param {string} id - Green action ID
   * @param {string} userId - User ID (for ownership check)
   * @param {boolean} isAdmin - Whether the requester is admin
   * @returns {Promise<IGreenActionResponse>} Green action details
   */
  async getActionById(
    id: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<IGreenActionResponse> {
    const action = await this.repository.findById(id);

    if (!action) {
      throw new NotFoundException('Green action not found');
    }

    /**
     * Check ownership if not admin
     */
    if (!isAdmin && action.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this action',
      );
    }

    return this.mapToResponse(action);
  }

  /**
   * Delete a green action
   * @param {string} id - Green action ID
   * @param {string} userId - User ID (for ownership check)
   * @param {boolean} isAdmin - Whether the requester is admin
   * @returns {Promise<void>}
   */
  async deleteAction(
    id: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    const action = await this.repository.findById(id);

    if (!action) {
      throw new NotFoundException('Green action not found');
    }

    /**
     * Check ownership if not admin
     */
    if (!isAdmin && action.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this action',
      );
    }

    /**
     * Deduct points if action was verified
     */
    if (action.status === GreenActionStatus.VERIFIED && action.points > 0) {
      await this.repository.updateUserPoints(userId, -action.points);
    }

    await this.repository.delete(id);
    this.logger.log(`Green action ${id} deleted`);
  }

  /**
   * Get user's green action statistics
   * @param {string} userId - User ID
   * @returns {Promise<IUserGreenActionStats>} User statistics
   */
  async getUserStats(userId: string): Promise<IUserGreenActionStats> {
    return this.repository.getUserStats(userId);
  }

  /**
   * Re-verify a green action (admin or retry)
   * @param {string} id - Green action ID
   * @param {string} userId - User ID
   * @returns {Promise<IGreenActionResponse>} Updated green action
   */
  async retryVerification(
    id: string,
    userId: string,
  ): Promise<IGreenActionResponse> {
    const action = await this.repository.findByIdAndUserId(id, userId);

    if (!action) {
      throw new NotFoundException('Green action not found');
    }

    if (action.status === GreenActionStatus.VERIFIED) {
      throw new BadRequestException('This action is already verified');
    }

    /**
     * Note: For retry, we would need to re-download the media from Cloudinary
     * This is a simplified version that just returns the current action
     * In production, you might want to implement media re-analysis
     */
    this.logger.log(`Retry verification requested for action ${id}`);

    return this.mapToResponse(action);
  }

  /**
   * Verify media content with AI
   * @param {Buffer} mediaBuffer - Media file buffer
   * @param {string} mimeType - MIME type of the media
   * @param {GreenActionCategory} category - Selected category
   * @param {string} subCategory - Selected sub-category
   * @param {string} description - Optional user description
   * @returns {Promise<IAiAnalysisResult>} AI analysis result
   */
  private async verifyWithAi(
    mediaBuffer: Buffer,
    mimeType: string,
    category: GreenActionCategory,
    subCategory: string,
    description?: string,
  ): Promise<IAiAnalysisResult> {
    try {
      /**
       * Build the prompt with category-specific instructions
       */
      const basePrompt = this.AI_PROMPTS[category];
      const fullPrompt = `${basePrompt}

SUB-CATEGORY: ${subCategory}
${description ? `USER DESCRIPTION: ${description}` : ''}

Analyze the provided media and respond with the JSON format specified above.`;

      /**
       * Convert buffer to base64
       */
      const base64Data = this.genAiService.bufferToBase64(mediaBuffer);

      /**
       * Call AI service
       */
      const response = await this.genAiService.generateFromTextAndMedia(
        fullPrompt,
        [
          {
            mimeType: mimeType as MediaType,
            data: base64Data,
          },
        ],
      );

      if (!response.success) {
        this.logger.error(`AI verification failed: ${response.error}`);
        return this.getDefaultAiResult(
          'AI verification failed. Please try again.',
        );
      }

      /**
       * Parse AI response
       */
      return this.parseAiResponse(response.text, category);
    } catch (error) {
      this.logger.error('Error during AI verification', error);
      return this.getDefaultAiResult(
        'An error occurred during verification. Please try again.',
      );
    }
  }

  /**
   * Parse AI response JSON
   * @param {string} responseText - Raw AI response text
   * @param {GreenActionCategory} _category - Action category (reserved for future use)
   * @returns {IAiAnalysisResult} Parsed AI result
   */
  private parseAiResponse(
    responseText: string,
    _category: GreenActionCategory,
  ): IAiAnalysisResult {
    try {
      /**
       * Extract JSON from response (handle markdown code blocks)
       */
      let jsonStr = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);

      return {
        success: true,
        score: Math.min(100, Math.max(0, parsed.score || 0)),
        labels: parsed.labels || [],
        categoryMatch: parsed.categoryMatch || false,
        feedback: parsed.feedback || 'Verification completed.',
        points: 0,
        status: GreenActionStatus.PENDING,
        rawResponse: responseText,
      };
    } catch {
      this.logger.warn('Failed to parse AI response, using defaults');
      return this.getDefaultAiResult(
        'Could not parse verification result. Please try again.',
      );
    }
  }

  /**
   * Get default AI result for error cases
   * @param {string} feedback - Error feedback message
   * @returns {IAiAnalysisResult} Default AI result
   */
  private getDefaultAiResult(feedback: string): IAiAnalysisResult {
    return {
      success: false,
      score: 0,
      labels: [],
      categoryMatch: false,
      feedback,
      points: 0,
      status: GreenActionStatus.NEEDS_IMPROVEMENT,
    };
  }

  /**
   * Calculate points and status based on AI score
   * @param {number} aiScore - AI confidence score
   * @param {GreenActionCategory} category - Action category
   * @param {string} subCategory - Action sub-category
   * @returns {{ points: number; status: GreenActionStatus }} Calculated points and status
   */
  private calculatePointsAndStatus(
    aiScore: number,
    category: GreenActionCategory,
    subCategory: string,
  ): { points: number; status: GreenActionStatus } {
    const categoryCriteria = this.POINTS_CRITERIA[category];
    const subCategoryCriteria = categoryCriteria?.[subCategory] || {
      basePoints: 30,
      minScore: 60,
    };

    /**
     * Determine status and points based on score thresholds
     */
    if (aiScore >= 80) {
      return {
        points: subCategoryCriteria.basePoints,
        status: GreenActionStatus.VERIFIED,
      };
    } else if (aiScore >= subCategoryCriteria.minScore) {
      return {
        points: Math.floor(subCategoryCriteria.basePoints * 0.6),
        status: GreenActionStatus.VERIFIED,
      };
    } else if (aiScore >= 40) {
      return {
        points: 0,
        status: GreenActionStatus.NEEDS_IMPROVEMENT,
      };
    } else {
      return {
        points: 0,
        status: GreenActionStatus.REJECTED,
      };
    }
  }

  /**
   * Determine media type from MIME type
   * @param {string} mimeType - MIME type of the file
   * @returns {GreenActionMediaType} Media type enum
   */
  private getMediaType(mimeType: string): GreenActionMediaType {
    if (mimeType.startsWith('image/')) {
      return GreenActionMediaType.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return GreenActionMediaType.VIDEO;
    }
    throw new BadRequestException(
      'Invalid file type. Only images and videos are allowed.',
    );
  }

  /**
   * Map database entity to response interface
   * @param {any} action - Database green action entity
   * @returns {IGreenActionResponse} Mapped response
   */
  private mapToResponse(action: any): IGreenActionResponse {
    return {
      id: action.id,
      userId: action.user_id,
      category: action.category,
      description: action.description,
      mediaUrl: action.media_url,
      mediaType: action.media_type,
      status: action.status,
      aiScore: action.ai_score,
      aiFeedback: action.ai_feedback,
      aiLabels: action.ai_labels,
      points: action.points,
      createdAt: action.created_at,
      updatedAt: action.updated_at,
    };
  }
}
