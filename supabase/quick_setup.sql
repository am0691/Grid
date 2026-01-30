-- GRID Quick Setup SQL
-- Supabase SQL Editor에서 실행하세요

-- 1. profiles 테이블
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. souls 테이블
CREATE TABLE IF NOT EXISTS souls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    training_type TEXT NOT NULL CHECK (training_type IN ('convert', 'disciple')),
    start_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE souls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own souls" ON souls FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own souls" ON souls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own souls" ON souls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own souls" ON souls FOR DELETE USING (auth.uid() = user_id);

-- 3. progress 테이블
CREATE TABLE IF NOT EXISTS progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view progress for own souls" ON progress FOR SELECT
    USING (EXISTS (SELECT 1 FROM souls WHERE souls.id = progress.soul_id AND souls.user_id = auth.uid()));
CREATE POLICY "Users can insert progress for own souls" ON progress FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM souls WHERE souls.id = progress.soul_id AND souls.user_id = auth.uid()));
CREATE POLICY "Users can update progress for own souls" ON progress FOR UPDATE
    USING (EXISTS (SELECT 1 FROM souls WHERE souls.id = progress.soul_id AND souls.user_id = auth.uid()));
CREATE POLICY "Users can delete progress for own souls" ON progress FOR DELETE
    USING (EXISTS (SELECT 1 FROM souls WHERE souls.id = progress.soul_id AND souls.user_id = auth.uid()));

-- 4. activity_plans 테이블
CREATE TABLE IF NOT EXISTS activity_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE activity_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity plans for own souls" ON activity_plans FOR SELECT
    USING (EXISTS (SELECT 1 FROM souls WHERE souls.id = activity_plans.soul_id AND souls.user_id = auth.uid()));
CREATE POLICY "Users can insert activity plans for own souls" ON activity_plans FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM souls WHERE souls.id = activity_plans.soul_id AND souls.user_id = auth.uid()));
CREATE POLICY "Users can update activity plans for own souls" ON activity_plans FOR UPDATE
    USING (EXISTS (SELECT 1 FROM souls WHERE souls.id = activity_plans.soul_id AND souls.user_id = auth.uid()));
CREATE POLICY "Users can delete activity plans for own souls" ON activity_plans FOR DELETE
    USING (EXISTS (SELECT 1 FROM souls WHERE souls.id = activity_plans.soul_id AND souls.user_id = auth.uid()));

-- 5. 프로필 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 완료!
SELECT 'GRID 데이터베이스 설정 완료!' as result;
