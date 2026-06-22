/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\dashboard\api\dashboardApi.js
 */
import api from '../../../shared/services/api';

/**
 * Get list of user projects (stat cards & recent projects)
 * BE: GET /api/v1/projects  [requireAuth]
 */
export const getDashboardProjectsApi = () => api.get('/projects');

/**
 * Get project analytics / publication trend
 * BE: GET /api/v1/projects/:id/analytics  [requireAuth]
 */
export const getProjectAnalyticsApi = (projectId) =>
  api.get(`/projects/${projectId}/analytics`);

/**
 * Get trending keywords for a project
 * BE: GET /api/v1/projects/:id/keywords/trending  [requireAuth]
 * (via keyword route mounted under /projects)
 */
export const getTrendingKeywordsApi = (projectId, limit = 12) =>
  api.get(`/projects/${projectId}/keywords/trending`, { params: { limit } });

/**
 * Get top author leaderboard
 * BE: GET /api/v1/author/leaderboard  [requireAuth]
 */
export const getTopAuthorsApi = (limit = 5) =>
  api.get('/author/leaderboard', { params: { limit } });

/**
 * Get related articles for a project
 * BE: GET /api/v1/projects/:id/related-articles  [requireAuth]
 */
export const getRelatedArticlesApi = (projectId, limit = 5) =>
  api.get(`/projects/${projectId}/related-articles`, { params: { limit } });
