-- ARIA Intelligence Workspace - Supabase Initialization Script

-- 1. Profiles Table (User Sessions & Identity)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    plan TEXT DEFAULT 'Pro',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Conversations Table (Header)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE SET NULL, -- Null for anonymous
    status TEXT CHECK (status IN ('active', 'resolved', 'escalated')) DEFAULT 'active',
    mode TEXT CHECK (mode IN ('Sales', 'Support', 'Care', 'Escalation')) DEFAULT 'Sales',
    sentiment FLOAT DEFAULT 0.5,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Messages Table (Content & Intelligence)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
    sender TEXT CHECK (sender IN ('user', 'aria')) NOT NULL,
    content TEXT NOT NULL,
    intelligence JSONB DEFAULT '{}'::jsonb, -- Store emotion, revenue, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Analytics Daily (Aggregated Data for Dashboard)
CREATE TABLE IF NOT EXISTS public.analytics_daily (
    date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    active_conversations INT DEFAULT 0,
    avg_sentiment FLOAT DEFAULT 0.0,
    escalation_rate FLOAT DEFAULT 0.0,
    revenue_pipeline FLOAT DEFAULT 0.0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Escalations (Workflow Handling)
CREATE TABLE IF NOT EXISTS public.escalations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
    severity TEXT CHECK (severity IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    reason TEXT,
    status TEXT CHECK (status IN ('pending', 'handled', 'ignored')) DEFAULT 'pending',
    assigned_to UUID REFERENCES auth.users ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Simplified for Beta
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Conversations are viewable by assigned user" ON public.conversations FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anyone can create conversation" ON public.conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Messages are viewable by conversation owner" ON public.messages FOR SELECT USING (true); -- Simplified
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Analytics are viewable by everyone" ON public.analytics_daily FOR SELECT USING (true);

-- Functions & Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_escalations_updated_at BEFORE UPDATE ON public.escalations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
