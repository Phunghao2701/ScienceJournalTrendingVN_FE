const STORAGE_KEY = 'rp_saved_queries';
const MAX_ITEMS = 50;

import { useState } from "react";

export function useSavedQueries() {
  const [queries, setQueries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  // Save a new query entry
  // throws Error("title_required") if title is empty
  const saveQuery = ({ title, description = "", filters }) => {
    if (!title?.trim()) throw new Error("title_required");
    const entry = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      filters: { ...filters },
      savedAt: new Date().toISOString(),
    };
    setQueries(prev => {
      const updated = [entry, ...prev].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  };

  const deleteQuery = (id) => {
    setQueries(prev => {
      const updated = prev.filter(q => q.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  };

  // Re-apply all filters from a saved query
  const applyQuery = (query, updateFilters) => {
    if (!query?.filters) return;
    const { search, sortBy, sortOrder, selectedYear, selectedJournal, selectedTopic, selectedAccess } = query.filters;
    const payload = {
      search,
      sortBy,
      sortOrder,
      year: selectedYear,
      journal: selectedJournal,
      topic: selectedTopic,
      access: selectedAccess,
    };
    // Remove undefined fields so we don't accidentally clear current sort/filter state
    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );
    updateFilters(cleanedPayload);
  };

  return { queries, saveQuery, deleteQuery, applyQuery };
}
