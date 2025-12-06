/**
 * @fileoverview Query Green Action DTO
 * @description DTO for querying and filtering green actions
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../commons/dto/pagination.dto';
import {
  GreenActionCategory,
  GreenActionStatus,
} from '../enums/green-action.enum';

/**
 * DTO for querying green actions with filters
 * @description Extends PaginationDto with green action specific filters
 */
export class QueryGreenActionDto extends PaginationDto {
  /**
   * Filter by category
   * @example "PILAH_SAMPAH"
   */
  @ApiPropertyOptional({
    description: 'Filter berdasarkan kategori aksi hijau',
    enum: GreenActionCategory,
    example: GreenActionCategory.PILAH_SAMPAH,
  })
  @IsOptional()
  @IsEnum(GreenActionCategory, { message: 'Invalid category' })
  category?: GreenActionCategory;

  /**
   * Filter by verification status
   * @example "VERIFIED"
   */
  @ApiPropertyOptional({
    description: 'Filter by verification status',
    enum: GreenActionStatus,
    example: GreenActionStatus.VERIFIED,
  })
  @IsOptional()
  @IsEnum(GreenActionStatus, { message: 'Invalid status' })
  status?: GreenActionStatus;

  /**
   * Filter by sub-category
   * @example "ORGANIC_WASTE"
   */
  @ApiPropertyOptional({
    description: 'Filter by sub-category',
    example: 'ORGANIC_WASTE',
  })
  @IsOptional()
  @IsString({ message: 'Sub-category must be a string' })
  subCategory?: string;

  /**
   * Filter by district
   * @example "Menteng"
   */
  @ApiPropertyOptional({
    description: 'Filter by district',
    example: 'Menteng',
  })
  @IsOptional()
  @IsString({ message: 'District must be a string' })
  district?: string;

  /**
   * Filter by city
   * @example "Jakarta Pusat"
   */
  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'Jakarta Pusat',
  })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city?: string;
}
