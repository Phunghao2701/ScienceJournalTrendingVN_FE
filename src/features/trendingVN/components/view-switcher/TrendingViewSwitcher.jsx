/**
 * File: src/features/trendingVN/components/view-switcher/TrendingViewSwitcher.jsx
 *
 * Tab switcher "Table | List | Analysis" hien thi giua filter bar va noi dung.
 * Khi chon "Analysis" -> hien thi charts, treemap, keyword cloud, trend momentum.
 * Khi chon "Table" / "List" -> hien thi TrendingArticleTable.
 *
 * Props:
 * - activeView: string          -- View dang active: 'table' | 'list' | 'analysis'
 * - onViewChange: function      -- Callback(viewKey) khi doi tab
 */

import Icon from '../../../../shared/components/Icon';
import './TrendingViewSwitcher.css';

// ── Danh sach tab theo mau ──────────────────────────────────────────────────
const VIEW_TABS = [
  { key: 'table',    icon: 'lucide:table',      label: 'Table'    },
  { key: 'list',     icon: 'lucide:list',        label: 'List'     },
  { key: 'analysis', icon: 'lucide:bar-chart-2', label: 'Analysis' },
];

export default function TrendingViewSwitcher({ activeView = 'analysis', onViewChange }) {
  return (
    <div className="tvs-bar">
      {VIEW_TABS.map((tab) => (
        <button
          key={tab.key}
          className={'tvs-tab' + (activeView === tab.key ? ' tvs-tab--active' : '')}
          onClick={() => onViewChange?.(tab.key)}
          aria-pressed={activeView === tab.key}
        >
          <Icon icon={tab.icon} width="14" className="tvs-tab-icon" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
