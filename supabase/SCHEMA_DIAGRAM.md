# GRID Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────┐
│   auth.users        │ (Supabase Auth)
│   (managed by       │
│    Supabase)        │
└──────────┬──────────┘
           │
           │ id (FK)
           ▼
┌─────────────────────┐
│     profiles        │
├─────────────────────┤
│ • id (PK, UUID)     │
│   email             │
│   full_name         │
│   avatar_url        │
│   created_at        │
│   updated_at        │
└──────────┬──────────┘
           │
           │ user_id (FK)
           ▼
┌─────────────────────┐
│       souls         │
├─────────────────────┤
│ • id (PK, UUID)     │
│   user_id (FK) ─────┘
│   name
│   training_type     ◀─────── 'convert' | 'disciple'
│   start_date
│   created_at
│   updated_at
└──────────┬──────────┘
           │
           ├───────────────────────┐
           │                       │
           │ soul_id (FK)          │ soul_id (FK)
           ▼                       ▼
┌─────────────────────┐  ┌─────────────────────┐
│     progress        │  │   activity_plans    │
├─────────────────────┤  ├─────────────────────┤
│ • id (PK, UUID)     │  │ • id (PK, UUID)     │
│   soul_id (FK)      │  │   soul_id (FK)      │
│   area_id           │  │   area_id           │
│   week              │  │   week              │
│   status            │  │   plan_type         │
│   completed_at      │  │   title             │
│   memo              │  │   description       │
│   created_at        │  │   is_completed      │
│   updated_at        │  │   created_at        │
└─────────────────────┘  │   updated_at        │
                         └─────────────────────┘


┌──────────────────────────────┐
│  activity_recommendations    │  (Template/Reference Table)
├──────────────────────────────┤
│ • id (PK, UUID)              │
│   training_type              │  ◀─── Links conceptually to souls.training_type
│   area_id                    │  ◀─── Links conceptually to progress.area_id
│   week                       │
│   title                      │
│   description                │
│   bible_verse                │
│   tips                       │
└──────────────────────────────┘
```

## Table Relationships

### Primary Relationships

1. **auth.users → profiles** (1:1)
   - One auth user has one profile
   - CASCADE DELETE: Deleting auth user deletes profile

2. **profiles → souls** (1:N)
   - One user can train multiple souls
   - CASCADE DELETE: Deleting profile deletes all their souls

3. **souls → progress** (1:N)
   - One soul has multiple progress records (one per area/week)
   - CASCADE DELETE: Deleting soul deletes all progress records

4. **souls → activity_plans** (1:N)
   - One soul has multiple activity plans
   - CASCADE DELETE: Deleting soul deletes all activity plans

### Reference Relationships

5. **activity_recommendations** (No direct FK)
   - Template table used to populate activity_plans
   - Queried by (training_type, area_id, week)
   - Read-only for authenticated users

## Data Flow

```
User Signs Up
     ↓
Profile Created (auto via trigger)
     ↓
User Creates Soul (초신자 or 제자)
     ↓
System Initializes Progress Records
     ↓
User Views Activity Recommendations (based on training_type)
     ↓
User Creates Activity Plans (from recommendations or custom)
     ↓
User Marks Progress/Activities Complete
     ↓
System Updates Progress Status (future → current → completed)
```

## Training Area Structure

### Convert Training (초신자)
```
souls.training_type = 'convert'
    ├── bible_reading    (성경읽기)
    ├── prayer           (기도)
    ├── church_attendance (교회출석)
    └── fellowship       (교제)
```

### Disciple Training (제자)
```
souls.training_type = 'disciple'
    ├── bible_reading    (성경읽기)
    ├── prayer           (기도)
    ├── evangelism       (전도)
    └── discipleship     (양육)
```

## Progress Status Flow

```
[future] → [current] → [completed]
   ↑          ↓            ↓
   └──────────┴────────────┘
     User can update status
```

## Activity Plan Types

```
activity_plans.plan_type:
    ├── 'recommended'  (from activity_recommendations)
    └── 'custom'       (user-created)
```

## Row Level Security (RLS) Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Self only | Self only | Self only | - |
| souls | Own souls | Own souls | Own souls | Own souls |
| progress | Own souls' progress | Own souls' progress | Own souls' progress | Own souls' progress |
| activity_plans | Own souls' plans | Own souls' plans | Own souls' plans | Own souls' plans |
| activity_recommendations | All authenticated | - | - | - |

## Indexes for Performance

### souls
- `idx_souls_user_id` on (user_id)
- `idx_souls_training_type` on (training_type)
- `idx_souls_user_training` on (user_id, training_type)

### progress
- `idx_progress_soul_id` on (soul_id)
- `idx_progress_area_id` on (area_id)
- `idx_progress_soul_area` on (soul_id, area_id)
- `idx_progress_status` on (status)

### activity_plans
- `idx_activity_plans_soul_id` on (soul_id)
- `idx_activity_plans_area_id` on (area_id)
- `idx_activity_plans_week` on (week)
- `idx_activity_plans_soul_area_week` on (soul_id, area_id, week)
- `idx_activity_plans_is_completed` on (is_completed)

### activity_recommendations
- `idx_activity_recommendations_training_type` on (training_type)
- `idx_activity_recommendations_area_id` on (area_id)
- `idx_activity_recommendations_week` on (week)
- `idx_activity_recommendations_lookup` on (training_type, area_id, week)

## Unique Constraints

| Table | Constraint | Columns |
|-------|-----------|---------|
| profiles | email must be unique | (email) |
| progress | One record per soul/area/week | (soul_id, area_id, week) |
| activity_recommendations | One template per training/area/week | (training_type, area_id, week) |

## Helper Functions

### get_current_week(soul_id, area_id)
```sql
-- Returns the current week number for a soul in a specific area
SELECT get_current_week('uuid', 'bible_reading');
-- Returns: INTEGER (current week number or 1 if not found)
```

### get_weeks_since_start(soul_id)
```sql
-- Calculates weeks since the soul's start_date
SELECT get_weeks_since_start('uuid');
-- Returns: INTEGER (number of weeks)
```

## Triggers

| Trigger | Table | Action |
|---------|-------|--------|
| update_profiles_updated_at | profiles | Auto-updates updated_at on UPDATE |
| update_souls_updated_at | souls | Auto-updates updated_at on UPDATE |
| update_progress_updated_at | progress | Auto-updates updated_at on UPDATE |
| update_activity_plans_updated_at | activity_plans | Auto-updates updated_at on UPDATE |

## Seed Data Included

The migration includes sample activity recommendations:

- **Convert Training**: 3 weeks of Bible Reading and Prayer activities
- **Disciple Training**: 3 weeks of Bible Reading, Prayer, and Evangelism activities

Each recommendation includes:
- Title (Korean)
- Description
- Bible verse reference
- Tips for implementation

---

**Note**: This diagram represents the logical structure. Physical implementation uses PostgreSQL with UUID primary keys, timestamptz for all timestamps, and full ACID compliance.
