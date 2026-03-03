<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-05 | Updated: 2026-02-05 -->

# supabase

## Purpose

Supabase backend configuration and database schema for GRID - a discipleship management system that tracks the spiritual growth and training of converts and disciples through structured activity plans and progress monitoring.

## Directory Structure

```
supabase/
├── migrations/              # Database migration files
│   ├── 001_initial_schema.sql
│   └── README.md
├── SCHEMA_DIAGRAM.md        # Database entity relationship documentation
├── quick_setup.sql          # Quick setup script for Supabase SQL Editor
└── AGENTS.md               # This file
```

## Key Files

| File | Purpose |
|------|---------|
| `migrations/001_initial_schema.sql` | Complete database schema creation with tables, indexes, RLS policies, triggers, and seed data |
| `migrations/README.md` | Migration execution instructions and schema overview |
| `quick_setup.sql` | Simplified one-file setup for manual Supabase SQL Editor execution |
| `SCHEMA_DIAGRAM.md` | Entity relationship diagrams, table relationships, data flow, and indexing strategy |

## Database Schema Overview

### Tables

**profiles**
- Links to Supabase auth.users (1:1 relationship)
- Stores user profile data: email, full_name, avatar_url
- RLS: Users can only view/modify their own profile

**souls**
- Represents individuals being trained (training_type: 'convert' or 'disciple')
- Foreign key to profiles (1:N relationship)
- Fields: name, training_type, start_date, timestamps
- RLS: Users can only access souls they created

**progress**
- Tracks progress through training areas (bible_reading, prayer, church_attendance, fellowship, evangelism, discipleship)
- Foreign key to souls (1:N relationship)
- Tracks status: 'future' → 'current' → 'completed'
- Unique constraint: (soul_id, area_id, week)
- RLS: Users can only access progress for their own souls

**activity_plans**
- Stores planned activities for each soul
- Foreign key to souls (1:N relationship)
- Types: 'recommended' (from templates) or 'custom' (user-created)
- RLS: Users can only access activity plans for their own souls

**activity_recommendations**
- Template/reference table for activity suggestions
- Read-only for all authenticated users
- Indexed by (training_type, area_id, week)
- Includes: title, description, bible_verse, tips

### Row Level Security (RLS)

All tables have RLS enabled:
- **profiles**: SELECT/INSERT/UPDATE limited to self
- **souls**: All operations limited to own souls
- **progress**: All operations limited to own souls' progress
- **activity_plans**: All operations limited to own souls' plans
- **activity_recommendations**: SELECT only (all authenticated users)

### Indexes

Performance indexes are created on frequently queried columns:
- **souls**: user_id, training_type, composite (user_id, training_type)
- **progress**: soul_id, area_id, status, composite (soul_id, area_id)
- **activity_plans**: soul_id, area_id, week, is_completed, composite (soul_id, area_id, week)
- **activity_recommendations**: training_type, area_id, week, composite lookup

### Helper Functions

- `get_current_week(soul_id UUID, area_id TEXT) → INTEGER`
  Returns the current week number for a soul in a specific training area

- `get_weeks_since_start(soul_id UUID) → INTEGER`
  Calculates number of weeks since the soul's start_date

### Triggers

Auto-update `updated_at` timestamp on any UPDATE operation:
- `update_profiles_updated_at` on profiles table
- `update_souls_updated_at` on souls table
- `update_progress_updated_at` on progress table
- `update_activity_plans_updated_at` on activity_plans table

Auto-create profile when new auth user is created:
- `on_auth_user_created` trigger on auth.users table

## Data Flow

```
User Signs Up (via Supabase Auth)
    ↓
Profile Created (auto-trigger)
    ↓
User Creates Soul (초신자=convert or 제자=disciple)
    ↓
System Initializes Progress Records (one per area/week)
    ↓
User Views Activity Recommendations (template data)
    ↓
User Creates Activity Plans (from recommendations or custom)
    ↓
User Marks Progress/Activities Complete
    ↓
System Updates Progress Status (future → current → completed)
```

## Training Types

**Convert Training (초신자)**
- bible_reading (성경읽기)
- prayer (기도)
- church_attendance (교회출석)
- fellowship (교제)

**Disciple Training (제자)**
- bible_reading (성경읽기)
- prayer (기도)
- evangelism (전도)
- discipleship (양육)

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `migrations/` | SQL migration files for database schema deployment |

## For AI Agents

### Working In This Directory

1. **Before modifying schema:**
   - Review SCHEMA_DIAGRAM.md for complete ER diagram and relationships
   - Check existing RLS policies in 001_initial_schema.sql
   - Verify any new fields align with training_type logic

2. **Running migrations locally:**
   ```bash
   supabase start              # Start local Supabase
   supabase db reset          # Apply all migrations
   ```

3. **Deploying migrations:**
   ```bash
   supabase link --project-ref <ref>  # Connect to production
   supabase db push                    # Push pending migrations
   ```

4. **Creating new migrations:**
   - Never modify existing migration files (001_initial_schema.sql)
   - Create new migration: `supabase migration new <name>`
   - File naming: `NNN_description.sql` (auto-numbered)
   - Always include RLS policies for new tables

5. **Testing seed data:**
   - Run migrations with `supabase db reset`
   - Verify activity_recommendations are populated with sample data
   - Test RLS policies with test user accounts

### Schema Modification Guidelines

When adding or modifying schema:

1. **New tables** must have:
   - UUID primary key with `DEFAULT uuid_generate_v4()`
   - `created_at TIMESTAMPTZ DEFAULT NOW()`
   - `updated_at TIMESTAMPTZ DEFAULT NOW()`
   - RLS enabled with appropriate policies
   - Relevant indexes for query performance

2. **Relationships** should use:
   - Foreign key constraints with `ON DELETE CASCADE`
   - Composite unique constraints where needed (e.g., soul_id, area_id, week)

3. **Testing requirements**:
   - RLS policies must be tested with both authenticated and unauthenticated users
   - Foreign key cascades must be verified
   - Indexes must not conflict with unique constraints

### Common Patterns

**Querying user's own data (souls):**
```sql
SELECT * FROM souls
WHERE user_id = auth.uid();
```

**Querying user's soul's progress:**
```sql
SELECT p.* FROM progress p
JOIN souls s ON p.soul_id = s.id
WHERE s.user_id = auth.uid() AND p.area_id = 'bible_reading';
```

**Getting activity recommendations (read-only):**
```sql
SELECT * FROM activity_recommendations
WHERE training_type = 'convert' AND area_id = 'prayer' AND week = 1;
```

**Updating progress status:**
```sql
UPDATE progress
SET status = 'current', updated_at = NOW()
WHERE soul_id = $1 AND area_id = $2 AND week = $3
AND EXISTS (SELECT 1 FROM souls WHERE id = soul_id AND user_id = auth.uid());
```

### TypeScript Integration

Database types are automatically generated and synced:
- Location: `/Users/seo/dev/Grid/app/src/infrastructure/database/schema.ts`
- Generated from this schema via Supabase CLI
- Use in TypeScript code with proper type safety

## Dependencies

| Component | Purpose |
|-----------|---------|
| Supabase (PostgreSQL) | Database hosting and real-time capabilities |
| PostgreSQL UUID extension | Primary key generation |
| Supabase Auth | User authentication (auth.users table) |
| Row Level Security | Fine-grained access control |

## Environment Configuration

The Supabase project is configured via:
- **CLI config**: `supabase/config.toml` (if present)
- **Environment variables**: Injected at deployment time
- **Remote project**: Linked via `supabase link --project-ref`

## Testing Migrations

```bash
# Local testing
supabase start
supabase db reset

# Check migration status
supabase migration list

# Reset to clean state
supabase db reset

# Interactive development
supabase sql <file>
```

## Rollback Strategy

To rollback migrations if needed:

```bash
# Complete database reset
supabase db reset

# Manual rollback (if necessary)
DROP TABLE IF EXISTS activity_recommendations CASCADE;
DROP TABLE IF EXISTS activity_plans CASCADE;
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS souls CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS get_current_week(UUID, TEXT);
DROP FUNCTION IF EXISTS get_weeks_since_start(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Key Technical Notes

- All timestamps use `TIMESTAMPTZ` (timezone-aware)
- All IDs use UUID type for security and scalability
- `updated_at` fields are automatically maintained via triggers
- Foreign key constraints use `ON DELETE CASCADE` for referential integrity
- Status fields use CHECK constraints to enforce valid values
- Unique constraints prevent duplicate records at the database level
- RLS policies use correlated subqueries to check ownership
- Indexes use composite keys for complex query optimization

## Support & References

- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Row Level Security Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Migrations Guide**: https://supabase.com/docs/guides/cli/managing-migrations

<!-- MANUAL: -->
- **Project Contact**: See root AGENTS.md for team information
- **Database Schema Questions**: Refer to SCHEMA_DIAGRAM.md for complete ER diagrams
