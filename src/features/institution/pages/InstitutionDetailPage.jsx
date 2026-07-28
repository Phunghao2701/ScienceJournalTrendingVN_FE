import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../landing/components/Header';
import { getArticlesListApi } from '../../article/api/articleApi';
import { getInstitutionByIdApi } from '../api/institution.api';
import './InstitutionDetailPage.css';

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.articles)) return payload.articles;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getInstitutionName = (institution, fallback, unknownLabel) => (
  institution?.display_name
  || institution?.institution_name
  || institution?.name
  || fallback
  || unknownLabel
);

const getArticleCitations = (article) => Number(
  article?.citation_count ?? article?.cited_by_count ?? article?.citations ?? 0
);

const getCountryName = (countryCode, language) => {
  if (!countryCode) return '';
  try {
    return new Intl.DisplayNames([language], { type: 'region' }).of(
      String(countryCode).trim().toUpperCase()
    ) || '';
  } catch {
    return '';
  }
};

function WorksTimeline({ data, t }) {
  if (data.length === 0) {
    return <div className="institution-empty-compact">{t('institutionNoTimelineData')}</div>;
  }

  const max = Math.max(...data.map((item) => item.count), 1);
  return (
    <div className="institution-timeline" aria-label={t('institutionWorksByYear')}>
      {data.map((item) => (
        <div className="institution-timeline-column" key={item.year}>
          <span className="institution-timeline-value">{item.count}</span>
          <div className="institution-timeline-track">
            <span style={{ height: `${Math.max((item.count / max) * 100, 4)}%` }} />
          </div>
          <span className="institution-timeline-year">{item.year}</span>
        </div>
      ))}
    </div>
  );
}

export default function InstitutionDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fallbackName = searchParams.get('name') || '';
  const fallbackCountry = searchParams.get('country') || '';
  const fallbackCountryCode = searchParams.get('country_code') || '';
  const fallbackInstitutionType = searchParams.get('type') || '';
  const [institution, setInstitution] = useState(null);
  const [articles, setArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState('citations');

  useEffect(() => {
    let active = true;

    const loadInstitution = async () => {
      setLoading(true);
      setError('');
      try {
        const [institutionResponse, articlesResponse] = await Promise.all([
          getInstitutionByIdApi(id),
          getArticlesListApi({
            scope: 'vn_universities',
            institution_id: id,
            page: 1,
            limit: 100,
            sortBy: 'citation_count',
            sortOrder: 'desc',
          }),
        ]);

        if (!active) return;

        const matchedInstitution = institutionResponse?.data?.data || null;
        const articlePayload = articlesResponse?.data?.data || {};
        const articleItems = extractItems(articlePayload);

        setInstitution(matchedInstitution || (fallbackName ? {
          id,
          display_name: fallbackName,
          country_name: fallbackCountry,
          country_code: fallbackCountryCode,
          institution_type: fallbackInstitutionType,
        } : null));
        setArticles(articleItems);
        setTotalArticles(Number(articlePayload?.pagination?.total ?? articleItems.length));
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError?.response?.data?.message
          || requestError?.message
          || t('institutionLoadError')
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) loadInstitution();
    return () => {
      active = false;
    };
  }, [id, fallbackName, fallbackCountry, fallbackCountryCode, fallbackInstitutionType, t]);

  const language = i18n.resolvedLanguage || i18n.language || 'en';
  const institutionName = getInstitutionName(institution, fallbackName, t('institutionUnknown'));
  const countryCode = institution?.country_code || '--';
  const country = institution?.country_name
    || institution?.country
    || getCountryName(institution?.country_code, language)
    || t('institutionUnknown');
  const rawInstitutionType = institution?.type || institution?.institution_type;
  const institutionType = rawInstitutionType === 'education'
    ? t('institutionTypeEducation')
    : (rawInstitutionType || t('institutionTypeDefault'));
  const citationTotal = useMemo(
    () => articles.reduce((sum, article) => sum + getArticleCitations(article), 0),
    [articles]
  );
  const openAccessTotal = useMemo(
    () => articles.filter((article) => article.is_open_access || article.open_access).length,
    [articles]
  );

  const timeline = useMemo(() => {
    const counts = articles.reduce((result, article) => {
      const year = Number(article.publication_year || article.year);
      if (year) result[year] = (result[year] || 0) + 1;
      return result;
    }, {});
    return Object.entries(counts)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year)
      .slice(-10);
  }, [articles]);

  const researchFields = useMemo(() => {
    const counts = {};
    articles.forEach((article) => {
      const values = [
        ...(Array.isArray(article.topics) ? article.topics : []),
        ...(Array.isArray(article.subject_areas) ? article.subject_areas : []),
        article.topic_name,
        article.primary_topic_name,
      ];
      const articleFieldNames = new Set();
      values.forEach((value) => {
        const name = value?.display_name || value?.name || value?.topic_name || value;
        if (typeof name === 'string' && name.trim()) {
          articleFieldNames.add(name.trim());
        }
      });
      articleFieldNames.forEach((name) => {
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [articles]);

  const topAuthors = useMemo(() => {
    const authors = {};
    articles.forEach((article) => {
      if (!Array.isArray(article.authors)) return;
      article.authors.forEach((author) => {
        const name = author.display_name || author.full_name || author.name;
        if (!name) return;
        const authorId = author.author_id || author.id;
        const key = authorId || name;
        authors[key] = {
          id: authorId,
          name,
          count: (authors[key]?.count || 0) + 1,
        };
      });
    });
    return Object.values(authors).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [articles]);

  const sortedArticles = useMemo(() => {
    const result = [...articles];
    if (sortKey === 'year') {
      return result.sort((a, b) => (
        Number(b.publication_year || b.year || 0) - Number(a.publication_year || a.year || 0)
      ));
    }
    if (sortKey === 'title') {
      return result.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
    }
    return result.sort((a, b) => getArticleCitations(b) - getArticleCitations(a));
  }, [articles, sortKey]);

  const openArticleDetail = (articleId) => {
    if (!articleId) return;
    const institutionPath = `/institutions/${id}${fallbackName ? `?name=${encodeURIComponent(fallbackName)}` : ''}`;
    navigate(`/trending/articles/${articleId}?returnTo=${encodeURIComponent(institutionPath)}`);
  };

  return (
    <div className="institution-detail-page">
      <Header />
      <Container fluid className="institution-page-container">
        <nav className="institution-breadcrumb" aria-label="Breadcrumb">
          <button type="button" onClick={() => navigate('/')}>{t('institutionOverview')}</button>
          <Icon icon="lucide:chevron-right" width="14" />
          <button type="button" onClick={() => navigate('/trending-vn')}>{t('institutionResearchInstitutions')}</button>
          <Icon icon="lucide:chevron-right" width="14" />
          <span>{institutionName}</span>
        </nav>

        {loading ? (
          <div className="institution-loading" aria-live="polite">
            <div className="institution-hero-skeleton" />
            <Row className="g-4">
              {[1, 2, 3].map((item) => (
                <Col lg={4} key={item}><div className="institution-card-skeleton" /></Col>
              ))}
            </Row>
          </div>
        ) : error ? (
          <Card className="institution-state-card">
            <Icon icon="lucide:circle-alert" width="36" />
            <h1>{t('institutionProfileLoadError')}</h1>
            <p>{error}</p>
            <Button variant="outline-primary" onClick={() => window.location.reload()}>
              {t('institutionRetry')}
            </Button>
          </Card>
        ) : !institution && articles.length === 0 ? (
          <Card className="institution-state-card">
            <Icon icon="lucide:building-2" width="38" />
            <h1>{t('institutionNotFound')}</h1>
            <p>{t('institutionNotFoundHint')}</p>
            <Button variant="outline-primary" onClick={() => navigate('/trending-vn')}>
              {t('institutionBackToExplore')}
            </Button>
          </Card>
        ) : (
          <>
            <section className="institution-hero">
              <div className="institution-mark" aria-hidden="true">
                <Icon icon="lucide:landmark" width="38" />
              </div>
              <div className="institution-identity">
                <div className="institution-eyebrow">
                  <span>{t('institutionLabel')}</span>
                  <span>{countryCode}</span>
                </div>
                <h1>{institutionName}</h1>
                <p>
                  <Icon icon="lucide:map-pin" width="16" />
                  {country}
                  <span aria-hidden="true">·</span>
                  {institutionType}
                </p>
                {(institution?.ror_id || institution?.ror) && (
                  <a
                    href={`https://ror.org/${institution.ror_id || institution.ror}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ROR: {institution.ror_id || institution.ror}
                    <Icon icon="lucide:external-link" width="13" />
                  </a>
                )}
              </div>
              <div className="institution-hero-metrics">
                <div>
                  <strong>{totalArticles.toLocaleString(language)}</strong>
                  <span>{t('institutionScholarlyWorks')}</span>
                </div>
                <div>
                  <strong>{citationTotal.toLocaleString(language)}</strong>
                  <span>{t('institutionCitations')}</span>
                </div>
                <div>
                  <strong>{openAccessTotal.toLocaleString(language)}</strong>
                  <span>{t('institutionOpenAccess')}</span>
                </div>
              </div>
            </section>

            <Row className="g-4 institution-overview-row">
              <Col xs={12} lg={5}>
                <Card className="institution-panel h-100">
                  <Card.Header>
                    <Icon icon="lucide:chart-no-axes-column-increasing" width="18" />
                    {t('institutionWorksOverTime')}
                  </Card.Header>
                  <Card.Body><WorksTimeline data={timeline} t={t} /></Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={6} lg={4}>
                <Card className="institution-panel h-100">
                  <Card.Header>
                    <Icon icon="lucide:microscope" width="18" />
                    {t('institutionResearchFields')}
                  </Card.Header>
                  <Card.Body>
                    {researchFields.length > 0 ? (
                      <div className="institution-fields">
                        {researchFields.map((field) => (
                          <div key={field.name}>
                            <span>{field.name}</span>
                            <strong>{t('institutionArticleCount', { count: field.count })}</strong>
                          </div>
                        ))}
                      </div>
                    ) : <div className="institution-empty-compact">{t('institutionNoFieldData')}</div>}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Card className="institution-panel h-100">
                  <Card.Header>
                    <Icon icon="lucide:users" width="18" />
                    {t('institutionTopAuthors')}
                  </Card.Header>
                  <Card.Body>
                    {topAuthors.length > 0 ? (
                      <div className="institution-authors">
                        {topAuthors.map((author) => (
                          <button
                            type="button"
                            key={author.id || author.name}
                            disabled={!author.id}
                            onClick={() => navigate(`/authors/${author.id}`)}
                          >
                            <span>{author.name.charAt(0)}</span>
                            <span>
                              <strong>{author.name}</strong>
                              <small>{t('institutionWorkCount', { count: author.count })}</small>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : <div className="institution-empty-compact">{t('institutionNoAuthorData')}</div>}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="institution-panel institution-works-panel">
              <Card.Header className="institution-works-header">
                <div>
                  <Icon icon="lucide:library-big" width="18" />
                  <span>{t('institutionScholarlyWorks')}</span>
                  <Badge bg="light" text="dark">{totalArticles}</Badge>
                </div>
                <Form.Select
                  aria-label={t('institutionSortWorks')}
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value)}
                >
                  <option value="citations">{t('institutionMostCited')}</option>
                  <option value="year">{t('institutionNewest')}</option>
                  <option value="title">{t('institutionArticleTitle')}</option>
                </Form.Select>
              </Card.Header>
              <Card.Body className="p-0">
                {sortedArticles.length === 0 ? (
                  <div className="institution-works-empty">
                    <Icon icon="lucide:file-search" width="34" />
                    <strong>{t('institutionNoWorks')}</strong>
                    <span>{t('institutionNoWorksHint')}</span>
                  </div>
                ) : (
                  <div className="institution-work-list">
                    {sortedArticles.map((article, index) => {
                      const articleId = article.article_id || article.id;
                      const year = article.publication_year || article.year || '—';
                      const journal = article.journal_name || article.journal?.name || article.journal || t('institutionUnknownJournal');
                      return (
                        <article className="institution-work-item" key={articleId || `${article.title}-${index}`}>
                          <span className="institution-work-index">{String(index + 1).padStart(2, '0')}</span>
                          <div>
                            <button type="button" onClick={() => openArticleDetail(articleId)}>
                              {article.title || t('institutionUntitledWork')}
                            </button>
                            <div className="institution-work-meta">
                              <span>{journal}</span>
                              <span>{year}</span>
                              <span>{t('institutionCitationCount', { count: getArticleCitations(article) })}</span>
                              {(article.is_open_access || article.open_access) && (
                                <span className="institution-oa">
                                  <Icon icon="lucide:lock-keyhole-open" width="12" />
                                  {t('institutionOpenAccess')}
                                </span>
                              )}
                            </div>
                          </div>
                          <Icon icon="lucide:arrow-up-right" width="17" />
                        </article>
                      );
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
}
