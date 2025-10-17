-- Followers System Schema
-- User following/followers with RLS

-- Followers table
CREATE TABLE IF NOT EXISTS public.followers (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON public.followers(following_id);

-- Enable RLS
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Anyone can view followers (for counts and public follow lists)
CREATE POLICY "Followers are viewable by everyone"
  ON public.followers
  FOR SELECT
  USING (true);

-- Authenticated users can follow others
CREATE POLICY "Users can follow others"
  ON public.followers
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
  ON public.followers
  FOR DELETE
  USING (auth.uid() = follower_id);

-- Helper function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.followers
  WHERE following_id = user_id;
$$ LANGUAGE SQL STABLE;

-- Helper function to get following count
CREATE OR REPLACE FUNCTION get_following_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.followers
  WHERE follower_id = user_id;
$$ LANGUAGE SQL STABLE;

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.followers TO authenticated;
GRANT SELECT ON public.followers TO anon;

