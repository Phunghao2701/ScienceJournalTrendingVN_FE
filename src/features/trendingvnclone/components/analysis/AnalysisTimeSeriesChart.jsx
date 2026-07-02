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
  color = '#2B54B2',
}) {
  const series = buildSeries(years, rows, valueKey);
  const maxValue = Math.max(...series.map((item) => item.value), 0);
  const safeMax = maxValue || 1;
  const chartWidth = 720;
  const chartHeight = 220;
  const plotBottom = 178;
  const plotHeight = plotBottom - 18;
  const step = series.length > 1 ? 640 / (series.length - 1) : 0;
  const points = series.map((item, index) => {
    const x = 40 + (series.length > 1 ? index * step : 320);
    const y = plotBottom - (item.value / safeMax) * plotHeight;
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <section className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-[13.6px]">{title}</h3>
          <p className="text-[12px] text-lens-slate-gray mt-0.5">{description}</p>
        </div>
        {coverageLabel && (
          <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded shrink-0">
            {coverageLabel}
          </span>
        )}
      </div>

      {series.length === 0 ? (
        <div className="text-[12.8px] text-gray-400 italic py-8 text-center">
          No time-series rows returned for this cohort.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-[220px]"
          role="img"
          aria-label={`${title}: ${series.map((item) => `${item.year} ${fmt(item.value)}`).join(', ')}`}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = plotBottom - tick * plotHeight;
            return (
              <g key={tick}>
                <line x1="40" x2="690" y1={y} y2={y} stroke="#D8E7F4" strokeDasharray="4 4" />
                <text x="28" y={y + 3} textAnchor="end" fontSize="10" fill="#94A3B8">
                  {fmt(Math.round(safeMax * tick))}
                </text>
              </g>
            );
          })}
          <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => (
            <g key={point.year}>
              <circle cx={point.x} cy={point.y} r="4" fill="#ffffff" stroke={color} strokeWidth="2" />
              <text x={point.x} y="205" textAnchor="middle" fontSize="10" fill="#94A3B8">
                {point.year}
              </text>
              <title>{`${point.year}: ${fmt(point.value)}`}</title>
            </g>
          ))}
        </svg>
      )}
    </section>
  );
}
