/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\project\hooks\useProjectDetails.js
 */
import { useState, useCallback } from 'react';
import {
  getProjectByIdApi,
  updateProjectApi,
  getRelatedArticlesApi,
  getProjectAnalyticsApi,
  getTrendingKeywordsApi,
  getWatchedKeywordArticlesApi,
  watchKeywordsApi,
  updateWatchedKeywordsApi,
  unwatchKeywordApi,
} from '../api/project.api';

export default function useProjectDetails(projectId) {
  const [project, setProject] = useState(null);
  const [articles, setArticles] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [watchedArticles, setWatchedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProjectByIdApi(projectId);
      if (response.data && response.data.success !== false) {
        setProject(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch project details');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const updateProject = useCallback(async (updateData) => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateProjectApi(projectId, updateData);
      if (response.data && response.data.success !== false) {
        setProject(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data?.message || 'Failed to update project');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const fetchRelatedArticles = useCallback(async (limit = 5) => {
    if (!projectId) return;
    try {
      const response = await getRelatedArticlesApi(projectId, limit);
      if (response.data && response.data.success !== false) {
        setArticles(response.data.data || []);
      }
    } catch (err) {
      console.error('Fetch related articles failed:', err);
    }
  }, [projectId]);

  const fetchAnalytics = useCallback(async () => {
    if (!projectId) return;
    try {
      const response = await getProjectAnalyticsApi(projectId);
      if (response.data && response.data.success !== false) {
        setAnalytics(response.data.data);
      }
    } catch (err) {
      console.error('Fetch project analytics failed:', err);
    }
  }, [projectId]);

  const fetchTrendingKeywords = useCallback(async (limit = 20, sortBy = 'count') => {
    if (!projectId) return;
    try {
      const response = await getTrendingKeywordsApi(projectId, limit, sortBy);
      if (response.data) {
        setTrendingKeywords(response.data.keywords || []);
      }
    } catch (err) {
      console.error('Fetch trending keywords failed:', err);
    }
  }, [projectId]);

  const fetchWatchedArticles = useCallback(async () => {
    if (!projectId) return;
    try {
      const response = await getWatchedKeywordArticlesApi(projectId);
      if (response.data && response.data.success !== false) {
        setWatchedArticles(response.data.data || []);
      }
    } catch (err) {
      console.error('Fetch watched articles failed:', err);
    }
  }, [projectId]);

  const watchKeywords = useCallback(async (keywordsList) => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await watchKeywordsApi(projectId, keywordsList);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const updateWatchedKeywords = useCallback(async (keywordsList) => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateWatchedKeywordsApi(projectId, keywordsList);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const unwatchKeyword = useCallback(async (keywordId) => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await unwatchKeywordApi(projectId, keywordId);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  return {
    project,
    articles,
    analytics,
    trendingKeywords,
    watchedArticles,
    isLoading,
    error,
    fetchProjectDetails,
    updateProject,
    fetchRelatedArticles,
    fetchAnalytics,
    fetchTrendingKeywords,
    fetchWatchedArticles,
    watchKeywords,
    updateWatchedKeywords,
    unwatchKeyword,
  };
}
