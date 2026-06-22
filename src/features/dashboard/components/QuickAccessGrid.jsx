/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\dashboard\components\QuickAccessGrid.jsx
 */
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

/**
 * QUICK_ACCESS_ITEMS — constant config, dễ mở rộng sau này
 */
const QUICK_ACCESS_ITEMS = [
  { icon: 'lucide:search',        label: 'Tìm kiếm', path: '/catalog',    color: 'var(--primary)' },
  { icon: 'lucide:book-open',     label: 'Tạp chí',  path: '/catalog',    color: '#6366f1' },
  { icon: 'lucide:globe',         label: 'Địa lý',   path: '/geography',  color: '#0ea5e9' },
  { icon: 'lucide:trophy',        label: 'Leaderboard', path: '/authors', color: '#f59e0b' },
];

/**
 * QuickAccessGrid — 4 card điều hướng nhanh
 */
export default function QuickAccessGrid() {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-3 p-4"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <Icon icon="lucide:zap" width={16} style={{ color: 'var(--primary)' }} />
        <span className="font-display fw-bold text-main" style={{ fontSize: '0.9rem' }}>
          ⚡ Truy cập nhanh
        </span>
      </div>

      {/* Grid */}
      <div className="row g-3">
        {QUICK_ACCESS_ITEMS.map((item) => (
          <div className="col-6 col-md-3" key={item.label}>
            <button
              className="w-100 border-0 rounded-3 d-flex flex-column align-items-center justify-content-center gap-2 py-3 px-2"
              onClick={() => navigate(item.path)}
              style={{
                backgroundColor: 'var(--bg-section)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minHeight: 80,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = `${item.color}15`;
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'var(--bg-section)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 36, height: 36, backgroundColor: `${item.color}18`, color: item.color }}
              >
                <Icon icon={item.icon} width={18} />
              </div>
              <span className="text-main fw-semibold" style={{ fontSize: '0.78rem' }}>
                {item.label}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
