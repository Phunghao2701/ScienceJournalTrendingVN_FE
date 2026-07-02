/**
 * TrendingViewSwitcher: tab bar for switching between Table, List, and Analysis views.
 *
 * File: src/features/trendingVN/components/view-switcher/TrendingViewSwitcher.jsx
 *
 * Displayed between the filter bar and the main content area.
 * Selecting "Analysis" renders charts, treemap, keyword cloud, and trend momentum cards.
 * Selecting "Table" or "List" renders TrendingArticleTable.
 *
 * Props:
 * - activeView: string       -- Active view key: 'table' | 'list' | 'analysis'
 * - onViewChange: function   -- Callback(viewKey) invoked on tab click
 */

import Icon from '../../../../shared/components/Icon';
import './TrendingViewSwitcher.css';

// -- Tab definitions matching the design --
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
