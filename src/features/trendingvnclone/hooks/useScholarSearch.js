import { useQuery } from '@tanstack/react-query';
import { getArticlesListApi } from '../../article/api/articleApi';
import { searchJournalsApi } from '../../journal/api/journalApi';
import { buildPaperVnDiscoveryParams } from '../../article/utils/paperVnDiscoveryParams';
import { normalizeAuthors, normalizeKeywords, normalizeTopics, getDoiUrl } from '../../article/utils/articleFormatters';

// Normalises a raw /articles item into the card-item shape used across the whole
// trendingvnclone feature (list card, detail page, citing works, references, recommended).
// Reuses trendingVN's shared normalizers so both features treat backend fields identically.
export const mapArticleToCardItem = (item) => {
  if (!item) return null;

  // 1. Authors — keep author_id so popups/entity click-through can filter by it
  const normalizedAuthors = normalizeAuthors(item.authors);
  const authors = normalizedAuthors.map((a) => ({
    id: a.author_id || null,
    name: a.display_name
  }));

  // 2. Institutions array
  let institutionsList;
  if (Array.isArray(item.institutions) && item.institutions.length > 0) {
    institutionsList = item.institutions.map((inst) =>
      typeof inst === 'string' ? inst : inst.display_name || inst.name || ''
    );
  } else {
    const instSet = new Set();
    normalizedAuthors.forEach((a) => {
      if (a.last_known_institution) {
        instSet.add(a.last_known_institution);
      }
      (a.institutions || []).forEach((i) => {
        instSet.add(typeof i === 'string' ? i : i.display_name || i.name || '');
      });
    });
    institutionsList = Array.from(instSet);
  }
  institutionsList = institutionsList.filter(Boolean);

  // 3. Keywords & Fields of Study (topics)
  const keywords = normalizeKeywords(item.keywords).map((k) => k.display_name).filter(Boolean);
  const fieldsOfStudy = normalizeTopics(item).map((t) => t.display_name).filter(Boolean);

  // 4. Badges mapping
  const badges = [];
  if (item.is_open_access || item.open_access) {
    badges.push('Open Access');
  }
  if (item.abstract) {
    badges.push('Abstract');
  }
  if (institutionsList.length > 0) {
    badges.push('Affiliation');
  }
  if (Number(item.reference_count || 0) > 0) {
    badges.push('Collection');
  }

  // 5. Parse dates/years (publication_year comes back as a number from the API,
  // but downstream code calls .match() on this field, so it must stay a string)
  const displayYear = String(item.publication_year || item.publication_date?.slice(0, 4) || '');
  const doi = item.doi || '';

  return {
    id: item.article_id || item.id,
    title: item.title || 'Untitled Article',
    type: 'Journal Article',
    journal:
      item.journal_name ||
      (item.journal ? item.journal.display_name || item.journal.name : ''),
    journalId: item.journal_id || (item.journal ? item.journal.journal_id || item.journal.id : null) || null,
    volume: item.volume_number || item.volume || '',
    issue: item.issue_number || item.issue || '',
    pages: item.pages || item.page_range || '',
    date: displayYear,
    authors,
    citingPatents: item.citing_patents_count || 0,
    citingScholarlyWorks: Number(
      item.citation_count ??
        item.citations_count ??
        item.cited_by_count ??
        item.semantic_citation_count ??
        0
    ),
    referenceCount: Number(item.reference_count ?? 0),
    lensId: doi ? `VN-${doi.toUpperCase()}` : `VN-A-${item.article_id || item.id}`,
    doi,
    doiUrl: getDoiUrl(doi),
    badges,
    abstractText: item.abstract || '',
    institutions: institutionsList,
    fieldsOfStudy,
    keywords,
    publisher:
      item.publisher_name || (item.publisher ? item.publisher.display_name || item.publisher.name : '') || '',
    publisherId: item.publisher_id || (item.publisher ? item.publisher.publisher_id || item.publisher.id : null) || null,
    issn: item.issn || item.journal_issn || (item.journal ? item.journal.issn : '') || '',
    topicId: item.primary_topic || item.topics?.[0]?.topic_id || null,
    linksToOtherSources: doi ? [`doi.org/${doi}`] : []
  };
};

const resolveIssnJournalFilter = async (searchText) => {
  const text = (searchText || '').trim();
  const issnMatch = text.match(
    /(?:source\.issn:\s*")?(\d{4}-\d{3}[\dX]|\d{4}\s*-\s*\d{3}[\dX]|\d{8})(?:"\s*)?/i
  );
  if (!issnMatch) {
    return { journalId: null, searchStr: text };
  }

  const issnVal = issnMatch[1].replace(/\s+/g, '');
  try {
    const journalRes = await searchJournalsApi({ search: issnVal });
    const journalList = journalRes?.data?.data?.items || [];
    if (journalList.length > 0) {
      const matchedJournal = journalList[0];
      return {
        journalId: matchedJournal.journal_id || matchedJournal.id,
        searchStr: ''
      };
    }
  } catch (err) {
    console.warn('Failed to lookup journal by ISSN:', err);
  }

  return { journalId: null, searchStr: text };
};

/**
 * Fetches the scholarly works list.
 * `filters` is the same flat shape produced by
 * `buildPaperVnQueryFilters` (src/features/article/utils/paperVnDiscoveryParams.js),
 * so the clone builds request params exactly the same way trendingVN does.
 */
export const useScholarSearch = (filters = {}, { enabled = true } = {}) => {
  const query = useQuery({
    queryKey: ['trendingvnclone', 'search', filters],
    enabled,
    queryFn: async () => {
      // 1. Resolve ISSN filter if the search text matches an ISSN pattern
      const { journalId, searchStr } = await resolveIssnJournalFilter(filters.search);

      // 2. Build backend params the same way trendingVN's useArticleList does
      const params = buildPaperVnDiscoveryParams({
        ...filters,
        search: searchStr,
        selectedJournal: journalId || filters.selectedJournal
      });

      const response = await getArticlesListApi(params);
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to fetch scholarly articles');
      }

      const resData = response.data.data || {};
      const rawArticles = resData.articles || resData.items || [];
      const pagination = resData.pagination || {};
      const totalItems = pagination.total || rawArticles.length;

      const items = rawArticles.map(mapArticleToCardItem).filter(Boolean);
      const apiStats = resData.stats || null;

      return {
        items,
        totalItems,
        stats: {
          totalArticles: Number(apiStats?.totalArticles ?? totalItems),
          openAccessCount: Number(apiStats?.openAccessCount ?? items.filter((a) => a.badges.includes('Open Access')).length),
          authorsCount: Number(apiStats?.authorsCount ?? 0),
          topicsCount: Number(apiStats?.topicsCount ?? 0)
        }
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 3 // Cache for 3 minutes
  });

  return {
    items: query.data?.items || [],
    totalItems: query.data?.totalItems || 0,
    stats: query.data?.stats || { totalArticles: 0, openAccessCount: 0, authorsCount: 0, topicsCount: 0 },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? query.error.message : null,
    refetch: query.refetch
  };
};
