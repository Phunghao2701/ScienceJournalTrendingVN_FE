/**
 * Centralized browser storage keys for the ResearchPulse FE.
 * Import from here instead of hardcoding key strings in components.
 *
 * WARNING — auth token key inconsistency across the codebase:
 *   STORAGE_KEYS.ACCESS_TOKEN  = 'token'               (this file, canonical)
 *   httpClient.js reads          'accessToken'          (different — legacy key)
 *   api.js / auth.js remove      'researchpulse_token'  (third key, from older branch)
 * These are NOT the same key. If auth state appears stale after logout, check all three.
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'token',
  LANGUAGE: 'researchpulse_lang',
};
