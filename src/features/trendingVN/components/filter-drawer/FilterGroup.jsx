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
