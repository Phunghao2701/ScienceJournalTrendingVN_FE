/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\zone\hooks\useZoneStats.js
 */
import { useState, useCallback } from 'react';
import { 
  getCountryStatsApi, 
  getRegionStatsApi, 
  getCountryRegionStatsApi 
} from '../api/zone.api';

export default function useZoneStats() {
  const [countryStats, setCountryStats] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [regions, setRegions] = useState([]);
  const [globalRegions, setGlobalRegions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingGlobalRegions, setLoadingGlobalRegions] = useState(false);

  const [errorCountries, setErrorCountries] = useState(null);
  const [errorRegions, setErrorRegions] = useState(null);
  const [errorGlobalRegions, setErrorGlobalRegions] = useState(null);

  const fetchCountryStats = useCallback(async (params) => {
    setLoadingCountries(true);
    setErrorCountries(null);
    try {
      const response = await getCountryStatsApi(params);
      if (response.data && response.data.success !== false) {
        setCountryStats(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch country stats');
      }
    } catch (err) {
      setErrorCountries(err.response?.data?.message || err.message);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  const fetchCountryRegions = useCallback(async (code) => {
    if (!code) return;
    setLoadingRegions(true);
    setErrorRegions(null);
    try {
      const response = await getCountryRegionStatsApi(code);
      if (response.data && response.data.success !== false) {
        setRegions(response.data.data?.regions || []);
        if (response.data.data?.country) {
          setSelectedCountry(response.data.data.country);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch region stats for country');
      }
    } catch (err) {
      setErrorRegions(err.response?.data?.message || err.message);
    } finally {
      setLoadingRegions(false);
    }
  }, []);

  const fetchGlobalRegions = useCallback(async (params) => {
    setLoadingGlobalRegions(true);
    setErrorGlobalRegions(null);
    try {
      const response = await getRegionStatsApi(params);
      if (response.data && response.data.success !== false) {
        setGlobalRegions(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch global region stats');
      }
    } catch (err) {
      setErrorGlobalRegions(err.response?.data?.message || err.message);
    } finally {
      setLoadingGlobalRegions(false);
    }
  }, []);

  return {
    countryStats,
    pagination,
    regions,
    globalRegions,
    selectedCountry,
    setSelectedCountry,
    loadingCountries,
    loadingRegions,
    loadingGlobalRegions,
    errorCountries,
    errorRegions,
    errorGlobalRegions,
    fetchCountryStats,
    fetchCountryRegions,
    fetchGlobalRegions,
  };
}
