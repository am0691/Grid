-- Phase 2: PastoralLog table (통합 목양 일지)
-- Merges ActivityEvaluation + SpiritualState + Breakthrough into single table
-- 1:1 optional link to activity_plans via activity_plan_id

CREATE TABLE pastoral_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  soul_id UUID REFERENCES souls(id) ON DELETE CASCADE NOT NULL,
  activity_plan_id UUID REFERENCES activity_plans(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- 활동 평가
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  evaluation_notes TEXT CHECK (char_length(evaluation_notes) <= 2000),

  -- 영적 상태 (필수)
  mood TEXT NOT NULL CHECK (mood IN ('growing', 'stable', 'struggling')),
  hunger_level SMALLINT NOT NULL CHECK (hunger_level BETWEEN 1 AND 5),
  closeness_level SMALLINT NOT NULL CHECK (closeness_level BETWEEN 1 AND 5),
  observations TEXT CHECK (char_length(observations) <= 2000),
  concerns TEXT CHECK (char_length(concerns) <= 2000),
  praises TEXT CHECK (char_length(praises) <= 2000),
  prayer_needs TEXT CHECK (char_length(prayer_needs) <= 2000),

  -- 영적 돌파
  has_breakthrough BOOLEAN NOT NULL DEFAULT false,
  breakthrough_category TEXT CHECK (
    breakthrough_category IS NULL OR
    breakthrough_category IN (
      'repentance', 'decision', 'insight', 'healing',
      'liberation', 'gift', 'encounter', 'answered', 'other'
    )
  ),
  breakthrough_title TEXT CHECK (char_length(breakthrough_title) <= 200),
  breakthrough_description TEXT CHECK (char_length(breakthrough_description) <= 5000),
  bible_references JSONB DEFAULT '[]',

  -- 다음 단계
  next_steps TEXT CHECK (char_length(next_steps) <= 2000),
  follow_up_actions JSONB DEFAULT '[]',

  -- 타임스탬프
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE pastoral_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pastoral logs"
  ON pastoral_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own pastoral logs"
  ON pastoral_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pastoral logs"
  ON pastoral_logs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own pastoral logs"
  ON pastoral_logs FOR DELETE
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_pastoral_logs_soul_id ON pastoral_logs(soul_id);
CREATE INDEX idx_pastoral_logs_user_id ON pastoral_logs(user_id);
CREATE INDEX idx_pastoral_logs_activity_plan_id ON pastoral_logs(activity_plan_id);
CREATE INDEX idx_pastoral_logs_recorded_at ON pastoral_logs(recorded_at DESC);
CREATE INDEX idx_pastoral_logs_mood ON pastoral_logs(mood);
CREATE INDEX idx_pastoral_logs_has_breakthrough ON pastoral_logs(has_breakthrough) WHERE has_breakthrough = true;
CREATE INDEX idx_pastoral_logs_soul_recorded ON pastoral_logs(soul_id, recorded_at DESC);

-- Trigger (reuse existing update_updated_at_column function from 001_initial_schema.sql)
CREATE TRIGGER update_pastoral_logs_updated_at
  BEFORE UPDATE ON pastoral_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
