# Paper VN Discovery API Contract

Source repo: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_BE`

Verified backend state:

- Branch: `hao/refactor/BE`
- Commit: `1347cc28fc945b762084179c7d6dc58deaa3c9c9`
- Handoff: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_BE/.ai/harness/handoff/current.md`
- Sprint: `E:/Science_Journal_Trending_VN/ScienceJournalTrendingVN_BE/plans/sprints/20260629-1247-paper-vn-discovery-backend.sprint.md`

## Scope and filters

All Paper VN discovery requests must include:

```text
scope=vn_universities
```

The backend validates `scope` as:

- `all`
- `vn_universities`

For this frontend sprint, the Paper VN Article Discovery page always uses `vn_universities`; reset filters must not remove the fixed scope.

Open access filtering uses:

- `access=oa`
- `access=closed`

The UI must not send `selectedAccess=open` or `selectedAccess=closed`.

Invalid `scope` or `access` values return `400`.

## Article list

Examples:

```text
GET /api/v1/articles?scope=vn_universities&page=1&limit=10
GET /api/v1/articles?scope=vn_universities&access=oa&year=2024
```

The list endpoint returns the metadata needed by cards without per-row detail enrichment:

- `article_id`
- `title`
- `abstract`
- `publication_year`
- `doi`
- `primary_topic`
- `topic_name`
- `journal_id`
- `journal_name`
- `journal_issn`
- `publisher_id`
- `publisher_name`
- `volume_id`
- `volume_number`
- `issue_id`
- `issue_number`
- `is_open_access`
- `citation_count`
- `reference_count`
- `created_at`
- `authors`

Expected response envelope includes:

- `data.scope`
- `data.articles`
- `data.pagination.total`
- `data.stats`

`data.stats` is filtered by the same scope/search/year/journal/topic/access/volume/issue params as the list.

## Analytics

Example:

```text
GET /api/v1/articles/analytics?scope=vn_universities&topic_id=12
```

The analytics endpoint uses the same filter builder as `/articles` and returns filtered:

- totals
- year distribution
- top publishers
- top authors
- top topics
- access distribution

Sidebar and page stats must use analytics for the complete filtered result set, not the current page only.

## Unified search and entity filters

The Paper VN list uses `/articles?search=` as the single text search source. The frontend no longer performs keyword/topic fallback list requests because those requests caused list totals and analytics to diverge.

Click-to-filter links use stable entity IDs where available:

- `journal_id`
- `publisher_id`
- `author_id`
- `topic_id`
- `keyword_id`

If an entity label is present but no ID is available, the UI falls back to `/articles?search=<label>&page=1`.

## Out of contract

- Bookmark persistence is not part of the verified backend contract.
- Core `/trending-vn` endpoints were not changed by the backend sprint.
- No new database schema or migration is required by the frontend.
