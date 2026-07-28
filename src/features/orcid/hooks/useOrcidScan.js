import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getAuthorArticlesApi,
  getAuthorDetailApi,
} from '../../author/api/author.api';
import {
  getOrcidScanJobApi,
  scanOrcidApi,
} from '../api/orcid.api';
import {
  normalizeArticlePageResponse,
  normalizeAuthor,
  normalizeAuthorResponse,
  normalizeScanJobResponse,
} from '../utils/orcid';

const getApiErrorMessage = (error, fallback) => (
  error?.response?.data?.message
  ?? fallback
);

const initialPagination = () => ({
  page: 1,
  limit: 20,
  total: 0,
  total_pages: 1,
  has_next: false,
});

export default function useOrcidScan() {
  const { t } = useTranslation();
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [scanJob, setScanJob] = useState(null);
  const [activeJobId, setActiveJobId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [scanError, setScanError] = useState('');
  const [pageError, setPageError] = useState('');
  const scanInFlightRef = useRef(false);

  const watchScanJob = useCallback((jobId) => {
    if (!jobId) return;
    setActiveJobId(String(jobId));
    setIsScanning(true);
    setScanError('');
  }, []);

  const scan = useCallback(async (orcid) => {
    if (scanInFlightRef.current) return null;

    scanInFlightRef.current = true;
    setIsScanning(true);
    setScanError('');
    setPageError('');
    setScanJob(null);
    setAuthor(null);
    setArticles([]);
    setPagination(initialPagination());

    try {
      const response = await scanOrcidApi(orcid);
      const normalized = normalizeScanJobResponse(response.data);
      setScanJob(normalized);
      setActiveJobId(normalized.job_id);
      return normalized;
    } catch (error) {
      const busyJob = error?.response?.status === 409
        ? normalizeScanJobResponse(error.response.data)
        : null;
      if (busyJob?.job_id) {
        setScanJob(busyJob);
        setActiveJobId(busyJob.job_id);
        return busyJob;
      }

      setScanError(getApiErrorMessage(
        error,
        t('orcidScan.scanRequestError'),
      ));
      setIsScanning(false);
      return null;
    } finally {
      scanInFlightRef.current = false;
    }
  }, [t]);

  useEffect(() => {
    if (!activeJobId) return undefined;

    let cancelled = false;
    let timer;

    const poll = async () => {
      try {
        const response = await getOrcidScanJobApi(activeJobId);
        if (cancelled) return;

        const normalized = normalizeScanJobResponse(response.data);
        setScanJob(normalized);
        setScanError('');

        if (normalized.isTerminal) {
          setIsScanning(false);
          setActiveJobId('');
          if (normalized.isFailed) {
            setScanError(
              normalized.error?.message || t('orcidScan.scanRequestError'),
            );
            return;
          }
          return;
        }

        timer = window.setTimeout(poll, normalized.poll_after_ms);
      } catch (error) {
        if (cancelled) return;
        const status = error?.response?.status;
        if (status === 400 || status === 404) {
          setIsScanning(false);
          setActiveJobId('');
          setScanError(getApiErrorMessage(
            error,
            t('orcidScan.scanRequestError'),
          ));
          return;
        }

        timer = window.setTimeout(poll, 1500);
      }
    };

    poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeJobId, t]);

  const loadArticlePage = useCallback(async (authorId, page = 1) => {
    if (!authorId) return null;

    setIsLoadingPage(true);
    setPageError('');

    try {
      const response = await getAuthorArticlesApi(authorId, { page, limit: 20 });
      const normalized = normalizeArticlePageResponse(response.data, {
        page,
        limit: 20,
      });

      setArticles(normalized.articles);
      setPagination(normalized.pagination);
      return normalized;
    } catch (error) {
      setPageError(getApiErrorMessage(
        error,
        t('orcidScan.pageRequestError'),
      ));
      return null;
    } finally {
      setIsLoadingPage(false);
    }
  }, [t]);

  const hydrateFromDatabase = useCallback(async (authorId, orcid, page = 1) => {
    if (!authorId) return null;

    const fallbackAuthor = normalizeAuthor(null, {
      author_id: authorId,
      orcid,
    });

    setIsHydrating(true);
    setScanError('');
    setPageError('');
    setAuthor(fallbackAuthor);

    const [authorResult, articlesResult] = await Promise.allSettled([
      getAuthorDetailApi(authorId),
      getAuthorArticlesApi(authorId, { page, limit: 20 }),
    ]);

    let normalizedAuthor = fallbackAuthor;
    let normalizedArticles = null;

    if (authorResult.status === 'fulfilled') {
      normalizedAuthor = normalizeAuthorResponse(authorResult.value.data, {
        author_id: authorId,
        orcid,
      });
    }

    if (articlesResult.status === 'fulfilled') {
      normalizedArticles = normalizeArticlePageResponse(articlesResult.value.data, {
        page,
        limit: 20,
      });
    }

    setAuthor(normalizedAuthor);

    if (normalizedArticles) {
      setArticles(normalizedArticles.articles);
      setPagination(normalizedArticles.pagination);
    } else {
      setArticles([]);
      setPageError(getApiErrorMessage(
        articlesResult.reason,
        t('orcidScan.pageRequestError'),
      ));
    }

    if (authorResult.status === 'rejected' && articlesResult.status === 'rejected') {
      setScanError(getApiErrorMessage(
        authorResult.reason,
        t('orcidScan.databaseRequestError'),
      ));
    }

    setIsHydrating(false);
    return {
      author: normalizedAuthor,
      articles: normalizedArticles,
    };
  }, [t]);

  return {
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
  };
}
