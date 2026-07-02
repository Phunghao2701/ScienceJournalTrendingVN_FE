/**
 * Volume status enum and style map.
 *
 * File: src/features/admin/constants/volumeStatus.js
 */

// Valid status string constants -- use these instead of raw strings to prevent typos.
const VOLUME_STATUS = {
  PUBLISHED: 'published', // All issues in the volume have been published.
  IN_PREP: 'in_prep',      // Volume is being prepared; not yet complete.
  ARCHIVED: 'archived',    // Older volume that has been archived.
};

// Maps each status to its display label and badge CSS class.
const VOLUME_STATUS_STYLE = {
  [VOLUME_STATUS.PUBLISHED]: {
    label: 'Published',
    className: 'status-badge--published', // green (Q1-like)
  },
  [VOLUME_STATUS.IN_PREP]: {
    label: 'In Prep',
    className: 'status-badge--in-prep', // light orange (primary-light)
  },
  [VOLUME_STATUS.ARCHIVED]: {
    label: 'Archived',
    className: 'status-badge--archived', // grey (bg-section / text-muted)
  },
};

export { VOLUME_STATUS, VOLUME_STATUS_STYLE };