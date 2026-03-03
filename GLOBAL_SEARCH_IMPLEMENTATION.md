# Global Search Implementation

## Overview
Implemented a global search component with Cmd+K (Mac) / Ctrl+K (Windows/Linux) keyboard shortcut that searches across Souls, Activities, and Breakthroughs.

## Files Created

### 1. `/app/src/presentation/hooks/useGlobalSearch.ts`
Custom hook for global search logic with:
- **Debounced search** (300ms default)
- **Multi-store searching**: Searches across soulStore, activityPlanStore, and pastoralCareStore
- **Recent searches**: Saves last 5 searches to localStorage
- **Grouped results**: Returns results grouped by type (soul, activity, breakthrough)
- **Smart sorting**: Exact matches first, then by date (most recent)

**Exports:**
- `useGlobalSearch(options?)` - Main hook
- `SearchResult` - Result interface
- `SearchResultType` - Type union

### 2. `/app/src/presentation/components/Search/GlobalSearch.tsx`
Search UI component with:
- **Command palette UI**: Uses shadcn/ui Command components
- **Keyboard navigation**: Arrow keys to navigate, Enter to select
- **Recent searches**: Shows recent searches when no query
- **Visual indicators**: Icons for each result type, completion status for activities
- **Date formatting**: Korean locale date formatting
- **Navigation**: Navigates to result on selection

**Props:**
- `isOpen: boolean` - Controls dialog visibility
- `onClose: () => void` - Callback to close dialog

### 3. `/app/src/presentation/components/Search/index.ts`
Barrel export for Search components.

### 4. `/app/src/App.tsx` (Modified)
Added:
- Global keyboard shortcut listener (Cmd+K / Ctrl+K)
- GlobalSearch component integration
- State management for search dialog visibility

### 5. `/app/src/presentation/hooks/index.ts` (Modified)
Added export for `useGlobalSearch`.

## Features

### Search Functionality
- **Souls**: Searches by name
- **Activities**: Searches by title and description
- **Breakthroughs**: Searches by title and description

### User Experience
- **Keyboard shortcut**: Cmd+K (Mac) / Ctrl+K (Windows/Linux)
- **Debounced input**: 300ms delay to reduce excessive searching
- **Recent searches**: Last 5 searches saved to localStorage (`grid_recent_searches`)
- **Clear history**: Option to clear recent searches
- **Empty states**: Shows "검색 중..." while debouncing, "검색 결과가 없습니다" when no results
- **Grouped results**: Results organized by type with headings
- **Visual feedback**: Icons and status indicators for each result type

### Navigation
Search results link to:
- **Souls**: `/souls/{soulId}`
- **Activities**: `/souls/{soulId}?activityId={activityId}`
- **Breakthroughs**: `/souls/{soulId}?breakthroughId={breakthroughId}`

## Technical Details

### Dependencies
- `react` - State management and hooks
- `react-router-dom` - Navigation
- `date-fns` - Date formatting with Korean locale
- `lucide-react` - Icons (User, Calendar, Sparkles, Clock, CheckCircle2, Circle)
- `cmdk` - Command palette UI (via shadcn/ui)
- `zustand` - State stores (soulStore, activityPlanStore, pastoralCareStore)

### Type Safety
- Full TypeScript implementation
- Exported interfaces for SearchResult and SearchResultType
- Type-safe store access

### Performance
- Debounced search to reduce re-renders
- Memoized search results and grouped results
- Efficient localStorage operations with error handling

## Usage

### For Users
1. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) anywhere in the app
2. Type search query
3. Use arrow keys to navigate results or click with mouse
4. Press Enter or click to navigate to result
5. Recent searches appear when search box is empty

### For Developers
```typescript
// Using the hook directly
import { useGlobalSearch } from '@/presentation/hooks/useGlobalSearch';

function MyComponent() {
  const { query, setQuery, results, groupedResults } = useGlobalSearch({
    debounceMs: 500 // Optional: customize debounce delay
  });

  // Access results
  console.log(results); // All results
  console.log(groupedResults.soul); // Only soul results
}
```

## Future Enhancements
- Add search filters (by type, date range)
- Add search highlighting in results
- Add keyboard shortcuts for navigating between result groups
- Add search analytics
- Add fuzzy search for better matching
- Add search result previews
