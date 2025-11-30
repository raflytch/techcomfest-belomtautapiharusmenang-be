/**
 * @fileoverview Green Action enums
 * @description Enums for green action categories, sub-categories, and status
 */

/**
 * Green Action main categories
 * @description Main categories for green actions
 */
export enum GreenActionCategory {
  /**
   * Green Waste - Sorting and processing waste
   */
  GREEN_WASTE = 'GREEN_WASTE',

  /**
   * Green Home - Planting trees and green areas
   */
  GREEN_HOME = 'GREEN_HOME',

  /**
   * Green Consumption - Using organic/eco-friendly products
   */
  GREEN_CONSUMPTION = 'GREEN_CONSUMPTION',

  /**
   * Green Community - Collective actions
   */
  GREEN_COMMUNITY = 'GREEN_COMMUNITY',
}

/**
 * Green Waste sub-categories
 * @description Sub-categories for Green Waste actions
 */
export enum GreenWasteSubCategory {
  /**
   * Sorting organic waste
   */
  ORGANIC_WASTE = 'ORGANIC_WASTE',

  /**
   * Sorting recyclable inorganic waste (plastic, paper, metal)
   */
  INORGANIC_RECYCLE = 'INORGANIC_RECYCLE',

  /**
   * Handling hazardous household waste (batteries, lamps, expired medicine)
   */
  HAZARDOUS_WASTE = 'HAZARDOUS_WASTE',
}

/**
 * Green Home sub-categories
 * @description Sub-categories for Green Home actions
 */
export enum GreenHomeSubCategory {
  /**
   * Planting new trees/plants
   */
  PLANT_TREE = 'PLANT_TREE',

  /**
   * Urban farming (vegetables in pots, small hydroponics)
   */
  URBAN_FARMING = 'URBAN_FARMING',

  /**
   * Creating mini green corner at home
   */
  GREEN_CORNER = 'GREEN_CORNER',
}

/**
 * Green Consumption sub-categories
 * @description Sub-categories for Green Consumption actions
 */
export enum GreenConsumptionSubCategory {
  /**
   * Buying organic products
   */
  ORGANIC_PRODUCT = 'ORGANIC_PRODUCT',

  /**
   * Shopping at refill station or bulk store
   */
  REFILL_STATION = 'REFILL_STATION',

  /**
   * Using reusable bags/containers
   */
  REUSABLE_ITEMS = 'REUSABLE_ITEMS',
}

/**
 * Green Community sub-categories
 * @description Sub-categories for Green Community actions
 */
export enum GreenCommunitySubCategory {
  /**
   * Community cleanup activities
   */
  COMMUNITY_CLEANUP = 'COMMUNITY_CLEANUP',

  /**
   * River cleaning activities
   */
  RIVER_CLEANUP = 'RIVER_CLEANUP',

  /**
   * Car free day green activities
   */
  CAR_FREE_DAY = 'CAR_FREE_DAY',

  /**
   * Other collective green actions
   */
  OTHER_COLLECTIVE = 'OTHER_COLLECTIVE',
}

/**
 * Green Action verification status
 * @description Status of AI verification for green actions
 */
export enum GreenActionStatus {
  /**
   * Action is pending verification
   */
  PENDING = 'PENDING',

  /**
   * Action has been verified and approved
   */
  VERIFIED = 'VERIFIED',

  /**
   * Action has been rejected by AI
   */
  REJECTED = 'REJECTED',

  /**
   * Action needs improvement/re-upload
   */
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
}

/**
 * Media type for green action proof
 * @description Type of media uploaded as proof
 */
export enum GreenActionMediaType {
  /**
   * Image proof
   */
  IMAGE = 'IMAGE',

  /**
   * Video proof
   */
  VIDEO = 'VIDEO',
}
