import { VOLUME_STATUS_STYLE } from '../../constants/volumeStatus';
import { ARTICLE_REVIEW_STATUS_STYLE } from '../../constants/articleStatus';

// Combine both status maps into a single lookup table.
// Article statuses are checked first since they cover more cases;
// volume statuses ("published", "in_prep", "archived") use lowercase
// keys and do not overlap with article status keys (UPPERCASE).
const STATUS_STYLE_MAP = {
  ...VOLUME_STATUS_STYLE,
  ...ARTICLE_REVIEW_STATUS_STYLE,
};

export default function StatusBadge({ status }) {
  // Look up label + className by status; safe fallback if status is unknown
  const style = STATUS_STYLE_MAP[status] || {
    label: status,
    className: 'status-badge--archived',
  };

  return <span className={`status-badge ${style.className}`}>{style.label}</span>;
}