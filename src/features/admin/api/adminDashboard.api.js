import api from '../../../shared/services/api';

export const getAdminDashboardSummary = () => {
  return api.get('/admin/dashboard/summary');
};

export const getAdminPublicationTrends = (params = {}) => {
  return api.get('/admin/dashboard/publication-trends', { params });
};

export const getAdminRecentActivities = (params = {}) => {
  return api.get('/admin/dashboard/recent-activities', { params });
};

export const getAdminVolumeIssueStatus = (params = {}) => {
  return api.get('/admin/dashboard/volume-issue-status', { params });
};

export const exportAdminVolumeIssueStatusCsv = (params = {}) => {
  return api.get('/admin/dashboard/volume-issue-status/export', {
    params,
    responseType: 'blob',
  });
};

export const getAdminJournalRepositorySummary = (journalId) => {
  return api.get(`/admin/repositories/journals/${journalId}/summary`);
};
