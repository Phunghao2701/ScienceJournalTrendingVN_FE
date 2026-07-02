/**
 * Article review status enum, style map, and dropdown options.
 *
 * File: src/features/admin/constants/articleStatus.js
 */

// Valid status values -- must match the Article status enum in the backend API.
const ARTICLE_REVIEW_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  IN_REVIEW: 'IN_REVIEW',
  REVISION_REQUIRED: 'REVISION_REQUIRED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
};

// Maps each status to its display label and badge CSS class.
const ARTICLE_REVIEW_STATUS_STYLE = {
  [ARTICLE_REVIEW_STATUS.DRAFT]: {
    label: 'Draft',
    className: 'status-badge--archived', // grey -- not yet submitted
  },
  [ARTICLE_REVIEW_STATUS.SUBMITTED]: {
    label: 'Submitted',
    className: 'status-badge--in-prep', // light orange -- awaiting processing
  },
  [ARTICLE_REVIEW_STATUS.IN_REVIEW]: {
    label: 'Peer Review',
    className: 'status-badge--in-prep', // light orange -- in progress (matches Figma "PEER REVIEW")
  },
  [ARTICLE_REVIEW_STATUS.REVISION_REQUIRED]: {
    label: 'Revision Required',
    className: 'status-badge--revision', // light red -- needs edits
  },
  [ARTICLE_REVIEW_STATUS.ACCEPTED]: {
    label: 'Accepted',
    className: 'status-badge--published', // green -- positive outcome
  },
  [ARTICLE_REVIEW_STATUS.REJECTED]: {
    label: 'Rejected',
    className: 'status-badge--revision', // light red -- negative outcome
  },
  [ARTICLE_REVIEW_STATUS.PUBLISHED]: {
    label: 'Published',
    className: 'status-badge--published', // green -- fully complete
  },
};

// Options for the "Update Status" dropdown in the Review Status Panel.
// Derived from ARTICLE_REVIEW_STATUS_STYLE so labels always stay in sync with badges.
const ARTICLE_STATUS_OPTIONS = Object.entries(ARTICLE_REVIEW_STATUS_STYLE).map(
  ([value, { label }]) => ({ value, label })
);

export { ARTICLE_REVIEW_STATUS, ARTICLE_REVIEW_STATUS_STYLE, ARTICLE_STATUS_OPTIONS };