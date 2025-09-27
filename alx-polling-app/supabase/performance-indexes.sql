-- Performance optimization indexes for ALX Polling App
-- Run this in your Supabase SQL editor to improve query performance

-- Indexes for polls table
CREATE INDEX IF NOT EXISTS idx_polls_created_at_desc ON public.polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_user_id_created_at ON public.polls(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_closes_at ON public.polls(closes_at) WHERE closes_at IS NOT NULL;

-- Indexes for poll_options table
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id_position ON public.poll_options(poll_id, position);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);

-- Indexes for votes table
CREATE INDEX IF NOT EXISTS idx_votes_poll_id_option_id ON public.votes(poll_id, option_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id_poll_id ON public.votes(user_id, poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON public.votes(option_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON public.votes(created_at DESC);

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(name) WHERE name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_polls_public_active ON public.polls(created_at DESC) WHERE closes_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_votes_poll_option_count ON public.votes(poll_id, option_id, created_at);

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_active ON public.polls(id, created_at DESC) 
WHERE closes_at IS NULL;

-- Analyze tables to update statistics
ANALYZE public.polls;
ANALYZE public.poll_options;
ANALYZE public.votes;
ANALYZE public.profiles;
