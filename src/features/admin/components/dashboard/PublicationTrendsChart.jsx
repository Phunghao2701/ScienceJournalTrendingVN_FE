const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
import { useTranslation } from 'react-i18next';

// K�ch thu?c & padding c?a v�ng v? SVG - c? d?nh d? t�nh to�n to? d? c?t
const CHART_WIDTH = 600;
const CHART_HEIGHT = 220;
const CHART_PADDING_LEFT = 36; // ch? cho label tr?c Y
const CHART_PADDING_BOTTOM = 28; // ch? cho label th�ng tr?c X

export default function PublicationTrendsChart({
  data = [],
  years = [],
  selectedYear,
  onChangeYear,
  loading = false,
  error = '',
}) {
  const { t } = useTranslation();
  const safeData = Array.isArray(data) ? data : [];

  // T�m gi� tr? l?n nh?t trong data d? t�nh t? l? chi?u cao c?t (scale tr?c Y)
  const maxValue = Math.max(
    ...safeData.map((d) => Math.max(d.manuscripts, d.published)),
    1
  );

  // V�ng v? th?c t? (tr? padding)
  const plotWidth = CHART_WIDTH - CHART_PADDING_LEFT;
  const plotHeight = CHART_HEIGHT - CHART_PADDING_BOTTOM;

  // M?i th�ng chi?m 1 "slot" r?ng b?ng nhau, trong slot c� 2 c?t (submissions + published)
  const slotWidth = safeData.length > 0 ? plotWidth / safeData.length : plotWidth;
  const barWidth = slotWidth * 0.28;
  const barGap = slotWidth * 0.08;

  // H�m chuy?n gi� tr? s? li?u -> chi?u cao c?t (px) theo scale maxValue
  const getBarHeight = (value) => (value / maxValue) * plotHeight;

  return (
    <div className="admin-card admin-trends-card">
      {/* Header card: ti�u d? + year selector */}
      <div className="admin-trends-card__header">
        <div>
          <h3 className="admin-card__title">{t('publicationTrends')}</h3>
          <p className="admin-card__subtitle">{t('publicationTrendsDescription')}</p>
        </div>

        {/* Year selector - select thu?n, style theo bg-chip */}
        <select
          className="admin-year-select"
          value={selectedYear}
          onChange={(e) => onChangeYear(Number(e.target.value))}
          disabled={loading || years.length === 0}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="admin-muted-text mb-0">{t('publicationTrendsLoading')}</p>
      ) : error ? (
        <p className="admin-error-text mb-0">{error}</p>
      ) : safeData.length === 0 ? (
        <p className="admin-muted-text mb-0">{t('publicationTrendsEmpty')}</p>
      ) : (
        <>
          {/* V�ng chart SVG */}
          <div className="admin-trends-card__chart">
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              className="admin-trends-svg"
            >
              {/* �u?ng gridline ngang (3 m?c: 0%, 50%, 100% chi?u cao) - m�u border nh?t */}
              {[0, 0.5, 1].map((ratio) => {
                const y = CHART_PADDING_LEFT === 0 ? 0 : plotHeight * (1 - ratio);
                return (
                  <line
                    key={ratio}
                    x1={CHART_PADDING_LEFT}
                    x2={CHART_WIDTH}
                    y1={y}
                    y2={y}
                    stroke="var(--border)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* V? 2 c?t cho t?ng th�ng */}
              {safeData.map((item, index) => {
                const slotX = CHART_PADDING_LEFT + index * slotWidth;

                const manuscriptsHeight = getBarHeight(item.manuscripts);
                const publishedHeight = getBarHeight(item.published);

                const manuscriptsX = slotX + barGap;
                const publishedX = manuscriptsX + barWidth + barGap;

                // API tr? month d?ng s? (1-12) -> convert sang label vi?t t?t (Jan, Feb...)
                const monthLabel = MONTH_LABELS[item.month - 1] || item.month;

                return (
                  <g key={item.year || item.month}>
                    {/* C?t "manuscripts" (submissions) - m�u x�m section */}
                    <rect
                      x={manuscriptsX}
                      y={plotHeight - manuscriptsHeight}
                      width={barWidth}
                      height={manuscriptsHeight}
                      fill="var(--bg-section)"
                      rx="3"
                    />
                    {/* C?t "published" - m�u cam primary */}
                    <rect
                      x={publishedX}
                      y={plotHeight - publishedHeight}
                      width={barWidth}
                      height={publishedHeight}
                      fill="var(--primary)"
                      rx="3"
                    />
                    {/* Label th�ng du?i m?i nh�m c?t */}
                    <text
                      x={slotX + slotWidth / 2}
                      y={plotHeight + 18}
                      textAnchor="middle"
                      fontSize="11"
                      fill="var(--text-muted)"
                      fontFamily="var(--font-sans)"
                    >
                      {item.year || monthLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend - ch� th�ch m�u c?t */}
          <div className="admin-trends-card__legend">
            <span className="admin-trends-legend-item">
              <span className="admin-trends-legend-dot admin-trends-legend-dot--submissions" />
              {t('submissions')}
            </span>
            <span className="admin-trends-legend-item">
              <span className="admin-trends-legend-dot admin-trends-legend-dot--published" />
              {t('statusPublished')}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
