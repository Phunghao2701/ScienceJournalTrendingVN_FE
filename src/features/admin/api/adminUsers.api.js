/**
 * Admin Users API: endpoints for listing, fetching, creating, and updating admin-managed user accounts.
 *
 * File: src/features/admin/api/adminUsers.api.js
 */
import api from '../../../shared/services/api';

export const getAdminUsers = (params = {}) => {
  return api.get('/admin/users', { params });
};

export const getAdminUserById = (id) => {
  return api.get(`/admin/users/${id}`);
};

export const createAdminUser = (data) => {
  return api.post('/admin/users', data);
};

export const updateAdminUser = (id, data) => {
  return api.put(`/admin/users/${id}`, data);
};
