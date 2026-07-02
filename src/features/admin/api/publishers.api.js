/**
 * Publishers API: CRUD and restore endpoints for publisher records.
 *
 * File: src/features/admin/api/publishers.api.js
 */
import api from '../../../shared/services/api';

export const getPublishers = (params = {}) => {
  return api.get('/publishers', { params });
};

export const getPublisherById = (id) => {
  return api.get(`/publishers/${id}`);
};

export const createPublisher = (data) => {
  return api.post('/publishers', data);
};

export const updatePublisher = (id, data) => {
  return api.put(`/publishers/${id}`, data);
};

export const deletePublisher = (id) => {
  return api.delete(`/publishers/${id}`);
};

export const restorePublisher = (id) => {
  return api.patch(`/publishers/${id}/restore`);
};
