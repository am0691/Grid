/**
 * Global Search Hook
 * Searches across Souls, Activities, and PastoralLogs (breakthroughs)
 */

import { useMemo, useState, useEffect } from 'react';
import { useSoulStore } from '@/store/soulStore';
import { useActivityPlanStore } from '@/store/activityPlanStore';
import { usePastoralLogStore } from '@/store/pastoralLogStore';

export type SearchResultType = 'soul' | 'activity' | 'breakthrough';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  url: string;
  metadata?: {
    date?: string;
    status?: string;
    category?: string;
  };
}

export interface UseGlobalSearchOptions {
  debounceMs?: number;
}

export function useGlobalSearch(options: UseGlobalSearchOptions = {}) {
  const { debounceMs = 300 } = options;
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Stores
  const souls = useSoulStore((state) => state.souls);
  const activityPlans = useActivityPlanStore((state) => state.plans);
  const logs = usePastoralLogStore((state) => state.logs);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('grid_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Save search to recent searches
  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5); // Keep only last 5

    setRecentSearches(updated);
    try {
      localStorage.setItem('grid_recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore errors
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('grid_recent_searches');
    } catch {
      // Ignore errors
    }
  };

  // Search function
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return [];
    }

    const lowerQuery = debouncedQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search Souls
    souls.forEach((soul) => {
      if (soul.name.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: soul.id,
          type: 'soul',
          title: soul.name,
          subtitle: soul.trainingType === 'convert' ? '새가족 양육' : '제자 양육',
          url: `/souls/${soul.id}`,
          metadata: {
            date: soul.startDate,
          },
        });
      }
    });

    // Search Activity Plans (across all souls)
    Object.entries(activityPlans).forEach(([soulId, plans]) => {
      const soul = souls.find((s) => s.id === soulId);

      plans.forEach((plan) => {
        if (
          plan.title.toLowerCase().includes(lowerQuery) ||
          plan.description?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: plan.id,
            type: 'activity',
            title: plan.title,
            subtitle: soul ? `${soul.name}의 활동` : '활동',
            url: `/souls/${soulId}?activityId=${plan.id}`,
            metadata: {
              date: plan.createdAt,
              status: plan.status === 'completed' ? '완료' : '예정',
            },
          });
        }
      });
    });

    // Search PastoralLog breakthroughs
    Object.entries(logs).forEach(([soulId, soulLogs]) => {
      const soul = souls.find((s) => s.id === soulId);

      soulLogs.forEach((log) => {
        if (log.hasBreakthrough && log.breakthroughTitle) {
          if (
            log.breakthroughTitle.toLowerCase().includes(lowerQuery) ||
            (log.breakthroughDescription?.toLowerCase().includes(lowerQuery))
          ) {
            searchResults.push({
              id: `${log.id}-bt`,
              type: 'breakthrough',
              title: log.breakthroughTitle,
              subtitle: soul ? `${soul.name}의 돌파` : '돌파 기록',
              url: `/souls/${soulId}?logId=${log.id}`,
              metadata: {
                date: log.recordedAt,
                category: log.breakthroughCategory || undefined,
              },
            });
          }
        }
      });
    });

    // Sort by relevance (exact match first, then by date)
    return searchResults.sort((a, b) => {
      const aExact = a.title.toLowerCase() === lowerQuery;
      const bExact = b.title.toLowerCase() === lowerQuery;

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Sort by date (most recent first)
      const aDate = a.metadata?.date || '';
      const bDate = b.metadata?.date || '';
      return bDate.localeCompare(aDate);
    });
  }, [debouncedQuery, souls, activityPlans, logs]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<SearchResultType, SearchResult[]> = {
      soul: [],
      activity: [],
      breakthrough: [],
    };

    results.forEach((result) => {
      groups[result.type].push(result);
    });

    return groups;
  }, [results]);

  return {
    query,
    setQuery,
    results,
    groupedResults,
    isSearching: query !== debouncedQuery,
    recentSearches,
    saveSearch,
    clearRecentSearches,
  };
}
