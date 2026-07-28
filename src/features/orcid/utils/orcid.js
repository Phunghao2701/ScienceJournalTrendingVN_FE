const ORCID_PATTERN = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

const asObject = (value) => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
);

export const normalizeOrcid = (value = '') => {
  const withoutUrl = String(value)
    .trim()
    .replace(/^https?:\/\/(?:www\.)?orcid\.org\//i, '')
    .replace(/[/?#].*$/, '')
    .toUpperCase();

  const compact = withoutUrl.replace(/[\s-]/g, '');
  if (!/^\d{15}[\dX]$/.test(compact)) return withoutUrl;

  return compact.replace(/^(.{4})(.{4})(.{4})(.{4})$/, '$1-$2-$3-$4');
};

export const isValidOrcid = (value = '') => {
  const orcid = normalizeOrcid(value);
  if (!ORCID_PATTERN.test(orcid)) return false;

  const compact = orcid.replace(/-/g, '');
  let total = 0;

  for (const character of compact.slice(0, 15)) {
    total = (total + Number(character)) * 2;
  }

  const remainder = total % 11;
  const result = (12 - remainder) % 11;
  const expectedCheckDigit = result === 10 ? 'X' : String(result);

  return compact.at(-1) === expectedCheckDigit;
};

export const canReuseOrcidResult = ({
  submittedOrcid,
  currentOrcid,
  authorId,
  isScanning = false,
} = {}) => {
  if (isScanning || !authorId) return false;
  const submitted = normalizeOrcid(submittedOrcid);
  const current = normalizeOrcid(currentOrcid);
  return isValidOrcid(submitted) && submitted === current;
};

export const buildOrcidArticleDetailNavigation = (
  articleId,
  pathname = '/scan-orcid',
  search = '',
) => {
  const safePathname = pathname === '/scan-orcid' ? pathname : '/scan-orcid';
  const safeSearch = safePathname === pathname && String(search).startsWith('?')
    ? String(search)
    : '';
  const returnTo = `${safePathname}${safeSearch}`;
  const params = new URLSearchParams();
  params.set('returnTo', returnTo);

  return {
    to: `/trending/articles/${encodeURIComponent(articleId)}?${params.toString()}`,
    returnTo,
  };
};

const unwrapApiPayload = (body) => {
  const root = asObject(body);
  return root.data && typeof root.data === 'object' ? root.data : root;
};

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;

  const source = asObject(payload);
  if (Array.isArray(source.articles)) return source.articles;
  if (source.articles && typeof source.articles === 'object') {
    return extractItems(source.articles);
  }
  if (Array.isArray(source.items)) return source.items;
  if (Array.isArray(source.rows)) return source.rows;
  if (Array.isArray(source.data)) return source.data;

  return [];
};

export const normalizeAuthor = (author, fallback = {}) => {
  const source = { ...asObject(fallback), ...asObject(author) };
  const id = source.author_id ?? source.id ?? null;
  const name = source.display_name ?? source.full_name ?? source.name ?? '';
  const rawInstitution =
    source.institution_1
    ?? source.last_known_institution
    ?? source.institution
    ?? source.affiliation
    ?? '';
  const institution = typeof rawInstitution === 'object'
    ? rawInstitution.display_name ?? rawInstitution.name ?? ''
    : rawInstitution;

  return {
    ...source,
    id,
    author_id: id,
    display_name: name,
    full_name: name,
    orcid: normalizeOrcid(source.orcid ?? fallback.orcid ?? ''),
    institution,
    article_count: Number(source.article_count ?? source.works_count ?? 0) || 0,
    citation_count: Number(source.citation_count ?? source.cited_by_count ?? 0) || 0,
  };
};

export const normalizeArticle = (article) => {
  const source = asObject(article);
  const id = source.article_id ?? source.id ?? null;
  const rawJournal =
    source.journal_name
    ?? source.journal
    ?? source.container_title
    ?? source.source_name
    ?? '';
  const journalName = typeof rawJournal === 'object'
    ? rawJournal.display_name ?? rawJournal.name ?? rawJournal.title ?? ''
    : rawJournal;

  return {
    ...source,
    id,
    article_id: id,
    title: source.title ?? source.display_name ?? '',
    journal_name: journalName,
    publication_year: source.publication_year ?? source.year ?? null,
    citation_count: Number(
      source.citation_count ?? source.cited_by_count ?? source.citations ?? 0,
    ) || 0,
    doi: source.doi ?? '',
  };
};

const normalizePagination = (pagination, itemCount, defaults = {}) => {
  const source = asObject(pagination);
  const page = Math.max(1, Number(source.page ?? source.current_page ?? defaults.page ?? 1) || 1);
  const limit = Math.max(1, Number(source.limit ?? source.per_page ?? defaults.limit ?? 20) || 20);
  const total = Math.max(
    0,
    Number(source.total ?? source.total_items ?? defaults.total ?? itemCount) || 0,
  );
  const totalPages = Math.max(
    1,
    Number(source.total_pages ?? source.pages ?? Math.ceil(total / limit)) || 1,
  );

  return {
    page,
    limit,
    total,
    total_pages: totalPages,
    has_next: source.has_next ?? page < totalPages,
  };
};

const normalizeSourceStatuses = (sourceStatus) => {
  if (Array.isArray(sourceStatus)) {
    return sourceStatus.map((entry, index) => ({
      key: String(entry?.source ?? entry?.name ?? index).toLowerCase(),
      label: entry?.source ?? entry?.name ?? `Source ${index + 1}`,
      status: String(entry?.status ?? 'unknown').toLowerCase(),
      count: Number(entry?.count ?? 0) || 0,
      message: entry?.message ?? entry?.error ?? '',
    }));
  }

  return Object.entries(asObject(sourceStatus)).map(([key, value]) => {
    const source = asObject(value);
    return {
      key: key.toLowerCase(),
      label: key,
      status: String(source.status ?? value ?? 'unknown').toLowerCase(),
      count: Number(source.count ?? 0) || 0,
      message: source.message ?? source.error ?? '',
    };
  });
};

const normalizeSummary = (summary) => {
  const source = asObject(summary);
  return {
    discovered: Number(source.discovered ?? 0) || 0,
    created: Number(source.created ?? 0) || 0,
    filled_missing: Number(source.filled_missing ?? 0) || 0,
    already_existed: Number(source.already_existed ?? 0) || 0,
    failed_to_persist: Number(source.failed_to_persist ?? 0) || 0,
    skipped_deleted: Number(source.skipped_deleted ?? 0) || 0,
    available_publications:
      Number(source.available_publications ?? 0) || 0,
  };
};

export const normalizeScanResponse = (body) => {
  const root = asObject(body);
  const payload = unwrapApiPayload(body);
  const articles = extractItems(payload).map(normalizeArticle);
  const author = normalizeAuthor(payload.author ?? payload.target_author, {
    orcid: payload.orcid,
  });
  const sourceStatuses = normalizeSourceStatuses(
    payload.source_status ?? payload.sourceStatus ?? payload.sources,
  );
  const code = root.code ?? payload.code ?? '';

  return {
    author,
    articles,
    pagination: normalizePagination(
      payload.pagination ?? payload.articles?.pagination ?? root.pagination,
      articles.length,
      { page: 1, limit: 20 },
    ),
    summary: normalizeSummary(payload.summary),
    sourceStatuses,
    code,
    isPartial:
      String(code).toUpperCase().includes('PARTIAL')
      || sourceStatuses.some((source) => ['partial', 'failed', 'error'].includes(source.status)),
  };
};

const TERMINAL_SCAN_STATUSES = new Set([
  'completed',
  'partial',
  'failed',
]);

export const normalizeScanJobResponse = (body) => {
  const root = asObject(body);
  const payload = unwrapApiPayload(body);
  const status = String(payload.status ?? 'queued').toLowerCase();
  const progress = Math.max(
    0,
    Math.min(100, Number(payload.progress ?? 0) || 0),
  );
  const authorId = payload.author_id ?? payload.author?.author_id ?? null;
  const counts = asObject(payload.counts);
  const availablePublications = Math.max(
    0,
    Number(
      counts.available_publications
      ?? payload.summary?.available_publications
      ?? 0,
    ) || 0,
  );

  return {
    ...payload,
    job_id: payload.job_id ?? payload.id ?? '',
    orcid: normalizeOrcid(payload.orcid ?? ''),
    status,
    stage: String(payload.stage ?? status).toLowerCase(),
    progress,
    poll_after_ms: Math.max(
      500,
      Number(payload.poll_after_ms ?? 1500) || 1500,
    ),
    author_id: authorId == null ? null : String(authorId),
    available_publications: availablePublications,
    summary: normalizeSummary(payload.summary),
    sourceStatuses: normalizeSourceStatuses(
      payload.source_status ?? payload.sourceStatus ?? payload.sources,
    ),
    code: root.code ?? payload.code ?? '',
    error: asObject(payload.error),
    isTerminal: TERMINAL_SCAN_STATUSES.has(status),
    isPartial: status === 'partial',
    isFailed: status === 'failed',
  };
};

export const normalizeCursorArticleResponse = (body, defaults = {}) => {
  const payload = unwrapApiPayload(body);
  const articles = extractItems(payload).map(normalizeArticle);
  const source = asObject(payload.pagination);
  const cursor = String(source.cursor ?? defaults.cursor ?? '0');
  const nextCursor = String(
    source.next_cursor
    ?? source.nextCursor
    ?? cursor,
  );

  return {
    articles,
    pagination: {
      cursor,
      next_cursor: nextCursor,
      limit: Math.max(
        1,
        Number(source.limit ?? defaults.limit ?? 20) || 20,
      ),
      total_available: Math.max(
        0,
        Number(
          source.total_available
          ?? source.total
          ?? defaults.total_available
          ?? articles.length,
        ) || 0,
      ),
      has_next: Boolean(source.has_next),
    },
  };
};

export const normalizeArticlePageResponse = (body, defaults = {}) => {
  const root = asObject(body);
  const payload = unwrapApiPayload(body);
  const articles = extractItems(payload).map(normalizeArticle);

  return {
    articles,
    pagination: normalizePagination(
      asObject(payload).pagination ?? root.pagination,
      articles.length,
      defaults,
    ),
  };
};

export const normalizeAuthorResponse = (body, fallback = {}) => {
  const payload = unwrapApiPayload(body);
  return normalizeAuthor(payload.author ?? payload, fallback);
};
