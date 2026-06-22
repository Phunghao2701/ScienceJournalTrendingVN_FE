import Icon from '../../../../shared/components/Icon';

// Map file type -> icon Iconify hiển thị ở đầu mỗi dòng file
const FILE_TYPE_ICON = {
  pdf: 'lucide:file-text',
  zip: 'lucide:file-archive',
};

// Map file type -> { icon, label } cho action chính (view với PDF, download với ZIP)
// Theo ảnh Figma: Main_Manuscript.pdf có icon "view" (mắt), High_Res_Figures_Pack.zip có icon "download"
const PRIMARY_ACTION_BY_TYPE = {
  pdf: { icon: 'lucide:eye', label: 'View file' },
  zip: { icon: 'lucide:download', label: 'Download file' },
};

export default function ManuscriptFileItem({ name, type, size, uploadedAt }) {
  const fileIcon = FILE_TYPE_ICON[type] || 'lucide:file';
  const primaryAction = PRIMARY_ACTION_BY_TYPE[type] || PRIMARY_ACTION_BY_TYPE.pdf;

  return (
    <div className="admin-file-item">
      {/* Icon đại diện loại file */}
      <span className="admin-file-item__icon">
        <Icon icon={fileIcon} />
      </span>

      {/* Tên file + thông tin size/ngày upload */}
      <div className="admin-file-item__info">
        <span className="admin-file-item__name">{name}</span>
        <span className="admin-file-item__meta">
          {size} &middot; Uploaded on {uploadedAt}
        </span>
      </div>

      {/* Action buttons: View/Download (theo type) + Replace */}
      <div className="admin-file-item__actions">
        <button type="button" className="admin-table__icon-btn" aria-label={primaryAction.label}>
          <Icon icon={primaryAction.icon} />
        </button>
        <button type="button" className="admin-file-item__replace-btn">
          Replace
        </button>
      </div>
    </div>
  );
}