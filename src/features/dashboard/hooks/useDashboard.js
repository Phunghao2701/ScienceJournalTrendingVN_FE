/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\dashboard\hooks\useDashboard.js
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getDashboardProjectsApi,
  getProjectAnalyticsApi,
  getTrendingKeywordsApi,
  getTopAuthorsApi,
} from '../api/dashboardApi';
import { getAuthorAreasBreakdownApi } from '../../author/api/author.api';

const normalizeAuthorBreakdown = (response) => {
  if (!response?.data || typeof response.data !== 'object') return [];
  const payload = response.data.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.breakdown)) return payload.breakdown;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getPrimarySubjectAreaFromBreakdown = (breakdown = []) => {
  if (!Array.isArray(breakdown) || breakdown.length === 0) return '';
  const primary = [...breakdown].sort((a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0))[0];
  return primary.category_name ?? primary.subject_area ?? primary.subject_area_name ?? primary.name ?? primary.display_name ?? '';
};

const normalizeTopAuthor = (author) => ({
  ...author,
  full_name: author.display_name ?? author.full_name ?? author.author_name ?? author.name ?? 'Unknown',
  article_count: author.article_count ?? author.papers ?? author.works_count ?? 0,
  citation_count: author.citation_count ?? author.citations ?? author.cited_by_count ?? 0,
});

/**
 * useDashboard — central data hook for the Dashboard/Tổng quan page.
 * Fetches projects, analytics, trending keywords and top authors in parallel.
 * Each section has independent loading/error state to avoid full-page crash.
 */
export default function useDashboard(currentUser) {
  const [projects, setProjects]               = useState([]);
  const [analytics, setAnalytics]             = useState(null);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [topAuthors, setTopAuthors]           = useState([]);

  const [loadingProjects,  setLoadingProjects]  = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingKeywords,  setLoadingKeywords]  = useState(false);
  const [loadingAuthors,   setLoadingAuthors]   = useState(false);

  const [errorProjects,  setErrorProjects]  = useState(null);
  const [errorAnalytics, setErrorAnalytics] = useState(null);
  const [errorKeywords,  setErrorKeywords]  = useState(null);
  const [errorAuthors,   setErrorAuthors]   = useState(null);

  // ── fetch helpers ────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    setErrorProjects(null);
    try {
      const res  = await getDashboardProjectsApi();
      const data = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(data) ? data : [];
      setProjects(list);
      return list;
    } catch (err) {
      const status = err.response?.status;
      setErrorProjects(
        status === 401
          ? 'Bạn cần đăng nhập để xem dashboard.'
          : err.response?.data?.message || err.message || 'Không thể tải projects.'
      );
      return [];
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoadingAnalytics(true);
    setErrorAnalytics(null);
    try {
      const res = await getProjectAnalyticsApi(projectId);
      setAnalytics(res.data?.data ?? res.data ?? null);
    } catch (err) {
      setErrorAnalytics(err.response?.data?.message || err.message || 'Không thể tải xu hướng.');
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const fetchKeywords = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoadingKeywords(true);
    setErrorKeywords(null);
    try {
      const res  = await getTrendingKeywordsApi(projectId, 12);
      const data = res.data?.data ?? res.data ?? [];
      setTrendingKeywords(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorKeywords(err.response?.data?.message || err.message || 'Không thể tải keywords.');
    } finally {
      setLoadingKeywords(false);
    }
  }, []);

  const fetchAuthors = useCallback(async () => {
    setLoadingAuthors(true);
    setErrorAuthors(null);
    try {
      const res  = await getTopAuthorsApi(5);
      const data = res.data?.data ?? res.data ?? [];
      const topAuthors = Array.isArray(data) ? data.slice(0, 5) : [];

      const breakdownResults = await Promise.allSettled(
        topAuthors.map(async (author) => {
          const id = author.author_id ?? author.id;
          if (!id) return { id: null, breakdown: [] };
          try {
            const breakdownResponse = await getAuthorAreasBreakdownApi(id);
            return { id, breakdown: normalizeAuthorBreakdown(breakdownResponse) };
          } catch (error) {
            return { id, breakdown: [] };
          }
        })
      );

      const breakdownMap = breakdownResults.reduce((acc, result, index) => {
        const author = topAuthors[index];
        const id = author?.author_id ?? author?.id;
        if (!id) return acc;
        acc[id] = result.status === 'fulfilled' ? result.value.breakdown : [];
        return acc;
      }, {});

      const enrichedAuthors = topAuthors.map((author) => {
        const normalized = normalizeTopAuthor(author);
        const id = normalized.author_id ?? normalized.id;
        const breakdown = id ? breakdownMap[id] || [] : [];
        const primary_subject_area = normalized.subject_area ?? normalized.field ?? normalized.area ?? getPrimarySubjectAreaFromBreakdown(breakdown);
        return {
          ...normalized,
          primary_subject_area,
        };
      });

      setTopAuthors(enrichedAuthors);
    } catch (err) {
      setErrorAuthors(err.response?.data?.message || err.message || 'Không thể tải top authors.');
    } finally {
      setLoadingAuthors(false);
    }
  }, []);

  // ── initialise on mount (only when user is logged in) ───────────────────
  useEffect(() => {
    if (!currentUser) {
      // Not logged in — still show skeleton briefly then empty state
      setLoadingProjects(false);
      setLoadingAnalytics(false);
      setLoadingKeywords(false);
      setLoadingAuthors(false);
      return;
    }

    const init = async () => {
      const [list] = await Promise.all([fetchProjects(), fetchAuthors()]);
      if (list && list.length > 0) {
        const firstId = list[0]?.project_id ?? list[0]?.id;
        if (firstId) {
          fetchAnalytics(firstId);
          fetchKeywords(firstId);
        } else {
          setLoadingAnalytics(false);
          setLoadingKeywords(false);
        }
      } else {
        setLoadingAnalytics(false);
        setLoadingKeywords(false);
      }
    };
    init();
  }, [currentUser, fetchProjects, fetchAuthors, fetchAnalytics, fetchKeywords]);

  // ── derived stat card data ───────────────────────────────────────────────
  const summaryStats = {
    projectCount:  projects.length,
    journalCount:  projects.reduce((acc, p) => acc + (p.journal_count  ?? p.journals?.length  ?? 0), 0),
    articleCount:  projects.reduce((acc, p) => acc + (p.article_count  ?? 0), 0),
    keywordCount:  projects.reduce((acc, p) => acc + (p.keyword_count  ?? 0), 0),
  };

  // ── refetch helpers exposed for retry buttons ───────────────────────────
  const refetchAll = useCallback(() => {
    if (!currentUser) return;
    const init = async () => {
      const [list] = await Promise.all([fetchProjects(), fetchAuthors()]);
      if (list?.length > 0) {
        const id = list[0]?.project_id ?? list[0]?.id;
        if (id) { fetchAnalytics(id); fetchKeywords(id); }
      }
    };
    init();
  }, [currentUser, fetchProjects, fetchAuthors, fetchAnalytics, fetchKeywords]);

  return {
    projects,
    analytics,
    trendingKeywords,
    topAuthors,
    summaryStats,

    loadingProjects,
    loadingAnalytics,
    loadingKeywords,
    loadingAuthors,

    errorProjects,
    errorAnalytics,
    errorKeywords,
    errorAuthors,

    refetchProjects:  fetchProjects,
    refetchAnalytics: fetchAnalytics,
    refetchKeywords:  fetchKeywords,
    refetchAuthors:   fetchAuthors,
    refetchAll,
  };
}
