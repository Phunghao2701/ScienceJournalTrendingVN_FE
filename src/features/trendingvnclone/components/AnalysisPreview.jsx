import { useMemo } from 'react';

export const AnalysisPreview = ({ activeItems = [], analytics = null, selectedFilters = {}, onFilterToggle = () => {} }) => {
  // Dynamic Institution aggregation from active items or backend analytics
  const institutions = useMemo(() => {
    if (analytics && analytics.topInstitutions) {
      return analytics.topInstitutions.map((inst) => {
        let color = 'from-blue-500 to-indigo-600';
        let code = inst.name.slice(0, 3).toUpperCase();
        const instName = inst.name;

        if (instName.includes('Institutes of Health') || instName.includes('NIH')) {
          color = 'from-blue-500 to-indigo-600';
          code = 'NIH';
        } else if (instName.includes('Fusion Science')) {
          color = 'from-orange-500 to-red-600';
          code = 'NIFS';
        } else if (instName.includes('Academy of Sciences') || instName.includes('Chinese')) {
          color = 'from-sky-500 to-blue-600';
          code = 'CAS';
        } else if (instName.includes('Harvard')) {
          color = 'from-red-700 to-rose-900';
          code = 'HU';
        } else if (instName.includes('Helsinki')) {
          color = 'from-emerald-500 to-green-600';
          code = 'UH';
        } else if (instName.includes('Tsinghua')) {
          color = 'from-indigo-700 to-purple-800';
          code = 'TU';
        } else if (instName.includes('Kỹ thuật mật mã') || instName.includes('Information security')) {
          color = 'from-purple-500 to-pink-600';
          code = 'KMA';
        }

        return {
          id: inst.id ?? null,
          name: instName,
          count: inst.count.toLocaleString(),
          color,
          code
        };
      });
    }

    const counts = {};
    activeItems.forEach((item) => {
      item.institutions?.forEach((inst) => {
        counts[inst] = (counts[inst] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([instName, count]) => {
        // Map brand color tokens dynamically
        let color = 'from-blue-500 to-indigo-600';
        let code = instName.slice(0, 3).toUpperCase();
        if (instName.includes('Institutes of Health') || instName.includes('NIH')) {
          color = 'from-blue-500 to-indigo-600';
          code = 'NIH';
        } else if (instName.includes('Fusion Science')) {
          color = 'from-orange-500 to-red-600';
          code = 'NIFS';
        } else if (instName.includes('Academy of Sciences') || instName.includes('Chinese')) {
          color = 'from-sky-500 to-blue-600';
          code = 'CAS';
        } else if (instName.includes('Harvard')) {
          color = 'from-red-700 to-rose-900';
          code = 'HU';
        } else if (instName.includes('Helsinki')) {
          color = 'from-emerald-500 to-green-600';
          code = 'UH';
        } else if (instName.includes('Tsinghua')) {
          color = 'from-indigo-700 to-purple-800';
          code = 'TU';
        } else if (instName.includes('Kỹ thuật mật mã') || instName.includes('Information security')) {
          color = 'from-purple-500 to-pink-600';
          code = 'KMA';
        }

        return {
          id: null,
          name: instName,
          count: count.toLocaleString(),
          color,
          code
        };
      });
  }, [activeItems, analytics]);

  // Dynamic Date Published year histogram calculations
  const years = useMemo(() => {
    const yearRange = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
    const counts = {};
    yearRange.forEach((y) => {
      counts[y] = 0;
    });

    if (analytics && analytics.yearDistribution) {
      analytics.yearDistribution.forEach((y) => {
        const yr = parseInt(y.key || y.name, 10);
        if (yr >= 2018 && yr <= 2026) {
          counts[yr] = y.count;
        }
      });
      const maxCount = Math.max(...Object.values(counts));

      return yearRange.map((year) => {
        const count = counts[year];
        const density = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
        return {
          year,
          count,
          density
        };
      });
    }

    activeItems.forEach((item) => {
      const match = item.date.match(/\d{4}/);
      if (match) {
        const yr = parseInt(match[0], 10);
        if (yr >= 2018 && yr <= 2026) {
          counts[yr] = (counts[yr] || 0) + 1;
        }
      }
    });

    const maxCount = Math.max(...Object.values(counts));

    return yearRange.map((year) => {
      const count = counts[year];
      const density = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
      return {
        year,
        count,
        density
      };
    });
  }, [activeItems, analytics]);

  // Top Authors — clickable, filters by author_id (backend-provided count only)
  const topAuthors = useMemo(() => {
    if (!analytics?.topAuthors) return [];
    const maxCount = Math.max(...analytics.topAuthors.map((a) => a.count), 1);
    return analytics.topAuthors.slice(0, 8).map((a) => ({
      id: a.id ?? null,
      name: a.name,
      count: a.count,
      width: Math.max(6, Math.round((a.count / maxCount) * 100))
    }));
  }, [analytics]);

  // Top Topics — clickable, filters by topic_id (backend-provided count only)
  const topTopics = useMemo(() => {
    if (!analytics?.topTopics) return [];
    const maxCount = Math.max(...analytics.topTopics.map((t) => t.count), 1);
    return analytics.topTopics.slice(0, 8).map((t) => ({
      id: t.id ?? null,
      name: t.name,
      count: t.count,
      width: Math.max(6, Math.round((t.count / maxCount) * 100))
    }));
  }, [analytics]);

  // Access Status — OA segment is clickable, mirrors trendingVN's accessStatusCounts
  const accessStatus = useMemo(() => {
    if (!analytics?.accessDistribution) return [];
    const counts = Object.fromEntries(
      analytics.accessDistribution.map((item) => [item.key || item.name, item.count || 0])
    );
    const maxCount = Math.max(counts.oa || counts.open || 0, counts.closed || counts.subscription || 0, 1);
    return [
      { key: 'oa', label: 'Open Access', count: counts.oa || counts.open || 0, color: 'bg-emerald-500', clickable: true },
      { key: 'closed', label: 'Closed Access', count: counts.closed || counts.subscription || 0, color: 'bg-slate-400', clickable: false }
    ].map((row) => ({ ...row, width: Math.max(row.count > 0 ? 6 : 0, Math.round((row.count / maxCount) * 100)) }));
  }, [analytics]);

  const isInstitutionActive = (id) => id != null && String(selectedFilters.selectedInstitution) === String(id);
  const isAuthorActive = (id) => id != null && String(selectedFilters.selectedAuthor) === String(id);
  const isTopicActive = (id) => id != null && String(selectedFilters.selectedTopic) === String(id);
  const isOpenAccessActive = selectedFilters.selectedAccess === 'oa';

  return (
    <aside className="w-full lg:w-[366.3px] shrink-0 p-4 space-y-5 font-sans select-none bg-slate-50/50">
      {/* 1. Top Institution list */}
      <div className="bg-white border border-[#D8E7F4] rounded shadow-sm overflow-hidden select-none">
        <div className="bg-gray-150/50 border-b border-gray-200 px-4 py-2.5">
          <h3 className="font-bold text-gray-800 text-[13.6px] tracking-wide font-sans">
            Institution Name
          </h3>
        </div>
        <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
          {institutions.length > 0 ? (
            institutions.map((inst, idx) => {
              const active = isInstitutionActive(inst.id);
              return (
                <div
                  key={inst.id ?? idx}
                  onClick={() => inst.id != null && onFilterToggle('institution', inst.id)}
                  className={`px-4 py-3 flex items-center space-x-3 transition-colors animate-in fade-in duration-100 ${
                    inst.id != null ? 'cursor-pointer hover:bg-gray-50/50' : ''
                  } ${active ? 'bg-[#EBF2FA]' : ''}`}
                >
                  <div className={`w-9 h-9 rounded bg-gradient-to-br ${inst.color} shrink-0 flex items-center justify-center shadow-xs border border-white/10`}>
                    <span className="text-[11px] font-extrabold text-white tracking-tighter">
                      {inst.code}
                    </span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-[12.8px] font-semibold text-gray-850 truncate hover:text-lens-link-blue" title={inst.name}>
                      {inst.name}
                    </h4>
                    <span className="text-[11.5px] font-bold text-lens-link-blue">
                      {inst.count} publication{parseInt(inst.count, 10) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-[12.8px] text-gray-500 bg-gray-50/50">
              No institution data available.
            </div>
          )}
        </div>
      </div>

      {/* 2. Access Status — click Open Access segment to filter */}
      {accessStatus.length > 0 && (
        <div className="bg-white border border-[#D8E7F4] rounded shadow-sm p-4 select-none">
          <h3 className="font-bold text-gray-800 text-[13.6px] tracking-wide mb-3">
            Access Status
          </h3>
          <div className="space-y-2.5">
            {accessStatus.map((row) => (
              <div key={row.key}>
                <div
                  onClick={() => row.clickable && onFilterToggle('openAccess', 'Open Access')}
                  className={`flex items-center justify-between text-[12px] font-semibold text-gray-700 mb-1 ${
                    row.clickable ? 'cursor-pointer hover:text-lens-link-blue' : ''
                  } ${row.key === 'oa' && isOpenAccessActive ? 'text-lens-link-blue' : ''}`}
                >
                  <span>{row.label}</span>
                  <span className="text-gray-500 font-bold">{row.count.toLocaleString()}</span>
                </div>
                <div className="h-[6px] bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Top Authors — clickable, filters by author_id */}
      {topAuthors.length > 0 && (
        <div className="bg-white border border-[#D8E7F4] rounded shadow-sm p-4 select-none">
          <h3 className="font-bold text-gray-800 text-[13.6px] tracking-wide mb-3">
            Top Authors
          </h3>
          <div className="space-y-2.5">
            {topAuthors.map((author, idx) => {
              const active = isAuthorActive(author.id);
              const clickable = author.id != null;
              return (
                <div key={author.id ?? idx}>
                  <div
                    onClick={() => clickable && onFilterToggle('author', author.id)}
                    className={`flex items-center justify-between text-[12px] font-semibold mb-1 ${
                      clickable ? 'cursor-pointer text-gray-700 hover:text-lens-link-blue' : 'text-gray-700'
                    } ${active ? 'text-lens-link-blue' : ''}`}
                  >
                    <span className="truncate pr-2" title={author.name}>{author.name}</span>
                    <span className="text-gray-500 font-bold shrink-0">{author.count.toLocaleString()}</span>
                  </div>
                  <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-purple-600" style={{ width: `${author.width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Top Topics — clickable, filters by topic_id (Subject Matter) */}
      {topTopics.length > 0 && (
        <div className="bg-white border border-[#D8E7F4] rounded shadow-sm p-4 select-none">
          <h3 className="font-bold text-gray-800 text-[13.6px] tracking-wide mb-3">
            Top Topics
          </h3>
          <div className="space-y-2.5">
            {topTopics.map((topic, idx) => {
              const active = isTopicActive(topic.id);
              const clickable = topic.id != null;
              return (
                <div key={topic.id ?? idx}>
                  <div
                    onClick={() => clickable && onFilterToggle('subjectMatter', topic.id)}
                    className={`flex items-center justify-between text-[12px] font-semibold mb-1 ${
                      clickable ? 'cursor-pointer text-gray-700 hover:text-lens-link-blue' : 'text-gray-700'
                    } ${active ? 'text-lens-link-blue' : ''}`}
                  >
                    <span className="truncate pr-2" title={topic.name}>{topic.name}</span>
                    <span className="text-gray-500 font-bold shrink-0">{topic.count.toLocaleString()}</span>
                  </div>
                  <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-lens-link-blue" style={{ width: `${topic.width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Date Published histogram chart */}
      <div className="bg-white border border-[#D8E7F4] rounded shadow-sm p-4 select-none">
        <h3 className="font-bold text-gray-800 text-[13.6px] tracking-wide mb-4">
          Date Published
        </h3>
        {/* Sleek CSS Bar Graph */}
        <div className="h-32 flex items-end justify-between gap-1 px-1 relative">
          {/* Horizontal Gridline reference lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none">
            <div className="w-full border-t border-dashed border-gray-100" />
            <div className="w-full border-t border-dashed border-gray-100" />
            <div className="w-full border-t border-dashed border-gray-100" />
            <div className="w-full border-t border-dashed border-gray-100" />
          </div>

          {years.map((y) => (
            <div
              key={y.year}
              className="flex-grow flex flex-col items-center group relative cursor-pointer"
            >
              {/* Tooltip on Hover */}
              <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none select-none z-10 font-bold shadow-sm">
                {y.year}: {y.count} publication{y.count !== 1 ? 's' : ''}
              </div>

              {/* Bar itself */}
              <div
                style={{ height: `${y.density}%` }}
                className="w-full bg-blue-100 group-hover:bg-lens-link-blue rounded-t-xs transition-all duration-150 border-x border-white/20"
              />

              {/* Year label */}
              <span className="text-[10px] text-gray-500 font-semibold mt-1.5 scale-90">
                {y.year}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default AnalysisPreview;
