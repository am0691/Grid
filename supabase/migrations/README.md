# GRID Database Migrations

This directory contains SQL migration files for the GRID web service database.

## Migration Files

### 001_initial_schema.sql
Initial database schema including:
- User profiles
- Souls (training subjects)
- Progress tracking
- Activity plans
- Activity recommendations

## Running Migrations

### Using Supabase CLI

```bash
# Initialize Supabase project (first time only)
supabase init

# Link to your Supabase project
supabase link --project-ref <your-project-ref>

# Run all pending migrations
supabase db push

# Or apply migrations manually
supabase db reset
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `001_initial_schema.sql`
4. Execute the SQL

## Schema Overview

### Tables

#### profiles
User profile information linked to Supabase Auth users.

**RLS**: Users can only view and modify their own profile.

#### souls
Represents individuals being trained (disciples or converts).

**RLS**: Users can only access souls they created.

#### progress
Tracks progress through different training areas and weeks.

**RLS**: Users can only access progress for their own souls.

#### activity_plans
Stores planned activities for each soul.

**RLS**: Users can only access activity plans for their own souls.

#### activity_recommendations
Template recommendations for activities (read-only for all authenticated users).

**RLS**: All authenticated users can read recommendations.

## Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only access their own data
- Activity recommendations are read-only for all authenticated users
- Proper foreign key relationships are enforced at the policy level

## Indexes

Performance indexes are created on:
- `souls`: user_id, training_type
- `progress`: soul_id, area_id
- `activity_plans`: soul_id, area_id, week

## Helper Functions

### get_current_week(soul_id, area_id)
Returns the current week number for a soul in a specific area.

### get_weeks_since_start(soul_id)
Calculates the number of weeks since the soul's start date.

## Seed Data

The migration includes sample activity recommendations for:
- Convert training (초신자): Bible Reading, Prayer
- Disciple training (제자): Bible Reading, Prayer, Evangelism

Each includes 3 weeks of initial recommendations.

## TypeScript Types

TypeScript type definitions are available in:
`/Users/seo/dev/Grid/app/src/infrastructure/database/schema.ts`

These types are automatically synced with the database schema.

## Testing Migrations

```bash
# Test migrations locally
supabase start
supabase db reset

# Check migration status
supabase migration list

# Create a new migration
supabase migration new <migration_name>
```

## Rollback

To rollback migrations:

```bash
# Reset database to clean state
supabase db reset

# Or manually drop tables (in reverse order)
DROP TABLE IF EXISTS activity_recommendations CASCADE;
DROP TABLE IF EXISTS activity_plans CASCADE;
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS souls CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS get_current_week(UUID, TEXT);
DROP FUNCTION IF EXISTS get_weeks_since_start(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Notes

- All timestamps use `timestamptz` (timezone-aware timestamps)
- UUIDs are used for primary keys
- `updated_at` fields are automatically updated via triggers
- Foreign key constraints use `ON DELETE CASCADE` for data integrity
- Unique constraints prevent duplicate entries

## Support

For issues or questions about the database schema, contact the development team.
