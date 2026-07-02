import { Link } from 'react-router-dom';
import { formatGrowthRate } from '../../../trendingVN/utils/paperVnAnalysis';

const fmt = (value) => new Intl.NumberFormat().format(Number(value || 0));

export default function AnalysisTrendingArticles({ articles = [], coverage }) {
  const eligible = coverage?.eligible_articles || 0;
  const total = coverage?.total_articles || 0;

  return (
    <section className="bg-white border border-[#D8E7F4] rounded shadow-xs p-5 select-text">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-bold text-gray-900 text-[15px]">Trending articles</h2>
          <p className="text-[12.8px] text-lens-slate-gray mt-0.5">
            Rows are based only on usable citation-history JSON returned by the backend.
          </p>
        </div>
        <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded shrink-0">
          Coverage: {fmt(eligible)} eligible / {fmt(total)} total
        </span>
      </div>

      {articles.length === 0 ? (
        <div className="text-[12.8px] text-gray-400 italic py-8 text-center">
          No trending article rows returned for this cohort.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.8px] text-gray-700">
            <thead>
              <tr className="border-b border-gray-200 text-left text-[11px] font-bold text-gray-500 uppercase">
                <th className="py-2 pr-3">Article</th>
                <th className="py-2 pr-3">Year</th>
                <th className="py-2 pr-3">Journal</th>
                <th className="py-2 pr-3 text-right">Current</th>
                <th className="py-2 pr-3 text-right">Previous</th>
                <th className="py-2 pr-3 text-right">Growth</th>
                <th className="py-2 pr-3 text-right">Rate</th>
                <th className="py-2 text-right">Imported</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.article_id || article.title} className="border-b border-gray-100 hover:bg-gray-50/60">
                  <td className="py-2 pr-3 max-w-[260px]">
                    {article.article_id ? (
                      <Link
                        to={`/trendingvnclone/article/${article.article_id}`}
                        className="text-lens-link-blue hover:underline font-medium line-clamp-2"
                      >
                        {article.title}
                      </Link>
                    ) : (
                      <span className="line-clamp-2">{article.title}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">{article.publication_year || 'N/A'}</td>
                  <td className="py-2 pr-3">{article.journal_name || 'Unknown journal'}</td>
                  <td className="py-2 pr-3 text-right">{fmt(article.current_citations)}</td>
                  <td className="py-2 pr-3 text-right">{fmt(article.previous_citations)}</td>
                  <td className="py-2 pr-3 text-right">{fmt(article.absolute_growth)}</td>
                  <td className="py-2 pr-3 text-right">{formatGrowthRate(article.growth_rate)}</td>
                  <td className="py-2 text-right">{fmt(article.citation_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
