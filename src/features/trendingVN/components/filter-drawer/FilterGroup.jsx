/**
 * FilterGroup: collapsible accordion section used inside FilterDrawer.
 *
 * File: features/trendingVN/components/filter-drawer/FilterGroup.jsx
 *
 * Clicking the header toggles the body. A badge showing activeCount is shown
 * next to the title when the group has at least one active filter.
 *
 * Props:
 * - title: string         -- Section heading text
 * - icon: string          -- Iconify icon key displayed left of the title
 * - isOpen: boolean       -- Whether the body is currently visible
 * - onToggle: function    -- Callback invoked when the header is clicked
 * - activeCount: number   -- Active filter count shown as a badge (0 hides badge)
 * - children: ReactNode   -- Filter controls rendered in the body
 */
import { Icon } from '@iconify/react';

export default function FilterGroup({ title, icon, isOpen, onToggle, activeCount = 0, children }) {
  return (
    <div className="lens-fg-root">
      <button className="lens-fg-header" onClick={onToggle}>
        <Icon icon={icon} width="15" />
        <span style={{ flex: 1, textAlign: 'left' }}>{title}</span>
        {activeCount > 0 && (
          <span className="lens-fg-badge">{activeCount}</span>
        )}
        <Icon icon={isOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'} width="13" />
      </button>
      {isOpen && (
        <div className="lens-fg-body">
          {children}
        </div>
      )}
    </div>
  );
}
