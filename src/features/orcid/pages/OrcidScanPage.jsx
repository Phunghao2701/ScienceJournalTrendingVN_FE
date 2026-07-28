import { useCallback, useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Header from '../../landing/components/Header';
import ErrorState from '../../../shared/components/ErrorState';
import Icon from '../../../shared/components/Icon';
import OrcidScanForm from '../components/OrcidScanForm';
import OrcidScanProgress from '../components/OrcidScanProgress';
import OrcidScanResults from '../components/OrcidScanResults';
import useOrcidScan from '../hooks/useOrcidScan';
import { canReuseOrcidResult } from '../utils/orcid';
import './OrcidScanPage.css';

const parsePage = (value) => {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

export default function OrcidScanPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedKeyRef = useRef('');
  const resultsRef = useRef(null);

  const queryOrcid = searchParams.get('orcid') || '';
  const queryAuthorId = searchParams.get('author_id') || '';
  const queryJobId = searchParams.get('job') || '';
  const queryPage = parsePage(searchParams.get('page'));

  const {
    author,
    articles,
    pagination,
    scanJob,
    isScanning,
    isHydrating,
    isLoadingPage,
    scanError,
    pageError,
    scan,
    watchScanJob,
    loadArticlePage,
    hydrateFromDatabase,
  } = useOrcidScan();

  useEffect(() => {
    if (!queryJobId || scanJob?.job_id === queryJobId) return;
    watchScanJob(queryJobId);
  }, [queryJobId, scanJob?.job_id, watchScanJob]);

  useEffect(() => {
    if (
      scanJob?.isFailed
      || !scanJob?.author_id
      || queryAuthorId === scanJob.author_id
    ) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('orcid', scanJob.orcid || queryOrcid);
    nextParams.set('job', scanJob.job_id);
    nextParams.set('author_id', scanJob.author_id);
    nextParams.set('page', '1');
    requestedKeyRef.current = '';
    setSearchParams(nextParams, { replace: true });
    requestAnimationFrame(scrollToResults);
  }, [
    queryAuthorId,
    queryOrcid,
    scanJob,
    searchParams,
    setSearchParams,
  ]);

  const loadFromQuery = useCallback(async () => {
    if (!queryAuthorId || isScanning) return;

    const requestKey = `${queryAuthorId}:${queryPage}`;
    if (requestedKeyRef.current === requestKey) return;

    if (
      String(author?.author_id ?? author?.id ?? '') === String(queryAuthorId)
      && Number(pagination?.page ?? 1) === queryPage
    ) {
      requestedKeyRef.current = requestKey;
      return;
    }

    requestedKeyRef.current = requestKey;

    if (String(author?.author_id ?? author?.id ?? '') === String(queryAuthorId)) {
      await loadArticlePage(queryAuthorId, queryPage);
      return;
    }

    await hydrateFromDatabase(queryAuthorId, queryOrcid, queryPage);
  }, [
    author,
    hydrateFromDatabase,
    loadArticlePage,
    pagination?.page,
    isScanning,
    queryAuthorId,
    queryOrcid,
    queryPage,
  ]);

  useEffect(() => {
    loadFromQuery();
  }, [loadFromQuery]);

  const scrollToResults = () => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    resultsRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const handleSubmit = async (orcid) => {
    if (
      author
      && canReuseOrcidResult({
        submittedOrcid: orcid,
        currentOrcid: author.orcid || queryOrcid,
        authorId: queryAuthorId,
        isScanning,
      })
    ) {
      requestAnimationFrame(scrollToResults);
      return;
    }

    requestedKeyRef.current = '';
    const pendingParams = new URLSearchParams();
    pendingParams.set('orcid', orcid);
    setSearchParams(pendingParams, { replace: true });

    const result = await scan(orcid);
    if (!result?.job_id) return;

    const nextParams = new URLSearchParams();
    nextParams.set('orcid', orcid);
    nextParams.set('job', result.job_id);
    setSearchParams(nextParams, { replace: true });
  };

  const handlePageChange = (page) => {
    if (!queryAuthorId || page === Number(pagination?.page ?? 1)) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(page));
    requestedKeyRef.current = '';
    setSearchParams(nextParams);
    requestAnimationFrame(scrollToResults);
  };

  const handleRetryPage = () => {
    requestedKeyRef.current = '';
    loadFromQuery();
  };

  const hasResult = Boolean(author && queryAuthorId);
  const loadingResults = isHydrating || isLoadingPage;

  return (
    <div className="orcid-scan-page">
      <Header />
      <main>
        <Container className="orcid-scan-shell">
          <header className="orcid-scan-hero">
            <div className="orcid-scan-hero__icon" aria-hidden="true">
              <Icon icon="lucide:fingerprint" width="25" />
            </div>
            <div>
              <h1>{t('orcidScan.title')}</h1>
              <p>{t('orcidScan.description')}</p>
            </div>
          </header>

          <section className="orcid-scan-form-panel" aria-labelledby="orcid-form-title">
            <div>
              <h2 id="orcid-form-title">{t('orcidScan.formTitle')}</h2>
              <p>{t('orcidScan.formDescription')}</p>
              <p>{t('orcidScan.formPreservationNotice')}</p>
            </div>
            <OrcidScanForm
              initialValue={queryOrcid}
              isScanning={isScanning}
              onSubmit={handleSubmit}
            />
          </section>

          {isScanning && <OrcidScanProgress job={scanJob} />}

          {!isScanning && scanError && !hasResult && (
            <ErrorState
              title={t('orcidScan.scanErrorTitle')}
              message={scanError}
              className="orcid-scan-page-error"
            />
          )}

          {!isScanning && hasResult && (
            <div ref={resultsRef}>
              <OrcidScanResults
                author={author}
                articles={articles}
                pagination={pagination}
                isLoading={loadingResults}
                error={pageError}
                onRetry={handleRetryPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}
