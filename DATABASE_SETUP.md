# GRID Database Setup Complete

## Created Files

### 1. SQL Migration
**File**: `/Users/seo/dev/Grid/supabase/migrations/001_initial_schema.sql`
- 359 lines of SQL
- Complete database schema with all tables, indexes, RLS policies
- Helper functions for common operations
- Seed data with sample activity recommendations

### 2. TypeScript Schema
**File**: `/Users/seo/dev/Grid/app/src/infrastructure/database/schema.ts`
- 332 lines of TypeScript
- Complete type definitions matching SQL schema
- Insert/Update types for all tables
- Relation types with joins
- Query filter types
- Database interface for Supabase client
- Training area constants and utilities

### 3. Infrastructure Index
**File**: `/Users/seo/dev/Grid/app/src/infrastructure/database/index.ts`
- Central export point for database types
- Convenient re-exports of commonly used types

### 4. Migration Documentation
**File**: `/Users/seo/dev/Grid/supabase/migrations/README.md`
- Complete migration documentation
- Instructions for running migrations
- Schema overview and RLS policies
- Testing and rollback procedures

## Database Schema Overview

### Tables Created

1. **profiles** - User profiles (linked to Supabase Auth)
   - id, email, full_name, avatar_url
   - RLS: Users can only access their own profile

2. **souls** - Training subjects (disciples/converts)
   - id, user_id, name, training_type, start_date
   - RLS: Users can only access their own souls

3. **progress** - Weekly progress tracking
   - id, soul_id, area_id, week, status, completed_at, memo
   - RLS: Users can only access progress for their souls

4. **activity_plans** - Planned activities
   - id, soul_id, area_id, week, plan_type, title, description, is_completed
   - RLS: Users can only access plans for their souls

5. **activity_recommendations** - Activity templates
   - id, training_type, area_id, week, title, description, bible_verse, tips
   - RLS: All authenticated users can read

### Key Features

- **Row Level Security (RLS)** enabled on all tables
- **Automatic timestamps** via triggers (updated_at)
- **Foreign key cascades** for data integrity
- **Unique constraints** to prevent duplicates
- **Performance indexes** on frequently queried columns
- **Helper functions** for common calculations
- **Seed data** with sample recommendations

### Training Types

- **convert** (초신자): Bible Reading, Prayer, Church Attendance, Fellowship
- **disciple** (제자): Bible Reading, Prayer, Evangelism, Discipleship

## Next Steps

### 1. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 2. Initialize Supabase Project

```bash
cd /Users/seo/dev/Grid
supabase init
```

### 3. Link to Your Supabase Project

```bash
supabase link --project-ref <your-project-ref>
```

### 4. Run Migration

```bash
# Push migration to Supabase
supabase db push

# Or reset database and apply all migrations
supabase db reset
```

### 5. Configure Supabase Client in Your App

Create a `.env` file in `/Users/seo/dev/Grid/app/`:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 6. Import Types in Your Code

```typescript
import {
  Soul,
  Progress,
  ActivityPlan,
  TrainingType,
  TRAINING_AREAS,
  getTrainingAreas,
} from './infrastructure/database';
```

## Database Functions Available

### get_current_week(soul_id, area_id)
Returns the current week number for a soul in a specific area.

```sql
SELECT get_current_week('soul-uuid', 'bible_reading');
```

### get_weeks_since_start(soul_id)
Calculates weeks since the soul's start date.

```sql
SELECT get_weeks_since_start('soul-uuid');
```

## Sample Queries

### Create a new soul
```typescript
const { data, error } = await supabase
  .from('souls')
  .insert({
    user_id: userId,
    name: '홍길동',
    training_type: 'convert',
    start_date: '2026-01-29',
  })
  .select()
  .single();
```

### Get all souls for current user
```typescript
const { data, error } = await supabase
  .from('souls')
  .select('*, profile:profiles(*)')
  .eq('user_id', userId);
```

### Track progress
```typescript
const { data, error } = await supabase
  .from('progress')
  .insert({
    soul_id: soulId,
    area_id: 'bible_reading',
    week: 1,
    status: 'current',
  });
```

### Get activity recommendations
```typescript
const { data, error } = await supabase
  .from('activity_recommendations')
  .select('*')
  .eq('training_type', 'convert')
  .eq('area_id', 'prayer')
  .eq('week', 1);
```

## Security Notes

- All tables have RLS enabled
- Users can only access their own data
- Auth integration with Supabase Auth (auth.users)
- Foreign key constraints enforce data integrity
- Cascade deletes prevent orphaned records

## Support

For issues or questions:
1. Check the migration README: `/Users/seo/dev/Grid/supabase/migrations/README.md`
2. Review TypeScript types: `/Users/seo/dev/Grid/app/src/infrastructure/database/schema.ts`
3. Consult Supabase documentation: https://supabase.com/docs

---

**Database Schema Version**: 001
**Created**: 2026-01-29
**Status**: Ready for deployment
