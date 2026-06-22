import Icon from '../../../../shared/components/Icon';

export default function DashboardStatCard({ label, value, icon, note, noteType }) {
  const safeNoteType = noteType || 'neutral';

  return (
    <div className="admin-stat-card">
      {/* Header card: label bên trái, icon bên phải */}
      <div className="admin-stat-card__header">
        <span className="admin-stat-card__label">{label}</span>
        <span className="admin-stat-card__icon">
          <Icon icon={icon} />
        </span>
      </div>

      {/* Giá trị chính - số lớn */}
      <div className="admin-stat-card__value">{value}</div>

      {/* Dòng chú thích nhỏ - màu theo modifier class, không inline style */}
      <div className={`admin-stat-card__note admin-stat-card__note--${safeNoteType}`}>
        {note}
      </div>
    </div>
  );
}