const STORAGE_KEY = 'rp_search_history';
const MAX_ITEMS = 20;

import { useState } from "react";

export function useSearchHistory() {
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // Add query to front, deduplicate, cap at MAX_ITEMS
  const addToHistory = (query) => {
    if (!query?.trim()) return;
    const trimmed = query.trim();
    setHistory(prev => {
      const deduped = prev.filter(q => q !== trimmed);
      const updated = [trimmed, ...deduped].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        /* storage full, ignore */
      }
      return updated;
    });
  };

  const removeFromHistory = (query) => {
    setHistory(prev => {
      const updated = prev.filter(q => q !== query);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setHistory([]);
  };

  return { history, addToHistory, removeFromHistory, clearHistory };
}
