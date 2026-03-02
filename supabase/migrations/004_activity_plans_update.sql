-- Phase 2: ActivityPlan DB 스키마 정합성 확보
-- 도메인 모델(type/status)과 DB 스키마(plan_type/is_completed) 불일치 해소

-- 새 컬럼 추가
ALTER TABLE activity_plans
  ADD COLUMN type TEXT NOT NULL DEFAULT 'meeting'
    CHECK (type IN ('meeting', 'call', 'study', 'event', 'prayer', 'other')),
  ADD COLUMN status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
  ADD COLUMN scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN completed_at TIMESTAMPTZ,
  ADD COLUMN location TEXT,
  ADD COLUMN notes TEXT CHECK (char_length(notes) <= 2000);

-- description 길이 제한
ALTER TABLE activity_plans
  ADD CONSTRAINT chk_description_length CHECK (char_length(description) <= 5000);

-- 기존 데이터 마이그레이션
UPDATE activity_plans
SET
  type = 'meeting',
  status = CASE
    WHEN is_completed = true THEN 'completed'
    ELSE 'planned'
  END,
  scheduled_at = created_at;

-- 기존 컬럼 제거
ALTER TABLE activity_plans
  DROP COLUMN plan_type,
  DROP COLUMN is_completed;

-- 새 인덱스
CREATE INDEX idx_activity_plans_type ON activity_plans(type);
CREATE INDEX idx_activity_plans_status ON activity_plans(status);
CREATE INDEX idx_activity_plans_scheduled_at ON activity_plans(scheduled_at DESC);
CREATE INDEX idx_activity_plans_soul_status ON activity_plans(soul_id, status);
