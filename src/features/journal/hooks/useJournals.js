/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\journal\hooks\useJournals.js
 */
import { useState, useCallback } from 'react';
import {
  getJournalsApi,
  createJournalApi,
  updateJournalApi,
  deleteJournalApi,
  restoreJournalApi,
} from '../api/journal.api';

export default function useJournals() {
  const [journals, setJournals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJournals = useCallback(async (queryParam = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getJournalsApi(queryParam);
      if (response.data && response.data.success !== false) {
        // Assume data returns { data: [...], pagination: { page, limit, total } } or similar backend envelope
        setJournals(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch journals');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createJournal = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createJournalApi(data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateJournal = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateJournalApi(id, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteJournal = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteJournalApi(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restoreJournal = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await restoreJournalApi(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    journals,
    pagination,
    isLoading,
    error,
    fetchJournals,
    createJournal,
    updateJournal,
    deleteJournal,
    restoreJournal,
  };
}
