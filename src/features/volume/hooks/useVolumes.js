/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\volume\hooks\useVolumes.js
 */
import { useState, useCallback } from 'react';
import {
  getVolumesApi,
  createVolumeApi,
  updateVolumeApi,
  deleteVolumeApi,
  restoreVolumeApi,
} from '../api/volume.api';

export default function useVolumes() {
  const [volumes, setVolumes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVolumes = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getVolumesApi(params);
      if (response.data && response.data.success !== false) {
        setVolumes(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch volumes');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createVolume = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createVolumeApi(data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateVolume = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateVolumeApi(id, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteVolume = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteVolumeApi(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restoreVolume = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await restoreVolumeApi(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    volumes,
    pagination,
    isLoading,
    error,
    fetchVolumes,
    createVolume,
    updateVolume,
    deleteVolume,
    restoreVolume,
  };
}
