-- Golf Charity Platform - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    handicap_index NUMERIC(4, 1),
    selected_charity_id UUID REFERENCES public.charities(id),
    donation_percent NUMERIC(3, 1) DEFAULT 10.0 CHECK (donation_percent >= 0 AND donation_percent <= 100),
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'expired', 'trialing')),
    payment_status TEXT NOT NULL DEFAULT 'active' CHECK (payment_status IN ('active', 'canceled', 'past_due', 'incomplete')),
    price_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE UNIQUE INDEX idx_subscriptions_user_active ON public.subscriptions(user_id) WHERE status = 'active';

-- =============================================
-- SCORES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    course_name TEXT,
    tee_name TEXT,
    holes_played INTEGER DEFAULT 18,
    front_nine INTEGER,
    back_nine INTEGER,
    eagles_or_better INTEGER DEFAULT 0,
    birdies INTEGER DEFAULT 0,
    pars INTEGER DEFAULT 0,
    bogeys INTEGER DEFAULT 0,
    double_bogeys_or_worse INTEGER DEFAULT 0,
    score_date DATE NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    proof_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores" ON public.scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON public.scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores" ON public.scores
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_scores_user_date ON public.scores(user_id, score_date DESC);

-- =============================================
-- CHARITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.charities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    contact_email TEXT,
    minimum_donation_percent NUMERIC(3, 1) DEFAULT 10.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active charities" ON public.charities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage charities" ON public.charities
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Seed charities
INSERT INTO public.charities (name, slug, description, minimum_donation_percent) VALUES
    ('St. Jude Children''s Research Hospital', 'st-jude', 'Finding cures. Saving children.', 10),
    ('World Wildlife Fund', 'wwf', 'Protecting nature and wildlife.', 10),
    ('Doctors Without Borders', 'medecins-sans-frontieres', 'Medical humanitarian care.', 10),
    ('Feeding America', 'feeding-america', 'End hunger in America.', 10),
    ('The Ocean Cleanup', 'ocean-cleanup', 'Cleaning plastic from oceans.', 10)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- DRAWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    draw_number SERIAL,
    title TEXT NOT NULL,
    description TEXT,
    draw_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'canceled')),
    prize_pool_cents INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    jackpot_percent INTEGER DEFAULT 40,
    four_match_percent INTEGER DEFAULT 35,
    three_match_percent INTEGER DEFAULT 25,
    previous_jackpot_rollover BOOLEAN DEFAULT false,
    rolled_over_amount_cents INTEGER DEFAULT 0,
    executed_at TIMESTAMPTZ,
    executed_by UUID REFERENCES public.profiles(id),
    winning_numbers JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view draws" ON public.draws
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage draws" ON public.draws
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE INDEX idx_draws_status_date ON public.draws(status, draw_date);

-- =============================================
-- DRAW PARTICIPATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.draw_participations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    numbers INTEGER[] NOT NULL,
    match_count INTEGER,
    prize_amount_cents INTEGER DEFAULT 0,
    is_winner BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(draw_id, user_id)
);

ALTER TABLE public.draw_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own participations" ON public.draw_participations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own participations" ON public.draw_participations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage participations" ON public.draw_participations
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE INDEX idx_participations_draw ON public.draw_participations(draw_id);
CREATE INDEX idx_participations_user ON public.draw_participations(user_id);

-- =============================================
-- WINNINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.winnings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    participation_id UUID REFERENCES public.draw_participations(id),
    match_count INTEGER NOT NULL,
    prize_tier TEXT,
    gross_amount_cents INTEGER NOT NULL,
    charity_deduction_cents INTEGER NOT NULL,
    net_amount_cents INTEGER NOT NULL,
    payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed')),
    paid_at TIMESTAMPTZ,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    verification_submitted_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.winnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own winnings" ON public.winnings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage winnings" ON public.winnings
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE INDEX idx_winnings_user ON public.winnings(user_id);
CREATE INDEX idx_winnings_draw ON public.winnings(draw_id);
CREATE INDEX idx_winnings_status ON public.winnings(payout_status, verification_status);

-- =============================================
-- FUNCTION TO AUTO-ENTER DRAW
-- =============================================
CREATE OR REPLACE FUNCTION public.auto_enter_draw()
RETURNS TRIGGER AS $$
DECLARE
    user_scores_count INTEGER;
    user_numbers INTEGER[];
    existing_draw_id UUID;
BEGIN
    -- Check if user has 5 scores
    SELECT COUNT(*) INTO user_scores_count
    FROM public.scores
    WHERE user_id = NEW.user_id;

    IF user_scores_count < 5 THEN
        RETURN NEW;
    END IF;

    -- Get current pending draw
    SELECT id INTO existing_draw_id
    FROM public.draws
    WHERE status = 'pending'
    ORDER BY draw_date ASC
    LIMIT 1;

    IF existing_draw_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Check if already participated
    IF EXISTS (
        SELECT 1 FROM public.draw_participations
        WHERE draw_id = existing_draw_id AND user_id = NEW.user_id
    ) THEN
        RETURN NEW;
    END IF;

    -- Get last 5 scores and extract digits
    SELECT ARRAY(
        SELECT CAST(SUBSTRING(score::TEXT FROM LENGTH(score::TEXT)) AS INTEGER)
        FROM (
            SELECT score FROM public.scores
            WHERE user_id = NEW.user_id
            ORDER BY score_date DESC
            LIMIT 5
        ) AS scores
    ) INTO user_numbers;

    -- Insert participation
    INSERT INTO public.draw_participations (draw_id, user_id, numbers)
    VALUES (existing_draw_id, NEW.user_id, user_numbers);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_score_created
    AFTER INSERT ON public.scores
    FOR EACH ROW EXECUTE FUNCTION public.auto_enter_draw();

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER draws_updated_at BEFORE UPDATE ON public.draws
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER winnings_updated_at BEFORE UPDATE ON public.winnings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- SERVICE ROLE FOR ADMIN
-- =============================================
-- Note: Use Supabase Service Role Key in .env.local for admin operations
-- Never expose this key to the client
