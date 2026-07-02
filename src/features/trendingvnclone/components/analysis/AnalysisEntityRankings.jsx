import { useMemo, useState } from 'react';
import { formatGrowthRate } from '../../../trendingVN/utils/paperVnAnalysis';

const ENTITY_TYPES = [
  { key: 'institutions', label: 'Institutions', filter: 'selectedInstitution' },
  { key: 'authors', label: 'Authors', filter: 'selectedAuthor' },
  { key: 'journals', label: 'Journals', filter: 'selectedJournal' },
  { key: 'topics', label: 'Topics', filter: 'selectedTopic' },
  { key: 'keywords', label: 'Keywords', filter: 'selectedKeyword' },
];

const fmt = (value) => new Intl.NumberFormat().format(Number(value || 0));

export default function AnalysisEntityRankings({ top, growth, onEntityClick }) {
  const [entityType, setEntityType] = useState('institutions');
  const [mode, setMode] = useState('top');
  const activeMeta = ENTITY_TYPES.find((item) => item.key === entityType) || ENTITY_TYPES[0];
  const rows = useMemo(() => {
    const source = mode === 'top' ? top : growth;
    return source?.[entityType] || [];
  }, [entityType, growth, mode, top]);

  const handleEntityClick = (row) => {
    if (!row.entity_id) return;
    onEntityClick?.(activeMeta.filter, row.entity_id);
  };

  return (
    <section id="analysis-entity-rankings" className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-bold text-gray-900 text-[15px]">Entity rankings</h2>
          <p className="text-[12.8px] text-lens-slate-gray mt-0.5">
            Top and Growth are separate backend-ranked lists for the selected entity type.
          </p>
        </div>
        <div className="flex border border-[#D8E7F4] rounded-sm overflow-hidden text-[12px] font-semibold shrink-0">
          {['top', 'growth'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 capitalize cursor-pointer ${
                mode === m ? 'bg-lens-link-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3 border-b border-gray-100 pb-3">
        {ENTITY_TYPES.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setEntityType(item.key)}
            className={`px-2.5 py-1 rounded-sm text-[12px] font-semibold cursor-pointer ${
              entityType === item.key ? 'bg-[#EBF2FA] text-lens-link-blue' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="text-[12.8px] text-gray-400 italic py-8 text-center">
          No {mode} rows returned for {activeMeta.label.toLowerCase()}.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.8px] text-gray-700">
            <thead>
              <tr className="border-b border-gray-200 text-left text-[11px] font-bold text-gray-500 uppercase">
                <th className="py-2 pr-3">Rank</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3 text-right">Current</th>
                <th className="py-2 pr-3 text-right">Previous</th>
                <th className="py-2 pr-3 text-right">Growth</th>
                <th className="py-2 text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const canClick = Boolean(row.entity_id);
                return (
                  <tr key={`${row.entity_id || row.display_name}-${index}`} className="border-b border-gray-100 hover:bg-gray-50/60">
                    <td className="py-2 pr-3">{row.rank || index + 1}</td>
                    <td className="py-2 pr-3">
                      {canClick ? (
                        <button
                          type="button"
                          onClick={() => handleEntityClick(row)}
                          className="text-lens-link-blue hover:underline cursor-pointer font-medium text-left"
                        >
                          {row.display_name}
                        </button>
                      ) : (
                        <span>{row.display_name}</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">{fmt(row.current_count)}</td>
                    <td className="py-2 pr-3 text-right">{fmt(row.previous_count)}</td>
                    <td className="py-2 pr-3 text-right">{fmt(row.absolute_growth)}</td>
                    <td className="py-2 text-right">{formatGrowthRate(row.growth_rate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
