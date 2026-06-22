/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\catalog\hooks\useCatalog.js
 */
import { useState, useCallback } from 'react';
import { getSubjectAreasApi, getSubjectCategoriesApi } from '../api/catalogApi';

export default function useCatalog() {
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [subjectCategories, setSubjectCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubjectAreas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSubjectAreasApi();
      if (response.data && response.data.success !== false) {
        setSubjectAreas(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch subject areas');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSubjectCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSubjectCategoriesApi();
      if (response.data && response.data.success !== false) {
        setSubjectCategories(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch subject categories');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    subjectAreas,
    subjectCategories,
    isLoading,
    error,
    fetchSubjectAreas,
    fetchSubjectCategories,
  };
}
