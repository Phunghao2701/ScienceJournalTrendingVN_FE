// Các giá trị status hợp lệ (dùng để so sánh, tránh gõ sai string trực tiếp)
const VOLUME_STATUS = {
  PUBLISHED: 'published', // Volume đã xuất bản xong toàn bộ issue
  IN_PREP: 'in_prep',      // Volume đang trong quá trình chuẩn bị, chưa hoàn tất
  ARCHIVED: 'archived',    // Volume cũ, đã được lưu trữ
};

// Map status -> { label hiển thị, className để style badge }
const VOLUME_STATUS_STYLE = {
  [VOLUME_STATUS.PUBLISHED]: {
    label: 'Published',
    className: 'status-badge--published', // style xanh (Q1-like)
  },
  [VOLUME_STATUS.IN_PREP]: {
    label: 'In Prep',
    className: 'status-badge--in-prep', // style cam nhạt (primary-light)
  },
  [VOLUME_STATUS.ARCHIVED]: {
    label: 'Archived',
    className: 'status-badge--archived', // style xám (bg-section/text-muted)
  },
};

export { VOLUME_STATUS, VOLUME_STATUS_STYLE };