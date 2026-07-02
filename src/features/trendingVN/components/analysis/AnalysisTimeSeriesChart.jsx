const fmt = (value) => new Intl.NumberFormat().format(Number(value || 0));

const buildSeries = (years, rows, valueKey) => {
  const byYear = new Map((rows || []).map((row) => [Number(row.year), Number(row[valueKey] || 0)]));
  return (years || []).map((year) => ({
    year,
    value: byYear.get(Number(year)) || 0,
  }));
};

export default function AnalysisTimeSeriesChart({
  title,
  description,
  years = [],
  rows = [],
  valueKey,
  coverageLabel,
  color = '#1976D2',
}) {
  const series = buildSeries(years, rows, valueKey);
  const maxValue = Math.max(...series.map((item) => item.value), 0);
  const safeMax = maxValue || 1;
  const chartWidth = 720;
  const chartHeight = 220;
  const plotTop = 18;
  const plotBottom = 178;
  const plotHeight = plotBottom - plotTop;
  const step = series.length > 1 ? 640 / (series.length - 1) : 0;
  const points = series.map((item, index) => {
    const x = 40 + (series.length > 1 ? index * step : 320);
    const y = plotBottom - (item.value / safeMax) * plotHeight;
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <section className="analysis-section analysis-chart-card">
      <div className="analysis-section-header compact">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {coverageLabel && <span className="analysis-coverage-pill">{coverageLabel}</span>}
      </div>

      {series.length === 0 ? (
        <div className="analysis-empty">No time-series rows returned for this cohort.</div>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="analysis-line-chart"
            role="img"
            aria-label={`${title}: ${series.map((item) => `${item.year} ${fmt(item.value)}`).join(', ')}`}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const y = plotBottom - tick * plotHeight;
              return (
                <g key={tick}>
                  <line x1="40" x2="690" y1={y} y2={y} stroke="var(--border)" strokeDasharray="4 4" />
                  <text x="28" y={y + 3} textAnchor="end" fontSize="10" fill="var(--text-muted)">
                    {fmt(Math.round(safeMax * tick))}
                  </text>
                </g>
              );
            })}
            <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point) => (
              <g key={point.year}>
                <circle cx={point.x} cy={point.y} r="4" fill="#ffffff" stroke={color} strokeWidth="2" />
                <text x={point.x} y="205" textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                  {point.year}
                </text>
                <title>{`${point.year}: ${fmt(point.value)}`}</title>
              </g>
            ))}
          </svg>
          <div className="analysis-table-fallback">
            {series.map((item) => (
              <span key={item.year}>{item.year}: {fmt(item.value)}</span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
