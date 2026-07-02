export const PAPER_VN_SCOPE = 'vn_universities';

export const normalizeAccessFilter = (value) => {
  if (value === 'open') return 'oa';
  if (value === 'restricted' || value === 'subscription') return 'closed';
  if (value === 'oa' || value === 'closed') return value;
  return 'all';
};

export const buildPaperVnDiscoveryParams = ({
  page,
  limit,
  sortBy,
  sortOrder,
  search,
  selectedYear,
  selectedJournal,
  selectedInstitution,
  selectedPublisher,
  selectedAuthor,
  selectedTopic,
  selectedKeyword,
  selectedAccess,
  selectedVolume,
  selectedIssue,
  fromYear,
  toYear,
} = {}) => {
  const params = {
    scope: PAPER_VN_SCOPE,
  };

  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;
  if (search) params.search = search;
  if (selectedYear && selectedYear !== 'all') params.publication_year = selectedYear;
  if (selectedJournal && selectedJournal !== 'all') params.journal_id = selectedJournal;
  if (selectedInstitution && selectedInstitution !== 'all') params.institution_id = selectedInstitution;
  if (selectedPublisher && selectedPublisher !== 'all') params.publisher_id = selectedPublisher;
  if (selectedAuthor && selectedAuthor !== 'all') params.author_id = selectedAuthor;
  if (selectedTopic && selectedTopic !== 'all') params.topic_id = selectedTopic;
  if (selectedKeyword && selectedKeyword !== 'all') params.keyword_id = selectedKeyword;

  const access = normalizeAccessFilter(selectedAccess);
  if (access !== 'all') params.access = access;

  if (selectedVolume) params.volume_id = selectedVolume;
  if (selectedIssue) params.issue_id = selectedIssue;
  if (fromYear) params.from_year = fromYear;
  if (toYear) params.to_year = toYear;

  return params;
};

export const buildPaperVnQueryFilters = (searchParams) => ({
  search: searchParams.get('search') || '',
  page: parseInt(searchParams.get('page') || '1', 10),
  limit: parseInt(searchParams.get('limit') || '10', 10),
  sortBy: searchParams.get('sortBy') || 'created_at',
  sortOrder: searchParams.get('sortOrder') || 'desc',
  selectedYear: searchParams.get('year') || 'all',
  selectedJournal: searchParams.get('journal') || searchParams.get('journal_id') || 'all',
  selectedInstitution: searchParams.get('institution_id') || 'all',
  selectedPublisher: searchParams.get('publisher_id') || 'all',
  selectedAuthor: searchParams.get('author_id') || 'all',
  selectedTopic: searchParams.get('topic') || searchParams.get('topic_id') || 'all',
  selectedKeyword: searchParams.get('keyword_id') || 'all',
  selectedAccess: normalizeAccessFilter(searchParams.get('access') || 'all'),
  selectedVolume: searchParams.get('volume_id') || '',
  selectedIssue: searchParams.get('issue_id') || '',
  fromYear: searchParams.get('from_year') || '',
  toYear: searchParams.get('to_year') || '',
  scope: PAPER_VN_SCOPE,
});
