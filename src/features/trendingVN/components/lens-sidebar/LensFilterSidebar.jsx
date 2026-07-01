/**
 * File: src/features/trendingVN/components/lens-sidebar/LensFilterSidebar.jsx
 *
 * Sidebar trai kieu Lens.org dung chung cho TrendingVNPage va TrendingPage.
 * Gom 2 phan:
 *   1. Icon rail hep (48px) - cac nut chuc nang
 *   2. Expanded drawer (280px) - hien khi chon tab filter / profile / info
 *
 * Props:
 * - activeTab: string | null     -- Tab dang mo: 'filters' | 'profile' | 'info' | null
 * - onTabChange: function         -- Callback(tabKey) khi bam icon; null = dong drawer
 * - user: object | null           -- Thong tin nguoi dung hien tai (tu authStore)
 * - onNavigate: function          -- Callback(path) de navigate ma khong phu thuoc hook
 * - onSaveQuery: function         -- Callback mo modal Save Query
 * - onExport: function            -- Callback mo modal Export
 * - onClearSearch: function       -- Callback xoa bo loc / tim kiem
 * - onToggleGrouping: function    -- Callback bat/tat che do nhom bai bao
 * - onToggleCustomise: function   -- Callback bat/tat panel Customise
 */

import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';
import Icon from '../../../../shared/components/Icon';
import './LensFilterSidebar.css';

// ─── Helper: lay chu viet tat tu ten (VD: "Nguyen Van A" -> "NA") ─────────────
function getInitials(name) {
  if (!name) return 'TM';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Danh sach cac muc trong tab Filters ──────────────────────────────────────
const FILTER_ITEMS = [
];

// ─── Danh sach muc trong tab Work Area ────────────────────────────────────────
const WORK_AREA_ITEMS = [
  { key: 'sbSavedQueries',   icon: 'lucide:save',      path: '/dashboard' },
  { key: 'sbSearchHistory',  icon: 'lucide:search'                        },
  { key: 'sbCollections',    icon: 'lucide:folder'                        },
  { key: 'sbDashboards',     icon: 'lucide:bar-chart-2'                   },
  { key: 'sbNotes',          icon: 'lucide:file-text'                     },
  { key: 'sbTags',           icon: 'lucide:tag'                           },
  { key: 'sbInventorship',   icon: 'lucide:award'                         },
  { key: 'sbAuthorship',     icon: 'lucide:users'                         },
  { key: 'sbNotifications',  icon: 'lucide:bell'                          },
  { key: 'sbMediaLibrary',   icon: 'lucide:image'                         },
  { key: 'sbSettings',       icon: 'lucide:settings',  path: '/profile'   },
];

// ─── Danh sach goi y trong tab Info ───────────────────────────────────────────
const SUGGESTION_ITEMS = [
  { key: 'sbCreateCollection',  descKey: 'sbCreateCollectionDesc',  icon: 'lucide:folder-plus'  },
  { key: 'sbSaveQuery',         descKey: 'sbSaveQueryDesc',         icon: 'lucide:save'         },
  { key: 'sbExportResults',     descKey: 'sbExportResultsDesc',     icon: 'lucide:download'     },
];

export default function LensFilterSidebar({
  activeTab = null,
  onTabChange,
  user = null,
  onNavigate,
  onSaveQuery,
  onExport,
  onClearSearch,
  onToggleGrouping,
  onToggleCustomise,
}) {
  const { t } = useTranslation();

  // ── Xu ly click item trong Filter list ──────────────────────────────────────
  const handleFilterItemClick = (key) => {
    switch (key) {
      case 'flags':        onClearSearch?.();        break;
      case 'docFamily':    onToggleGrouping?.();     break;
      case 'queryTools':   onToggleCustomise?.();    break;
      case 'newSearch':    onClearSearch?.();        break;
      default:             break;
    }
  };

  // ── Xu ly click item trong Work Area list ───────────────────────────────────
  const handleWorkAreaClick = (item) => {
    if (item.path) onNavigate?.(item.path);
  };

  // ── Xu ly click goi y (Info tab) ────────────────────────────────────────────
  const handleSuggestionClick = (key) => {
    switch (key) {
      case 'sbSaveQuery':       onSaveQuery?.();  break;
      case 'sbExportResults':   onExport?.();     break;
      default:                  break;
    }
  };

  return (
    <div className="lfs-wrapper">

      {/* ── Icon Rail hep (48px) ─────────────────────────────────────────── */}
      <aside className="lfs-icon-rail">

        {/* Nut home hoac back */}
        {activeTab ? (
          <button
            className="lfs-rail-btn active"
            title={t('close')}
            onClick={() => onTabChange(null)}
          >
            <Icon icon="lucide:chevron-left-circle" width="18" />
          </button>
        ) : (
          <button
            className="lfs-rail-btn"
            title={t('home')}
            onClick={() => onNavigate?.('/')}
          >
            <Icon icon="lucide:home" width="18" />
          </button>
        )}

        {/* Nut back/forward */}
        <button
          className={'lfs-rail-btn' + (!activeTab ? ' active' : '')}
          title={t('articleSearch')}
          onClick={() => onTabChange(null)}
        >
          <Icon icon="lucide:chevron-right" width="18" />
        </button>

        {/* Nut Filters */}
        <button
          className={'lfs-rail-btn' + (activeTab === 'filters' ? ' active' : '')}
          title={t('filtersLabel')}
          onClick={() => onTabChange(activeTab === 'filters' ? null : 'filters')}
        >
          <Icon icon="lucide:filter" width="18" />
        </button>

        {/* Nut Work Area / Profile */}
        <button
          className={'lfs-rail-btn' + (activeTab === 'profile' ? ' active' : '')}
          title={t('sbWorkArea')}
          onClick={() => onTabChange(activeTab === 'profile' ? null : 'profile')}
        >
          <Icon icon="lucide:user-cog" width="18" />
        </button>

        {/* Nut Info / Support */}
        <button
          className={'lfs-rail-btn' + (activeTab === 'info' ? ' active' : '')}
          title={t('info')}
          onClick={() => onTabChange(activeTab === 'info' ? null : 'info')}
        >
          <Icon icon="lucide:info" width="18" />
        </button>

        {/* Nut More */}
        <button
          className={'lfs-rail-btn' + (activeTab === 'more' ? ' active' : '')}
          title={t('more')}
          onClick={() => onTabChange(activeTab === 'more' ? null : 'more')}
        >
          <Icon icon="lucide:more-horizontal" width="18" />
        </button>

      </aside>

      {/* ── Expanded Drawer (280px) — hien khi co activeTab ─────────────── */}
      {activeTab && (
        <aside className="lfs-expanded-drawer">

          {/* ══ TAB: FILTERS ══════════════════════════════════════════════ */}
          {activeTab === 'filters' && (
            <div className="lfs-drawer-content">
              <div className="lfs-drawer-header">
                <span className="lfs-drawer-title">{t('sbFilters')}</span>
                <Icon
                  icon="lucide:info"
                  width="14"
                  style={{ color: '#ef6c00', cursor: 'pointer' }}
                />
              </div>
              <div className="lfs-drawer-scrollable">
                {FILTER_ITEMS.map((item) => (
                  <div
                    key={item.key}
                    className="lfs-drawer-item"
                    onClick={() => handleFilterItemClick(item.key)}
                  >
                    <Icon icon={item.icon} width="16" className="lfs-item-icon" />
                    <span className="lfs-item-label">{t(item.key)}</span>
                    <Icon icon="lucide:chevron-right" width="12" className="lfs-item-arrow" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ TAB: PROFILE / WORK AREA ══════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div className="lfs-drawer-content">

              {/* Block thong tin nguoi dung */}
              <div className="lfs-profile-block">
                <div className="lfs-profile-avatar">
                  {getInitials(user?.name)}
                </div>
                <div className="lfs-profile-info">
                  <div className="lfs-profile-name">
                    {user?.name || user?.username || 'Tri Minh'}
                  </div>
                  <div className="lfs-profile-subtitle">
                    {t('personalAccount')}
                    <span className="lfs-profile-subtitle-note">
                      ({t('notCommercialUse')})
                    </span>
                  </div>
                </div>
                <Icon icon="lucide:chevron-down" width="16" className="lfs-profile-chevron" />
              </div>

              {/* Actions: New Item + Search */}
              <div className="lfs-profile-actions">
                <Dropdown className="flex-fill">
                  <Dropdown.Toggle
                    variant="outline-primary"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-between"
                    style={{ fontSize: '0.75rem', fontWeight: 600, height: 30 }}
                  >
                    {t('sbNewItem')}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ fontSize: '0.75rem' }}>
                    <Dropdown.Item onClick={() => onSaveQuery?.()}>
                      {t('saveAsQuery')}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => onExport?.()}>
                      {t('export')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown className="flex-fill">
                  <Dropdown.Toggle
                    variant="primary"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-between"
                    style={{ fontSize: '0.75rem', fontWeight: 600, height: 30 }}
                  >
                    {t('sbSearch')}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ fontSize: '0.75rem' }}>
                    <Dropdown.Item onClick={() => onClearSearch?.()}>
                      {t('sortDateNewest')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              {/* Section title */}
              <div className="lfs-section-title">{t('sbWorkArea')}</div>

              {/* Danh sach muc Work Area */}
              <div className="lfs-drawer-scrollable">
                {WORK_AREA_ITEMS.map((item) => (
                  <div
                    key={item.key}
                    className="lfs-drawer-item"
                    onClick={() => handleWorkAreaClick(item)}
                  >
                    <Icon icon={item.icon} width="16" className="lfs-item-icon" />
                    <span className="lfs-item-label">{t(item.key)}</span>
                    <Icon icon="lucide:chevron-right" width="12" className="lfs-item-arrow" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ TAB: INFO / SUPPORT ═══════════════════════════════════════ */}
          {activeTab === 'info' && (
            <div className="lfs-drawer-content">
              <div className="lfs-drawer-header">
                <span className="lfs-drawer-title">{t('sbSupport')}</span>
              </div>

              <div className="lfs-support-desc">{t('sbSupportDesc')}</div>

              <div className="lfs-section-title">{t('sbSuggestions')}</div>

              <div className="lfs-drawer-scrollable">
                {SUGGESTION_ITEMS.map((item) => (
                  <div
                    key={item.key}
                    className="lfs-suggestion-item"
                    onClick={() => handleSuggestionClick(item.key)}
                  >
                    <div className="lfs-suggestion-icon">
                      <Icon icon={item.icon} width="16" />
                    </div>
                    <div className="lfs-suggestion-info">
                      <div className="lfs-suggestion-title">{t(item.key)}</div>
                      <div className="lfs-suggestion-desc">{t(item.descKey)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </aside>
      )}

    </div>
  );
}
