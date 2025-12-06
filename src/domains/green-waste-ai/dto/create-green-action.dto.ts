/**
 * @fileoverview Create Green Action DTO
 * @description DTO for creating a new green action with AI verification
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
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
   * Location name (e.g., landmark, street name)
   * @example "Taman Menteng"
   */
  @ApiPropertyOptional({
    description: 'Location name or landmark',
    example: 'Taman Menteng',
  })
  @IsOptional()
  @IsString({ message: 'Location name must be a string' })
  locationName?: string;

  /**
   * Latitude coordinate for map pinpoint
   * @example -6.2
   */
  @ApiPropertyOptional({
    description: 'Latitude coordinate (-90 to 90)',
    example: -6.2,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  /**
   * Longitude coordinate for map pinpoint
   * @example 106.816666
   */
  @ApiPropertyOptional({
    description: 'Longitude coordinate (-180 to 180)',
    example: 106.816666,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude?: number;

  /**
   * District/Kelurahan for filtering
   * @example "Menteng"
   */
  @ApiPropertyOptional({
    description: 'District or Kelurahan',
    example: 'Menteng',
  })
  @IsOptional()
  @IsString({ message: 'District must be a string' })
  district?: string;

  /**
   * City for broader filtering
   * @example "Jakarta Pusat"
   */
  @ApiPropertyOptional({
    description: 'City name',
    example: 'Jakarta Pusat',
  })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city?: string;
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
