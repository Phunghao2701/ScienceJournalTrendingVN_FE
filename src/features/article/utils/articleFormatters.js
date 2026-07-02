/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\article\utils\articleFormatters.js
 */
export const emptyText = '—';

export const getDoiUrl = (doi) => {
  if (!doi) return '';
  const cleanDoi = String(doi).trim();
  if (!cleanDoi) return '';
  return cleanDoi.startsWith('http') ? cleanDoi : `https://doi.org/${cleanDoi}`;
};

export const getInitials = (name = '') => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'A';
  return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('');
};

export const normalizeAuthors = (authors) => {
  if (!authors) return [];

  const rawAuthors = Array.isArray(authors)
    ? authors
    : String(authors).split(',').map((item) => item.trim()).filter(Boolean);

  return rawAuthors.map((author) => {
    if (typeof author === 'string') {
      const match = author.match(/^(.*?)(?:\s*\((.*?)\))?$/);
      return {
        author_id: null,
        display_name: match?.[1]?.trim() || author,
        last_known_institution: match?.[2]?.trim() || '',
        works_count: null,
      };
    }

    return {
      author_id: author.author_id || author.id || null,
      display_name: author.display_name || author.name || author.author_name || 'Tác giả',
      last_known_institution:
        author.last_known_institution || author.institution || author.affiliation || '',
      works_count: author.works_count ?? null,
      orcid: author.orcid || '',
      url_image: author.url_image || '',
      institutions: Array.isArray(author.institutions) ? author.institutions : [],
    };
  }).filter((author) => author.display_name);
};

export const normalizeKeywords = (keywords) => {
  if (!keywords) return [];
  const rawKeywords = Array.isArray(keywords)
    ? keywords
    : String(keywords).split(',').map((item) => item.trim()).filter(Boolean);

  return rawKeywords.map((keyword) => {
    if (typeof keyword === 'string') {
      return { keyword_id: null, display_name: keyword, score: null };
    }

    return {
      keyword_id: keyword.keyword_id || keyword.id || null,
      display_name: keyword.display_name || keyword.keyword || keyword.name || '',
      score: keyword.score ?? null,
    };
  }).filter((keyword) => keyword.display_name);
};

export const normalizeTopics = (article) => {
  const topics = Array.isArray(article?.topics) ? article.topics : [];
  const normalized = topics.map((topic) => ({
    topic_id: topic.topic_id || topic.id || null,
    display_name: topic.display_name || topic.topic_name || topic.name || '',
    is_primary: Boolean(topic.is_primary),
  })).filter((topic) => topic.display_name);

  if (normalized.length > 0) return normalized;

  const primaryName = article?.topic_name || article?.primary_topic_name || article?.primary_topic;
  if (!primaryName) return [];

  return [{
    topic_id: article?.primary_topic || null,
    display_name: primaryName,
    is_primary: true,
  }];
};

export const normalizeArticleDetail = (apiData = {}, id = '') => {
  const authors = normalizeAuthors(apiData.authors);
  const keywords = normalizeKeywords(apiData.keywords);
  const topics = normalizeTopics(apiData);
  const doiUrl = apiData.source_url || getDoiUrl(apiData.doi);

  const citationsRaw = apiData.citations ?? apiData.citations_count ?? apiData.citation_count ?? apiData.cited_by_count ?? apiData.semantic_citation_count ?? apiData.semantic_scholar_citation_count;
  const citingPatentsRaw = apiData.citing_patents_count ?? apiData.citing_patents ?? apiData.patent_citation_count;
  const citationsByYearRaw = apiData.citations_by_year ?? apiData.counts_by_year ?? {};
  const referenceCountRaw = apiData.reference_count ?? (Array.isArray(apiData.references) ? apiData.references.length : 0);
  const citingWorksCountRaw = apiData.citing_works_count ?? apiData.citingWorksCount;
  const availableReferencesCountRaw = apiData.available_references_count ?? apiData.availableReferencesCount;

  return {
    ...apiData,
    article_id: apiData.article_id || apiData.id || id,
    title: apiData.title || 'Untitled Article',
    abstract: apiData.abstract || '',
    publication_year: apiData.publication_year || null,
    doi: apiData.doi || '',
    doi_url: doiUrl,
    source_url: doiUrl,
    openalex_id: apiData.openalex_id || apiData.openalex || apiData.work_id || apiData.openalex_work_id || apiData.openalex_url || '',
    pdf_url: apiData.pdf_url || apiData.pdf_link || apiData.pdf || apiData.url_pdf || apiData.pdf_download_url || apiData.oa_pdf_url || apiData.best_oa_location_pdf_url || '',
    primary_topic: apiData.primary_topic || '',
    topic_name: apiData.topic_name || topics.find((topic) => topic.is_primary)?.display_name || '',
    keywords,
    topics,
    authors,
    institutions: Array.isArray(apiData.institutions) ? apiData.institutions : [],
    is_open_access: Boolean(apiData.is_open_access),
    citations: citationsRaw !== undefined && citationsRaw !== null ? Number(citationsRaw) : null,
    citation_count: citationsRaw !== undefined && citationsRaw !== null ? Number(citationsRaw) : 0,
    citing_works_count: citingWorksCountRaw !== undefined && citingWorksCountRaw !== null ? Number(citingWorksCountRaw) : null,
    citing_patents: citingPatentsRaw !== undefined && citingPatentsRaw !== null ? Number(citingPatentsRaw) : 0,
    citing_patents_count: citingPatentsRaw !== undefined && citingPatentsRaw !== null ? Number(citingPatentsRaw) : 0,
    citations_by_year: citationsByYearRaw || {},
    semantic_tldr: apiData.semantic_tldr || null,
    references: Array.isArray(apiData.references) ? apiData.references : [],
    reference_count: referenceCountRaw !== undefined && referenceCountRaw !== null ? Number(referenceCountRaw) : 0,
    available_references_count: availableReferencesCountRaw !== undefined && availableReferencesCountRaw !== null ? Number(availableReferencesCountRaw) : null,
    volume_id: apiData.volume_id || apiData.volume?.volume_id || '',  
    volume_number: apiData.volume_number || apiData.volume || '',
    issue_id: apiData.issue_id || apiData.issue?.issue_id || '',
    issue_number: apiData.issue_number || apiData.issue || '',
    journal_id: apiData.journal_id || apiData.journal?.journal_id || '',
    journal_name: apiData.journal_name || apiData.journal?.display_name || '',
    publisher_id: apiData.publisher_id || apiData.publisher?.publisher_id || '',
    publisher_name: apiData.publisher_name || apiData.publisher?.display_name || '',
    issn: apiData.issn || apiData.journal_issn || apiData.journal?.issn || '',
  };
};
