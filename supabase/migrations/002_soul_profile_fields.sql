-- Phase 1: Soul 엔티티 통합 - 프로필 필드 추가
-- 기존 데이터에 영향 없음 (모든 새 컬럼은 nullable 또는 DEFAULT)

ALTER TABLE souls
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS birth_date TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT CHECK (char_length(notes) <= 2000),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS profile JSONB DEFAULT '{}';

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_souls_is_active ON souls(is_active);
CREATE INDEX IF NOT EXISTS idx_souls_training_type ON souls(training_type);

-- updated_at 트리거 (이미 없으면 추가)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- souls 테이블에 updated_at 트리거가 없으면 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_souls_updated_at'
    ) THEN
        CREATE TRIGGER set_souls_updated_at
            BEFORE UPDATE ON souls
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;
