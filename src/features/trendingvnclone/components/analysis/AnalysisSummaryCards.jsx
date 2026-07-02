import {
  FileText,
  Quote,
  BookOpen,
  Users,
  Building2,
  Library,
  Unlock,
  Lock,
  HelpCircle,
  Database,
  DatabaseZap
} from 'lucide-react';

const fmt = (value) => new Intl.NumberFormat().format(Number(value || 0));

const SummaryCard = ({ Icon, label, value, hint }) => (
  <div className="bg-white border border-[#D8E7F4] rounded shadow-xs p-3.5 flex items-start gap-2.5">
    <div className="w-8 h-8 rounded bg-[#EBF2FA] text-lens-link-blue flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0">
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">{label}</div>
      <div className="text-[18px] font-bold text-gray-900 leading-tight">{fmt(value)}</div>
      {hint && <div className="text-[10px] text-gray-400 mt-0.5">{hint}</div>}
    </div>
  </div>
);

export default function AnalysisSummaryCards({ summary = {}, window: analysisWindow = {} }) {
  const current = analysisWindow?.current || {};
  const comparison = analysisWindow?.comparison || {};
  const windowLabel = current.from_year && current.to_year ? `${current.from_year}-${current.to_year}` : 'Current window';
  const comparisonLabel = comparison.from_year && comparison.to_year ? `${comparison.from_year}-${comparison.to_year}` : 'Comparison unavailable';

  return (
    <section className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-gray-900 text-[15px]">Analysis summary</h2>
          <p className="text-[12.8px] text-lens-slate-gray mt-0.5">
            Vietnamese university scope. Counts reflect the filtered cohort returned by the backend.
          </p>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded">
            Current: {windowLabel}
          </span>
          <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded">
            Comparison: {comparisonLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        <SummaryCard Icon={FileText} label="Scholarly works" value={summary.scholarly_works} />
        <SummaryCard Icon={Quote} label="Imported citations" value={summary.total_citations} />
        <SummaryCard Icon={BookOpen} label="Imported references" value={summary.total_references} />
        <SummaryCard Icon={Users} label="Authors" value={summary.authors} />
        <SummaryCard Icon={Building2} label="Institutions" value={summary.institutions} />
        <SummaryCard Icon={Library} label="Journals" value={summary.journals} />
        <SummaryCard Icon={Unlock} label="OA open" value={summary.open_access_works} />
        <SummaryCard Icon={Lock} label="OA closed" value={summary.closed_access_works} />
        <SummaryCard Icon={HelpCircle} label="OA unavailable" value={summary.oa_unavailable_works} />
        <SummaryCard
          Icon={Database}
          label="Available citing works"
          value={summary.available_citing_works}
          hint="Local relation rows, not imported total"
        />
        <SummaryCard
          Icon={DatabaseZap}
          label="Available references"
          value={summary.available_references}
          hint="Local relation rows, not imported total"
        />
      </div>
    </section>
  );
}
