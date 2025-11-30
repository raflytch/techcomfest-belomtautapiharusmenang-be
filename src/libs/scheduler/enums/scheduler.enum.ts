/**
 * @fileoverview Scheduler enums
 * @description Enum definitions for scheduler module
 */

/**
 * Indonesia timezone enum
 * @description Three timezone regions in Indonesia
 * - WIB (Waktu Indonesia Barat): UTC+7 (Jakarta, Bandung, Surabaya)
 * - WITA (Waktu Indonesia Tengah): UTC+8 (Makassar, Bali, Pontianak)
 * - WIT (Waktu Indonesia Timur): UTC+9 (Jayapura, Ambon, Manokwari)
 */
export enum IndonesiaTimezone {
  WIB = 'WIB',
  WITA = 'WITA',
  WIT = 'WIT',
}

/**
 * Timezone mapping to IANA timezone identifiers
 * @description Maps Indonesia timezone abbreviations to IANA identifiers
 */
export const TIMEZONE_MAPPING = {
  [IndonesiaTimezone.WIB]: 'Asia/Jakarta',
  [IndonesiaTimezone.WITA]: 'Asia/Makassar',
  [IndonesiaTimezone.WIT]: 'Asia/Jayapura',
} as const;
