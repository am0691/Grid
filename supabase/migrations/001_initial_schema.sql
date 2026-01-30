-- GRID Database Schema Migration
-- Version: 001
-- Description: Initial schema for GRID web service (disciple training management)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- User profile information linked to Supabase Auth
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create index on email for faster lookups
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================================================
-- SOULS TABLE
-- ============================================================================
-- Represents individuals being trained (disciples or converts)
CREATE TABLE souls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    training_type TEXT NOT NULL CHECK (training_type IN ('convert', 'disciple')),
    start_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on souls
ALTER TABLE souls ENABLE ROW LEVEL SECURITY;

-- Souls RLS Policies
CREATE POLICY "Users can view own souls"
    ON souls FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own souls"
    ON souls FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own souls"
    ON souls FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own souls"
    ON souls FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX idx_souls_user_id ON souls(user_id);
CREATE INDEX idx_souls_training_type ON souls(training_type);
CREATE INDEX idx_souls_user_training ON souls(user_id, training_type);

-- ============================================================================
-- PROGRESS TABLE
-- ============================================================================
-- Tracks progress through different training areas
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    soul_id UUID NOT NULL REFERENCES souls(id) ON DELETE CASCADE,
    area_id TEXT NOT NULL,
    week INTEGER NOT NULL CHECK (week > 0),
    status TEXT NOT NULL DEFAULT 'future' CHECK (status IN ('completed', 'current', 'future')),
    completed_at DATE,
    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(soul_id, area_id, week)
);

-- Enable RLS on progress
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Progress RLS Policies
CREATE POLICY "Users can view progress for own souls"
    ON progress FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM souls
            WHERE souls.id = progress.soul_id
            AND souls.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert progress for own souls"
    ON progress FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM souls
            WHERE souls.id = progress.soul_id
            AND souls.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update progress for own souls"
    ON progress FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM souls
            WHERE souls.id = progress.soul_id
            AND souls.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete progress for own souls"
    ON progress FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM souls
            WHERE souls.id = progress.soul_id
            AND souls.user_id = auth.uid()
        )
    );

-- Create indexes for faster queries
CREATE INDEX idx_progress_soul_id ON progress(soul_id);
CREATE INDEX idx_progress_area_id ON progress(area_id);
CREATE INDEX idx_progress_soul_area ON progress(soul_id, area_id);
CREATE INDEX idx_progress_status ON progress(status);

-- ============================================================================
-- ACTIVITY_PLANS TABLE
-- ============================================================================
-- Stores planned activities for each soul
CREATE TABLE activity_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    soul_id UUID NOT NULL REFERENCES souls(id) ON DELETE CASCADE,
    area_id TEXT NOT NULL,
    week INTEGER NOT NULL CHECK (week > 0),
    plan_type TEXT NOT NULL DEFAULT 'recommended' CHECK (plan_type IN ('recommended', 'custom')),
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on activity_plans
ALTER TABLE activity_plans ENABLE ROW LEVEL SECURITY;

-- Activity Plans RLS Policies
CREATE POLICY "Users can view activity plans for own souls"
    ON activity_plans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM souls
            WHERE souls.id = activity_plans.soul_id
            AND souls.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert activity plans for own souls"
    ON activity_plans FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM souls
            WHERE souls.id = activity_plans.soul_id
            AND souls.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update activity plans for own souls"
    ON activity_plans FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM souls
            WHERE souls.id = activity_plans.soul_id
            AND souls.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete activity plans for own souls"
    ON activity_plans FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM souls
            WHERE souls.id = activity_plans.soul_id
            AND souls.user_id = auth.uid()
        )
    );

-- Create indexes for faster queries
CREATE INDEX idx_activity_plans_soul_id ON activity_plans(soul_id);
CREATE INDEX idx_activity_plans_area_id ON activity_plans(area_id);
CREATE INDEX idx_activity_plans_week ON activity_plans(week);
CREATE INDEX idx_activity_plans_soul_area_week ON activity_plans(soul_id, area_id, week);
CREATE INDEX idx_activity_plans_is_completed ON activity_plans(is_completed);

-- ============================================================================
-- ACTIVITY_RECOMMENDATIONS TABLE
-- ============================================================================
-- Template for recommended activities based on training type and area
CREATE TABLE activity_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_type TEXT NOT NULL CHECK (training_type IN ('convert', 'disciple')),
    area_id TEXT NOT NULL,
    week INTEGER NOT NULL CHECK (week > 0),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    bible_verse TEXT,
    tips TEXT,
    UNIQUE(training_type, area_id, week)
);

-- Enable RLS on activity_recommendations
ALTER TABLE activity_recommendations ENABLE ROW LEVEL SECURITY;

-- Activity Recommendations RLS Policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view recommendations"
    ON activity_recommendations FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Create indexes for faster queries
CREATE INDEX idx_activity_recommendations_training_type ON activity_recommendations(training_type);
CREATE INDEX idx_activity_recommendations_area_id ON activity_recommendations(area_id);
CREATE INDEX idx_activity_recommendations_week ON activity_recommendations(week);
CREATE INDEX idx_activity_recommendations_lookup ON activity_recommendations(training_type, area_id, week);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_souls_updated_at
    BEFORE UPDATE ON souls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
    BEFORE UPDATE ON progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_plans_updated_at
    BEFORE UPDATE ON activity_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current week for a soul in a specific area
CREATE OR REPLACE FUNCTION get_current_week(p_soul_id UUID, p_area_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    current_week_num INTEGER;
BEGIN
    SELECT week INTO current_week_num
    FROM progress
    WHERE soul_id = p_soul_id
    AND area_id = p_area_id
    AND status = 'current'
    LIMIT 1;

    RETURN COALESCE(current_week_num, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate weeks since start date
CREATE OR REPLACE FUNCTION get_weeks_since_start(p_soul_id UUID)
RETURNS INTEGER AS $$
DECLARE
    weeks_count INTEGER;
BEGIN
    SELECT EXTRACT(DAYS FROM (CURRENT_DATE - start_date))::INTEGER / 7 + 1
    INTO weeks_count
    FROM souls
    WHERE id = p_soul_id;

    RETURN COALESCE(weeks_count, 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA (ACTIVITY RECOMMENDATIONS)
-- ============================================================================

-- Convert Training - Bible Reading Area (Week 1-3)
INSERT INTO activity_recommendations (training_type, area_id, week, title, description, bible_verse, tips) VALUES
('convert', 'bible_reading', 1, '복음서 읽기 시작', '요한복음 1-3장을 읽으며 예수님이 누구신지 알아갑니다.', '요한복음 3:16', '하루에 한 장씩 천천히 읽으세요. 모르는 부분은 표시해두세요.'),
('convert', 'bible_reading', 2, '예수님의 비유 묵상', '누가복음 15장 탕자의 비유를 읽고 하나님의 사랑을 생각해봅니다.', '누가복음 15:20', '자신을 탕자의 입장에서 생각해보세요.'),
('convert', 'bible_reading', 3, '십자가의 의미', '마가복음 15장을 읽으며 십자가 사건을 묵상합니다.', '마가복음 15:39', '왜 예수님이 십자가에서 돌아가셔야 했는지 생각해보세요.');

-- Convert Training - Prayer Area (Week 1-3)
INSERT INTO activity_recommendations (training_type, area_id, week, title, description, bible_verse, tips) VALUES
('convert', 'prayer', 1, '간단한 기도 시작하기', '아침 저녁으로 감사 기도를 드립니다.', '빌립보서 4:6', '처음엔 짧게라도 괜찮습니다. 자신의 언어로 편하게 기도하세요.'),
('convert', 'prayer', 2, '주기도문 배우기', '주기도문을 암송하고 의미를 생각해봅니다.', '마태복음 6:9-13', '한 문장씩 의미를 되새기며 외워보세요.'),
('convert', 'prayer', 3, '중보기도 시작', '가족과 친구를 위해 기도하는 시간을 갖습니다.', '야고보서 5:16', '한 사람씩 이름을 부르며 기도해보세요.');

-- Disciple Training - Bible Reading Area (Week 1-3)
INSERT INTO activity_recommendations (training_type, area_id, week, title, description, bible_verse, tips) VALUES
('disciple', 'bible_reading', 1, '로마서 1-3장 연구', '구원의 교리를 깊이 묵상합니다.', '로마서 3:23-24', '각 장의 핵심 메시지를 정리해보세요.'),
('disciple', 'bible_reading', 2, '로마서 4-6장 연구', '믿음과 은혜에 대해 학습합니다.', '로마서 6:23', '노트에 중요한 구절을 기록하세요.'),
('disciple', 'bible_reading', 3, '로마서 7-8장 연구', '성령의 역할과 승리의 삶을 배웁니다.', '로마서 8:1-2', '성령 안에서의 자유를 묵상해보세요.');

-- Disciple Training - Prayer Area (Week 1-3)
INSERT INTO activity_recommendations (training_type, area_id, week, title, description, bible_verse, tips) VALUES
('disciple', 'prayer', 1, '새벽 기도 습관', '매일 새벽 30분 기도 시간을 정합니다.', '마가복음 1:35', '일정한 시간과 장소를 정해두는 것이 중요합니다.'),
('disciple', 'prayer', 2, '중보기도 목록 작성', '체계적인 중보기도 목록을 만듭니다.', '디모데전서 2:1', '가족, 교회, 나라를 위한 기도 제목을 나눠보세요.'),
('disciple', 'prayer', 3, '금식 기도 경험', '간단한 금식 기도를 시작해봅니다.', '마태복음 6:16-18', '처음엔 한 끼 금식부터 시작하세요.');

-- Disciple Training - Evangelism Area (Week 1-3)
INSERT INTO activity_recommendations (training_type, area_id, week, title, description, bible_verse, tips) VALUES
('disciple', 'evangelism', 1, '전도 대상자 기도', '전도할 3명의 이름을 정하고 기도를 시작합니다.', '마태복음 9:38', '구체적인 이름을 적고 매일 기도하세요.'),
('disciple', 'evangelism', 2, '관계 형성하기', '전도 대상자와 식사나 차를 함께 합니다.', '누가복음 19:5', '먼저 진실한 관심과 사랑을 보여주세요.'),
('disciple', 'evangelism', 3, '간증 나누기', '자신의 신앙 간증을 3분 안에 정리해봅니다.', '베드로전서 3:15', '변화된 모습을 중심으로 간결하게 준비하세요.');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles linked to Supabase Auth users';
COMMENT ON TABLE souls IS 'Individuals being trained (disciples or converts)';
COMMENT ON TABLE progress IS 'Progress tracking for each training area and week';
COMMENT ON TABLE activity_plans IS 'Planned activities for souls';
COMMENT ON TABLE activity_recommendations IS 'Template recommendations for activities';

COMMENT ON COLUMN souls.training_type IS 'Type of training: convert (초신자) or disciple (제자)';
COMMENT ON COLUMN progress.status IS 'Progress status: completed, current, or future';
COMMENT ON COLUMN activity_plans.plan_type IS 'Plan type: recommended (from template) or custom (user-created)';
