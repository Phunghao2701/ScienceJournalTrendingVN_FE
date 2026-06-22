const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Kích thước & padding của vùng vẽ SVG - cố định để tính toán toạ độ cột
const CHART_WIDTH = 600;
const CHART_HEIGHT = 220;
const CHART_PADDING_LEFT = 36; // chỗ cho label trục Y
const CHART_PADDING_BOTTOM = 28; // chỗ cho label tháng trục X

export default function PublicationTrendsChart({
  data = [],
  years = [],
  selectedYear,
  onChangeYear,
  loading = false,
  error = '',
}) {
  const safeData = Array.isArray(data) ? data : [];

  // Tìm giá trị lớn nhất trong data để tính tỉ lệ chiều cao cột (scale trục Y)
  const maxValue = Math.max(
    ...safeData.map((d) => Math.max(d.manuscripts, d.published)),
    1
  );

  // Vùng vẽ thực tế (trừ padding)
  const plotWidth = CHART_WIDTH - CHART_PADDING_LEFT;
  const plotHeight = CHART_HEIGHT - CHART_PADDING_BOTTOM;

  // Mỗi tháng chiếm 1 "slot" rộng bằng nhau, trong slot có 2 cột (submissions + published)
  const slotWidth = safeData.length > 0 ? plotWidth / safeData.length : plotWidth;
  const barWidth = slotWidth * 0.28;
  const barGap = slotWidth * 0.08;

  // Hàm chuyển giá trị số liệu -> chiều cao cột (px) theo scale maxValue
  const getBarHeight = (value) => (value / maxValue) * plotHeight;

  return (
    <div className="admin-card admin-trends-card">
      {/* Header card: tiêu đề + year selector */}
      <div className="admin-trends-card__header">
        <div>
          <h3 className="admin-card__title">Publication Trends</h3>
          <p className="admin-card__subtitle">Manuscript submissions vs Publications (Annual)</p>
        </div>

        {/* Year selector - select thuần, style theo bg-chip */}
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
        <p className="admin-muted-text mb-0">Đang tải dữ liệu xu hướng xuất bản...</p>
      ) : error ? (
        <p className="admin-error-text mb-0">{error}</p>
      ) : safeData.length === 0 ? (
        <p className="admin-muted-text mb-0">Chưa có dữ liệu xu hướng xuất bản.</p>
      ) : (
        <>
          {/* Vùng chart SVG */}
          <div className="admin-trends-card__chart">
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              className="admin-trends-svg"
            >
              {/* Đường gridline ngang (3 mốc: 0%, 50%, 100% chiều cao) - màu border nhạt */}
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

              {/* Vẽ 2 cột cho từng tháng */}
              {safeData.map((item, index) => {
                const slotX = CHART_PADDING_LEFT + index * slotWidth;

                const manuscriptsHeight = getBarHeight(item.manuscripts);
                const publishedHeight = getBarHeight(item.published);

                const manuscriptsX = slotX + barGap;
                const publishedX = manuscriptsX + barWidth + barGap;

                // API trả month dạng số (1-12) -> convert sang label viết tắt (Jan, Feb...)
                const monthLabel = MONTH_LABELS[item.month - 1] || item.month;

                return (
                  <g key={item.year || item.month}>
                    {/* Cột "manuscripts" (submissions) - màu xám section */}
                    <rect
                      x={manuscriptsX}
                      y={plotHeight - manuscriptsHeight}
                      width={barWidth}
                      height={manuscriptsHeight}
                      fill="var(--bg-section)"
                      rx="3"
                    />
                    {/* Cột "published" - màu cam primary */}
                    <rect
                      x={publishedX}
                      y={plotHeight - publishedHeight}
                      width={barWidth}
                      height={publishedHeight}
                      fill="var(--primary)"
                      rx="3"
                    />
                    {/* Label tháng dưới mỗi nhóm cột */}
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

          {/* Legend - chú thích màu cột */}
          <div className="admin-trends-card__legend">
            <span className="admin-trends-legend-item">
              <span className="admin-trends-legend-dot admin-trends-legend-dot--submissions" />
              Submissions
            </span>
            <span className="admin-trends-legend-item">
              <span className="admin-trends-legend-dot admin-trends-legend-dot--published" />
              Published
            </span>
          </div>
        </>
      )}
    </div>
  );
}