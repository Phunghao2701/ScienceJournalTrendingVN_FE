// Các giá trị status hợp lệ - khớp với enum status của Article (API thật)
const ARTICLE_REVIEW_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  IN_REVIEW: 'IN_REVIEW',
  REVISION_REQUIRED: 'REVISION_REQUIRED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
};

// Map status -> { label hiển thị, className để style badge }
const ARTICLE_REVIEW_STATUS_STYLE = {
  [ARTICLE_REVIEW_STATUS.DRAFT]: {
    label: 'Draft',
    className: 'status-badge--archived', // xám - chưa submit
  },
  [ARTICLE_REVIEW_STATUS.SUBMITTED]: {
    label: 'Submitted',
    className: 'status-badge--in-prep', // cam nhạt - chờ xử lý
  },
  [ARTICLE_REVIEW_STATUS.IN_REVIEW]: {
    label: 'Peer Review',
    className: 'status-badge--in-prep', // cam nhạt - đang xử lý (giống ảnh Figma "PEER REVIEW")
  },
  [ARTICLE_REVIEW_STATUS.REVISION_REQUIRED]: {
    label: 'Revision Required',
    className: 'status-badge--revision', // đỏ nhạt - cần chỉnh sửa
  },
  [ARTICLE_REVIEW_STATUS.ACCEPTED]: {
    label: 'Accepted',
    className: 'status-badge--published', // xanh - tích cực
  },
  [ARTICLE_REVIEW_STATUS.REJECTED]: {
    label: 'Rejected',
    className: 'status-badge--revision', // đỏ nhạt - tiêu cực
  },
  [ARTICLE_REVIEW_STATUS.PUBLISHED]: {
    label: 'Published',
    className: 'status-badge--published', // xanh - hoàn tất
  },
};

// Danh sách option cho dropdown "Update Status" trong Review Status Panel.
// Lấy trực tiếp từ ARTICLE_REVIEW_STATUS_STYLE để label luôn đồng bộ với badge.
const ARTICLE_STATUS_OPTIONS = Object.entries(ARTICLE_REVIEW_STATUS_STYLE).map(
  ([value, { label }]) => ({ value, label })
);

export { ARTICLE_REVIEW_STATUS, ARTICLE_REVIEW_STATUS_STYLE, ARTICLE_STATUS_OPTIONS };