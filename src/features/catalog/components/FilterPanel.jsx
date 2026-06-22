/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\catalog\components\FilterPanel.jsx
 */
import { Form, Button } from 'react-bootstrap';

export default function FilterPanel({
  subjectAreas = [],
  subjectCategories = [],
  selectedAreas = [],
  selectedCategories = [],
  selectedAccess = [],
  selectedQuartiles = [],
  selectedYear = '',
  selectedZone = '',
  zones = [],
  onAreaSelect,
  onCategorySelect,
  onAccessSelect,
  onQuartileSelect,
  onYearSelect,
  onZoneSelect,
  isOaDiamond = false,
  onOaDiamondToggle,
  onClearAll,
  loading = false
}) {
  const hasSelectedArea = selectedAreas.length > 0;
  const visibleCategories = hasSelectedArea
    ? subjectCategories.filter(cat => selectedAreas.includes(String(cat.subject_area_id)))
    : [];

  const cleanLabel = (value = '') => {
    const parts = String(value).split(';').map(part => part.trim()).filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : value;
  };

  const categoryNameCounts = subjectCategories.reduce((acc, cat) => {
    const label = cleanLabel(cat.display_name);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const getAreaLabel = (areaId) => {
    const area = subjectAreas.find(item => String(item.subject_area_id) === String(areaId));
    return area ? cleanLabel(area.display_name) : '';
  };

  const getCategoryLabel = (cat) => {
    const label = cleanLabel(cat.display_name);
    const isDuplicateName = categoryNameCounts[label] > 1;
    const areaLabel = getAreaLabel(cat.subject_area_id);
    return isDuplicateName && areaLabel ? `${label} (${areaLabel})` : label;
  };

  const accessValue = selectedAccess[0] || 'all';

  // Generate year options: current year down to 2015
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i);

  return (
    <div className="catalog-filter-panel text-start d-flex flex-column gap-3">
      <section className="catalog-surface catalog-filter-surface">
        <div className="d-flex flex-column gap-3">
          <div className="d-flex flex-column flex-xl-row align-items-stretch align-items-xl-center justify-content-between gap-3">
            <div className="d-flex flex-wrap gap-3 flex-grow-1">
              <Form.Select
                value={selectedAreas[0] || 'all'}
                onChange={(e) => onAreaSelect(e.target.value)}
                disabled={loading}
                className="catalog-filter-select"
                style={{ '--catalog-select-width': '260px' }}
              >
                <option value="all">All subject areas</option>
                {subjectAreas.map((area) => (
                  <option key={area.subject_area_id} value={area.subject_area_id} title={area.display_name}>
                    {cleanLabel(area.display_name)}
                  </option>
                ))}
              </Form.Select>

              <Form.Select
                value={selectedCategories[0] || 'all'}
                onChange={(e) => onCategorySelect(e.target.value)}
                disabled={loading || !hasSelectedArea}
                className="catalog-filter-select"
                style={{ '--catalog-select-width': '300px', opacity: hasSelectedArea ? 1 : 0.72 }}
              >
                <option value="all">
                  {hasSelectedArea ? 'All subject categories' : 'Select subject area first'}
                </option>
                {visibleCategories.map((cat) => (
                  <option key={cat.subject_category_id} value={cat.subject_category_id} title={cat.display_name}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </Form.Select>

              <Form.Select
                value={selectedZone || 'all'}
                onChange={(e) => onZoneSelect?.(e.target.value)}
                disabled={loading}
                className="catalog-filter-select"
                style={{ '--catalog-select-width': '170px' }}
              >
                <option value="all">Zone</option>
                {zones.map((zone) => (
                  <option key={zone.zone_id} value={zone.zone_id} title={zone.name}>
                    {zone.name}
                  </option>
                ))}
              </Form.Select>

              <Form.Select
                value={selectedQuartiles[0] || 'all'}
                onChange={(e) => onQuartileSelect(e.target.value)}
                className="catalog-filter-select"
                style={{ '--catalog-select-width': '150px' }}
              >
                <option value="all">All quartiles</option>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </Form.Select>

              <Form.Select
                value={selectedYear || 'all'}
                onChange={(e) => onYearSelect(e.target.value)}
                className="catalog-filter-select"
                style={{ '--catalog-select-width': '120px' }}
              >
                <option value="all">All years</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Form.Select>
            </div>

            <Button
              variant="link"
              onClick={onClearAll}
              className="catalog-clear-btn text-decoration-none px-2 align-self-start align-self-xl-center"
            >
              Clear filters
            </Button>
          </div>

          <div className="d-flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => onAccessSelect(accessValue === 'open_access' ? 'all' : 'open_access')}
              className={`catalog-toggle-chip ${accessValue === 'open_access' ? 'is-active' : ''}`}
            >
              <Form.Check
                type="switch"
                checked={accessValue === 'open_access'}
                readOnly
                className="m-0"
              />
              <span>Only Open Access Journals</span>
            </button>

            <button
              type="button"
              onClick={() => onOaDiamondToggle && onOaDiamondToggle(!isOaDiamond)}
              className={`catalog-toggle-chip ${isOaDiamond ? 'is-active' : ''}`}
            >
              <Form.Check
                type="switch"
                checked={isOaDiamond}
                readOnly
                className="m-0"
              />
              <span>Only OA Diamond</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
