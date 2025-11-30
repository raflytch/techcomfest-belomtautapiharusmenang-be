/**
 * @fileoverview Create Green Action DTO
 * @description DTO for creating a new green action with AI verification
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  GreenActionCategory,
  GreenCommunitySubCategory,
  GreenConsumptionSubCategory,
  GreenHomeSubCategory,
  GreenWasteSubCategory,
} from '../enums/green-action.enum';

/**
 * DTO for creating a new green action
 * @description Validates input data for green action creation
 */
export class CreateGreenActionDto {
  /**
   * Main category of the green action
   * @example "GREEN_WASTE"
   */
  @ApiProperty({
    description: 'Main category of the green action',
    enum: GreenActionCategory,
    example: GreenActionCategory.GREEN_WASTE,
  })
  @IsNotEmpty({ message: 'Category is required' })
  @IsEnum(GreenActionCategory, { message: 'Invalid green action category' })
  category: GreenActionCategory;

  /**
   * Sub-category of the green action
   * @example "ORGANIC_WASTE"
   */
  @ApiProperty({
    description: 'Sub-category of the green action',
    example: 'ORGANIC_WASTE',
  })
  @IsNotEmpty({ message: 'Sub-category is required' })
  @IsString({ message: 'Sub-category must be a string' })
  subCategory: string;

  /**
   * Optional description of the action
   * @example "I sorted organic and inorganic waste at home"
   */
  @ApiPropertyOptional({
    description: 'Optional description of the action',
    example: 'I sorted organic and inorganic waste at home',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  /**
   * Optional location/district for statistics
   * @example "Kelurahan Menteng"
   */
  @ApiPropertyOptional({
    description: 'Optional location/district for statistics',
    example: 'Kelurahan Menteng',
  })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;
}

/**
 * DTO for Green Waste action creation
 * @description Specific DTO for Green Waste category
 */
export class CreateGreenWasteActionDto extends CreateGreenActionDto {
  /**
   * Sub-category for Green Waste
   */
  @ApiProperty({
    description: 'Sub-category for Green Waste',
    enum: GreenWasteSubCategory,
    example: GreenWasteSubCategory.ORGANIC_WASTE,
  })
  @IsNotEmpty({ message: 'Sub-category is required' })
  @IsEnum(GreenWasteSubCategory, {
    message: 'Invalid Green Waste sub-category',
  })
  declare subCategory: GreenWasteSubCategory;
}

/**
 * DTO for Green Home action creation
 * @description Specific DTO for Green Home category
 */
export class CreateGreenHomeActionDto extends CreateGreenActionDto {
  /**
   * Sub-category for Green Home
   */
  @ApiProperty({
    description: 'Sub-category for Green Home',
    enum: GreenHomeSubCategory,
    example: GreenHomeSubCategory.PLANT_TREE,
  })
  @IsNotEmpty({ message: 'Sub-category is required' })
  @IsEnum(GreenHomeSubCategory, { message: 'Invalid Green Home sub-category' })
  declare subCategory: GreenHomeSubCategory;
}

/**
 * DTO for Green Consumption action creation
 * @description Specific DTO for Green Consumption category
 */
export class CreateGreenConsumptionActionDto extends CreateGreenActionDto {
  /**
   * Sub-category for Green Consumption
   */
  @ApiProperty({
    description: 'Sub-category for Green Consumption',
    enum: GreenConsumptionSubCategory,
    example: GreenConsumptionSubCategory.ORGANIC_PRODUCT,
  })
  @IsNotEmpty({ message: 'Sub-category is required' })
  @IsEnum(GreenConsumptionSubCategory, {
    message: 'Invalid Green Consumption sub-category',
  })
  declare subCategory: GreenConsumptionSubCategory;
}

/**
 * DTO for Green Community action creation
 * @description Specific DTO for Green Community category
 */
export class CreateGreenCommunityActionDto extends CreateGreenActionDto {
  /**
   * Sub-category for Green Community
   */
  @ApiProperty({
    description: 'Sub-category for Green Community',
    enum: GreenCommunitySubCategory,
    example: GreenCommunitySubCategory.COMMUNITY_CLEANUP,
  })
  @IsNotEmpty({ message: 'Sub-category is required' })
  @IsEnum(GreenCommunitySubCategory, {
    message: 'Invalid Green Community sub-category',
  })
  declare subCategory: GreenCommunitySubCategory;
}
