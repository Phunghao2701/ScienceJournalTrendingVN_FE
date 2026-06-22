/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\hooks\useSandboxSearch.js
 */
import { useState } from 'react';
import { searchGlobalApi } from '../api/landingApi';

/**
 * Custom hook to coordinate states and logic for the Sandbox search.
 * It manages search inputs, loading states, and calls the backend search API.
 */
export default function useSandboxSearch() {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTagClick = (tag) => {
    setSearchValue(tag);
    setSearchResult(null);
    setError(null);
  };

  const handleSearchSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = searchValue.trim();
    if (!query) return;

    setIsLoading(true);
    setSearchResult(null);
    setError(null);

    try {
      // Execute the API request through the decoupled API wrapper
      const response = await searchGlobalApi(query);

      if (response.data && response.data.success !== false) {
        const items = response.data.data || [];
        setSearchResult({
          keyword: query,
          items: items,
          isRealData: true,
        });
      } else {
        throw new Error(response.data?.message || 'Không tìm thấy kết quả phù hợp');
      }
    } catch (err) {
      console.error('Backend API search failed:', err);
      setError(err.response?.data?.message || err.message);
      setSearchResult({
        keyword: query,
        items: [],
        isRealData: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchValue,
    setSearchValue,
    isLoading,
    searchResult,
    setSearchResult,
    error,
    setError,
    handleTagClick,
    handleSearchSubmit,
  };
}
