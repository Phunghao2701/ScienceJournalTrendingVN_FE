import api from '../../../shared/services/api';

export const getTrendingPublishersApi = (params = {}) => {
  return api.get('/publishers', { params });
};
