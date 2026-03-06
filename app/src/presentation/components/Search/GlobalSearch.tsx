/**
 * Global Search Component
 * Triggered by Cmd+K / Ctrl+K
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  User,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useGlobalSearch, type SearchResultType } from '@/presentation/hooks/useGlobalSearch';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';

export interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESULT_TYPE_LABELS: Record<SearchResultType, string> = {
  soul: '영혼',
  activity: '활동',
  breakthrough: '돌파',
};

const RESULT_TYPE_ICONS: Record<SearchResultType, React.ComponentType<{ className?: string }>> = {
  soul: User,
  activity: Calendar,
  breakthrough: Sparkles,
};

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    groupedResults,
    isSearching,
    recentSearches,
    saveSearch,
    clearRecentSearches,
  } = useGlobalSearch();

  const handleSelect = (url: string) => {
    saveSearch(query);
    navigate(url);
    onClose();
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy.MM.dd', { locale: ko });
    } catch {
      return '';
    }
  };

  const hasResults = Object.values(groupedResults).some((group) => group.length > 0);

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={onClose}
      title="검색"
      description="영혼, 활동, 돌파를 검색하세요"
      showCloseButton={false}
    >
      <CommandInput
        placeholder="영혼, 활동, 돌파 검색..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {!query && recentSearches.length > 0 && (
          <>
            <CommandGroup heading="최근 검색">
              {recentSearches.map((search, index) => (
                <CommandItem
                  key={index}
                  value={`recent-${search}`}
                  onSelect={() => handleRecentSearchClick(search)}
                >
                  <Clock className="mr-2 h-4 w-4 opacity-50" />
                  <span>{search}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={clearRecentSearches}
                className="text-muted-foreground text-sm"
              >
                최근 검색 기록 지우기
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {query && !isSearching && !hasResults && (
          <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        )}

        {query && isSearching && (
          <CommandEmpty>검색 중...</CommandEmpty>
        )}

        {/* Souls */}
        {groupedResults.soul.length > 0 && (
          <CommandGroup heading={RESULT_TYPE_LABELS.soul}>
            {groupedResults.soul.map((result) => {
              const Icon = RESULT_TYPE_ICONS[result.type];
              return (
                <CommandItem
                  key={result.id}
                  value={result.title}
                  onSelect={() => handleSelect(result.url)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{result.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {result.subtitle}
                      {result.metadata?.date && ` • ${formatDate(result.metadata.date)}`}
                    </span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Activities */}
        {groupedResults.activity.length > 0 && (
          <>
            {groupedResults.soul.length > 0 && <CommandSeparator />}
            <CommandGroup heading={RESULT_TYPE_LABELS.activity}>
              {groupedResults.activity.map((result) => {
                const Icon = RESULT_TYPE_ICONS[result.type];
                const isCompleted = result.metadata?.status === '완료';
                const StatusIcon = isCompleted ? CheckCircle2 : Circle;

                return (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result.url)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.title}</span>
                        <StatusIcon
                          className={`h-3 w-3 ${
                            isCompleted ? 'text-growth' : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {result.subtitle}
                        {result.metadata?.date && ` • ${formatDate(result.metadata.date)}`}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

        {/* Breakthroughs */}
        {groupedResults.breakthrough.length > 0 && (
          <>
            {(groupedResults.soul.length > 0 || groupedResults.activity.length > 0) && (
              <CommandSeparator />
            )}
            <CommandGroup heading={RESULT_TYPE_LABELS.breakthrough}>
              {groupedResults.breakthrough.map((result) => {
                const Icon = RESULT_TYPE_ICONS[result.type];
                return (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result.url)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{result.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {result.subtitle}
                        {result.metadata?.date && ` • ${formatDate(result.metadata.date)}`}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
