# Activity Evaluation Flow Implementation

## Summary
Implemented the activity evaluation flow that prompts users to evaluate activities when marking them as complete.

## Features Implemented

### 1. Quick Evaluation Prompt
When a user completes an activity, a quick evaluation form appears:
- **5-star rating system** (1-5 stars, default: 3)
- **Optional quick note field** for brief feedback
- **Three action buttons:**
  - "나중에 평가" (Evaluate Later) - Skip evaluation
  - "상세 평가" (Detailed Evaluation) - Open full evaluation dialog
  - "저장" (Save) - Save quick evaluation

### 2. Visual Indicators
Activities in the list show their evaluation status:
- **⭐ with rating** - Completed and evaluated activities
- **⚠️ (AlertCircle)** - Completed but not evaluated (encourages evaluation)

### 3. Detailed Evaluation Dialog
Reuses the existing `ActivityEvaluationDialog` component with full evaluation fields:
- Rating (1-5 stars)
- Actual outcome/results
- Challenges faced
- Next steps
- Additional notes

## Files Modified

### 1. `/app/src/presentation/components/Grid/CellDialog.tsx`
- Added `onEvaluateActivity` prop
- Added state for evaluation UI (evaluatingActivity, quickEvalActivity, quickRating, quickNote)
- Implemented `handleActivityToggle` - Shows evaluation prompt when completing
- Implemented `handleQuickEvaluate` - Saves quick evaluation
- Implemented `handleDetailedEvaluate` - Opens detailed dialog
- Implemented `handleSkipEvaluation` - Allows skipping evaluation
- Updated activity list to show evaluation indicators
- Added quick evaluation form UI
- Integrated `ActivityEvaluationDialog` component

### 2. `/app/src/infrastructure/repositories/supabase/activity-plan-repository.ts`
- Added `ActivityEvaluation` interface export
- Added `evaluation` field to `ActivityPlan` interface
- Added `evaluation` to `UpdatePlanInput` interface

### 3. `/app/src/store/activityPlanStore.ts`
- Imported `ActivityEvaluation` type
- Added `evaluatePlan` method to store interface
- Implemented `evaluatePlan` with optimistic updates
- Note: Evaluation data is stored client-side only (DB schema doesn't support it yet)

### 4. `/app/src/presentation/pages/SoulGridPage.tsx`
- Imported `evaluatePlan` from store
- Added `handleEvaluateActivity` handler
- Passed `onEvaluateActivity` prop to `CellDialog`

## Data Flow

1. User clicks checkbox to complete activity
2. `handleActivityToggle` detects completion and shows quick evaluation form
3. User can:
   - Enter quick rating + note → Click "저장" → Saves to store
   - Click "상세 평가" → Opens `ActivityEvaluationDialog` → Saves full evaluation
   - Click "나중에 평가" → Skips evaluation (can evaluate later)
4. Evaluation data stored via `evaluatePlan` in store
5. Visual indicators update to show evaluation status

## ActivityEvaluation Interface

```typescript
interface ActivityEvaluation {
  rating: 1 | 2 | 3 | 4 | 5;      // 1-5점 평가
  evaluationNotes?: string;       // 평가 코멘트
  actualOutcome?: string;         // 실제 결과/성과
  challengesFaced?: string;       // 어려웠던 점
  nextSteps?: string;             // 다음 단계 계획
  evaluatedAt: string;            // 평가 일시 (ISO string)
}
```

## Future Enhancements

### Database Schema Update Needed
Currently, evaluation data is stored only in the client-side store. To persist evaluations:

1. Add evaluation columns to `activity_plans` table:
   ```sql
   ALTER TABLE activity_plans ADD COLUMN evaluation_rating INTEGER;
   ALTER TABLE activity_plans ADD COLUMN evaluation_notes TEXT;
   ALTER TABLE activity_plans ADD COLUMN actual_outcome TEXT;
   ALTER TABLE activity_plans ADD COLUMN challenges_faced TEXT;
   ALTER TABLE activity_plans ADD COLUMN next_steps TEXT;
   ALTER TABLE activity_plans ADD COLUMN evaluated_at TIMESTAMP WITH TIME ZONE;
   ```

2. Update `updatePlan` in repository to save evaluation fields

3. Update `mapDbToDomain` to map evaluation fields from DB

## Testing Checklist

- [ ] Complete an activity → Quick evaluation form appears
- [ ] Enter rating and note → Click "저장" → Evaluation saved
- [ ] Click "상세 평가" → Dialog opens with all fields
- [ ] Submit detailed evaluation → Data persists in store
- [ ] Click "나중에 평가" → Form closes without saving
- [ ] Evaluated activity shows ⭐ icon with rating
- [ ] Non-evaluated completed activity shows ⚠️ icon
- [ ] Uncomplete an evaluated activity → Evaluation persists
- [ ] Re-complete activity → Can re-evaluate

## Notes

- Evaluation is optional - users can skip if they prefer
- Quick evaluation provides a low-friction option
- Detailed evaluation available for comprehensive feedback
- Visual indicators encourage evaluation without being intrusive
- Currently client-side only - requires DB migration for persistence
