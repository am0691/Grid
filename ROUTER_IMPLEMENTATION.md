# Router Configuration Implementation

## Files Created/Modified

### 1. `/app/src/presentation/routes/constants.ts` (NEW)
- Centralized route path constants
- Type-safe route generators with parameters
- Routes include:
  - Public: HOME, LOGIN, SIGNUP
  - Protected: SOULS, SOUL_DETAIL, SOUL_GRID, SOUL_CARE, SOUL_TIMELINE, INSIGHTS, SETTINGS

### 2. `/app/src/presentation/routes/index.tsx` (MODIFIED)
- React Router v7 configuration with nested routes
- Public routes: /login, /signup with redirect logic for authenticated users
- Protected routes wrapped in ProtectedRoute + MainLayout
- Nested soul detail routes under SoulDetailLayout:
  - `/souls/:soulId` → SoulOverviewPage (index)
  - `/souls/:soulId/grid` → SoulGridPage
  - `/souls/:soulId/care` → SoulCarePage
  - `/souls/:soulId/timeline` → SoulTimelinePage

## Route Structure

```
/                           → DashboardPage (protected)
/login                      → LoginPage (public)
/signup                     → SignupPage (public)
/souls                      → SoulsListPage (protected)
/souls/:soulId              → SoulOverviewPage (protected, nested)
/souls/:soulId/grid         → SoulGridPage (protected, nested)
/souls/:soulId/care         → SoulCarePage (protected, nested)
/souls/:soulId/timeline     → SoulTimelinePage (protected, nested)
/insights                   → InsightsPage (protected)
/settings                   → SettingsPage (protected)
```

## Dependencies Required

The following components need to be created for the router to function:

### Layouts
- `MainLayout` - Main application layout with header/sidebar
- `SoulDetailLayout` - Layout for soul detail pages with nested routing

### Pages
- `DashboardPage` - Main dashboard (can migrate existing Dashboard component)
- `SoulsListPage` - List of all souls
- `SoulOverviewPage` - Soul detail overview
- `SoulGridPage` - Soul grid view
- `SoulCarePage` - Soul pastoral care view
- `SoulTimelinePage` - Soul timeline view
- `InsightsPage` - Analytics/insights page
- `SettingsPage` - Application settings

## Notes

- All protected routes use `ProtectedRoute` wrapper for authentication
- Public routes redirect to home if user is authenticated
- MainLayout wraps all protected routes for consistent UI
- SoulDetailLayout provides nested routing context for soul-specific pages
- Route constants provide type-safe path generation
