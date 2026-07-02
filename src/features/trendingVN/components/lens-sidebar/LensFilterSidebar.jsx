/**
 * LensFilterSidebar: Lens.org-style left sidebar shared by TrendingVNPage and TrendingPage.
 *
 * File: src/features/trendingVN/components/lens-sidebar/LensFilterSidebar.jsx
 *
 * NOTE: TrendingVNPage does NOT use this component — it renders its own inline sidebar.
 * This component is used only by TrendingPage (the analysis view). The two implementations
 * share the same icon rail + expandable drawer structure (known duplication).
 *
 * Layout:
 *   1. Icon rail (48px wide) -- icon buttons that open/close the drawer
 *   2. Expanded drawer (280px) -- visible when activeTab is non-null
 *      - 'filters' tab: list of filter categories
 *      - 'profile' tab: user info + Work Area links
 *      - 'info' tab: support suggestions
 *
 * Props:
 * - activeTab: string | null     -- Currently open tab: 'filters' | 'profile' | 'info' | null
 * - onTabChange: function        -- Callback(tabKey) when a rail icon is clicked; pass null to close
 * - user: object | null          -- Current user info from authStore
 * - onNavigate: function         -- Callback(path) for navigation without depending on useNavigate
 * - onSaveQuery: function        -- Callback to open the Save Query modal
 * - onExport: function           -- Callback to open the Export modal
 * - onClearSearch: function      -- Callback to clear all filters / search
 * - onToggleGrouping: function   -- Callback to toggle article grouping mode
 * - onToggleCustomise: function  -- Callback to toggle the Customise panel
 */

import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';
import Icon from '../../../../shared/components/Icon';
import './LensFilterSidebar.css';

// Extract initials from a display name (e.g. "Nguyen Van A" -> "NA")
function getInitials(name) {
  if (!name) return 'TM';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Filter category items shown in the Filters tab
const FILTER_ITEMS = [
  { key: 'dateRange',       icon: 'lucide:calendar'    },
  { key: 'flags',           icon: 'lucide:flag'        },
  { key: 'jurisdiction',    icon: 'lucide:map-pin'     },
  { key: 'applicants',      icon: 'lucide:user-check'  },
  { key: 'inventors',       icon: 'lucide:users'       },
  { key: 'owners',          icon: 'lucide:award'       },
  { key: 'agents',          icon: 'lucide:briefcase'   },
  { key: 'legalStatus',     icon: 'lucide:scale'       },
  { key: 'docType',         icon: 'lucide:file-text'   },
  { key: 'citedWorks',      icon: 'lucide:book-open'   },
  { key: 'biologicals',     icon: 'lucide:dna'         },
  { key: 'classifications', icon: 'lucide:list'        },
  { key: 'docFamily',       icon: 'lucide:folder-git-2'},
  { key: 'queryTools',      icon: 'lucide:settings'    },
  { key: 'newSearch',       icon: 'lucide:search'      },
];

// Work Area items shown in the Profile tab
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

// Suggestion items shown in the Info/Support tab
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

  // Handle clicks on filter category items
  const handleFilterItemClick = (key) => {
    switch (key) {
      case 'flags':        onClearSearch?.();        break;
      case 'docFamily':    onToggleGrouping?.();     break;
      case 'queryTools':   onToggleCustomise?.();    break;
      case 'newSearch':    onClearSearch?.();        break;
      default:             break;
    }
  };

  // Handle clicks on Work Area items (navigate if the item has a path)
  const handleWorkAreaClick = (item) => {
    if (item.path) onNavigate?.(item.path);
  };

  // Handle clicks on suggestion items in the Info tab
  const handleSuggestionClick = (key) => {
    switch (key) {
      case 'sbSaveQuery':       onSaveQuery?.();  break;
      case 'sbExportResults':   onExport?.();     break;
      default:                  break;
    }
  };

  return (
    <div className="lfs-wrapper">

      {/* Icon rail (48px wide) */}
      <aside className="lfs-icon-rail">

        {/* Home / back button (shows chevron-left when a tab is open) */}
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

        {/* Article search button */}
        <button
          className={'lfs-rail-btn' + (!activeTab ? ' active' : '')}
          title={t('articleSearch')}
          onClick={() => onTabChange(null)}
        >
          <Icon icon="lucide:chevron-right" width="18" />
        </button>

        {/* Filters tab button */}
        <button
          className={'lfs-rail-btn' + (activeTab === 'filters' ? ' active' : '')}
          title={t('filtersLabel')}
          onClick={() => onTabChange(activeTab === 'filters' ? null : 'filters')}
        >
          <Icon icon="lucide:filter" width="18" />
        </button>

        {/* Profile / Work Area tab button */}
        <button
          className={'lfs-rail-btn' + (activeTab === 'profile' ? ' active' : '')}
          title={t('sbWorkArea')}
          onClick={() => onTabChange(activeTab === 'profile' ? null : 'profile')}
        >
          <Icon icon="lucide:user-cog" width="18" />
        </button>

        {/* Info / Support tab button */}
        <button
          className={'lfs-rail-btn' + (activeTab === 'info' ? ' active' : '')}
          title={t('info')}
          onClick={() => onTabChange(activeTab === 'info' ? null : 'info')}
        >
          <Icon icon="lucide:info" width="18" />
        </button>

        {/* More tab button */}
        <button
          className={'lfs-rail-btn' + (activeTab === 'more' ? ' active' : '')}
          title={t('more')}
          onClick={() => onTabChange(activeTab === 'more' ? null : 'more')}
        >
          <Icon icon="lucide:more-horizontal" width="18" />
        </button>

      </aside>

      {/* Expanded drawer (280px) -- visible when activeTab is non-null */}
      {activeTab && (
        <aside className="lfs-expanded-drawer">

          {/* === TAB: FILTERS === */}
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

          {/* === TAB: PROFILE / WORK AREA === */}
          {activeTab === 'profile' && (
            <div className="lfs-drawer-content">

              {/* User info block: avatar initials + name + account type */}
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

              {/* Work Area item list */}
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

          {/* === TAB: INFO / SUPPORT === */}
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
