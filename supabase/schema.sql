-- ============================================================================
-- BLOODWINGS STUDIO - Database Schema
-- Supabase PostgreSQL
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE plan_tier AS ENUM ('free', 'creator', 'studio', 'production', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'published');
CREATE TYPE post_type AS ENUM ('creation', 'episode_submission', 'avatar', 'discussion', 'tutorial');
CREATE TYPE moostik_clan AS ENUM ('bloodwing', 'shadowveil', 'stormborn', 'ironheart', 'voidwalker', 'sunfire', 'nightfang', 'crystalmind');

-- ============================================================================
-- USERS
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Plan & Billing
  plan plan_tier DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'active',
  subscription_end_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  
  -- Community Profile
  username TEXT UNIQUE,
  bio TEXT,
  avatar_moostik_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  
  -- Settings
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'fr',
  notifications_email BOOLEAN DEFAULT true,
  notifications_community BOOLEAN DEFAULT true,
  notifications_marketing BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- ============================================================================
-- CREDITS
-- ============================================================================

CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Current Credits
  credits_available INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  monthly_allowance INTEGER DEFAULT 0,
  bonus_credits INTEGER DEFAULT 0,
  rollover_credits INTEGER DEFAULT 0,
  
  -- Usage Tracking
  images_generated INTEGER DEFAULT 0,
  videos_generated INTEGER DEFAULT 0,
  exports_completed INTEGER DEFAULT 0,
  
  -- Reset
  reset_date TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Transaction Details
  type TEXT NOT NULL, -- 'usage', 'purchase', 'bonus', 'rollover', 'refund'
  amount INTEGER NOT NULL, -- positive = add, negative = deduct
  balance_after INTEGER NOT NULL,
  
  -- Context
  description TEXT,
  resource_type TEXT, -- 'image', 'video', 'export', etc.
  resource_id TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECTS / UNIVERSES
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Info
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  
  -- Universe Bible
  universe_title TEXT,
  universe_logline TEXT,
  universe_genre TEXT[] DEFAULT '{}',
  universe_tone TEXT,
  universe_setting TEXT,
  
  -- Stats
  characters_count INTEGER DEFAULT 0,
  locations_count INTEGER DEFAULT 0,
  episodes_count INTEGER DEFAULT 0,
  total_images INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  total_credits_used INTEGER DEFAULT 0,
  
  -- Sharing
  is_public BOOLEAN DEFAULT false,
  
  -- Community Submission
  submission_status submission_status DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  submission_feedback TEXT,
  revenue_share DECIMAL(3,2) DEFAULT 0.15, -- 15%
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited_at TIMESTAMPTZ
);

-- ============================================================================
-- COMMUNITY POSTS
-- ============================================================================

CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Type
  post_type post_type NOT NULL,
  
  -- Content
  title TEXT NOT NULL,
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  
  -- Episode Submission Details
  episode_project_id UUID REFERENCES projects(id),
  episode_number INTEGER,
  episode_synopsis TEXT,
  episode_duration INTEGER,
  episode_status submission_status,
  episode_revenue_earned DECIMAL(10,2) DEFAULT 0,
  
  -- Avatar Creation Details
  avatar_id UUID, -- References moostik_avatars
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES community_comments(id),
  
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un user ne peut liker qu'une fois
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id)
);

-- ============================================================================
-- MOOSTIK AVATARS
-- ============================================================================

CREATE TABLE moostik_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,
  clan moostik_clan NOT NULL,
  title TEXT,
  
  -- Images
  base_photo_url TEXT NOT NULL,
  reference_image_url TEXT,
  thumbnail_url TEXT,
  
  -- Lore
  backstory TEXT,
  personality TEXT[] DEFAULT '{}',
  abilities TEXT[] DEFAULT '{}',
  weakness TEXT,
  
  -- JSON Moostik (format standard)
  json_moostik JSONB NOT NULL,
  
  -- Community
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  used_in_episodes INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REVENUE TRACKING (pour les épisodes communautaires)
-- ============================================================================

CREATE TABLE revenue_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id),
  project_id UUID REFERENCES projects(id),
  
  -- Revenue Details
  gross_revenue DECIMAL(10,2) NOT NULL,
  creator_share DECIMAL(3,2) DEFAULT 0.15,
  creator_earnings DECIMAL(10,2) NOT NULL,
  platform_earnings DECIMAL(10,2) NOT NULL,
  
  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Payment
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'paid'
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_plan ON users(plan);

CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_is_public ON projects(is_public);
CREATE INDEX idx_projects_submission_status ON projects(submission_status);

CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_type ON community_posts(post_type);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX idx_community_posts_is_featured ON community_posts(is_featured);

CREATE INDEX idx_moostik_avatars_user_id ON moostik_avatars(user_id);
CREATE INDEX idx_moostik_avatars_clan ON moostik_avatars(clan);
CREATE INDEX idx_moostik_avatars_is_public ON moostik_avatars(is_public);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE moostik_avatars ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Public profiles
CREATE POLICY "Public profiles are viewable by everyone" ON users
  FOR SELECT USING (username IS NOT NULL);

-- Credits
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Projects
CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public projects are viewable" ON projects
  FOR SELECT USING (is_public = true);

-- Community posts
CREATE POLICY "Approved posts are public" ON community_posts
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can manage own posts" ON community_posts
  FOR ALL USING (auth.uid() = user_id);

-- Avatars
CREATE POLICY "Public avatars are viewable" ON moostik_avatars
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own avatars" ON moostik_avatars
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER community_posts_updated_at BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Initialize credits when user is created
CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, monthly_allowance, credits_available)
  VALUES (NEW.id, 50, 50); -- Free tier default
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_credits();

-- Update likes count on posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_change AFTER INSERT OR DELETE ON community_likes
  FOR EACH ROW WHEN (NEW.post_id IS NOT NULL OR OLD.post_id IS NOT NULL)
  EXECUTE FUNCTION update_post_likes_count();
