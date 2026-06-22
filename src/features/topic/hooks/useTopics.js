/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\topic\hooks\useTopics.js
 */
import { useState, useCallback } from 'react';
import { getTopicArticlesApi } from '../api/topic.api';

export default function useTopics() {
  const [topicArticles, setTopicArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTopicArticles = useCallback(async (topicId) => {
    if (!topicId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTopicArticlesApi(topicId);
      if (response.data && response.data.success !== false) {
        setTopicArticles(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch topic articles');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    topicArticles,
    isLoading,
    error,
    fetchTopicArticles,
  };
}
