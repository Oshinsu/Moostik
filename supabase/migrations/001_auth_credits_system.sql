-- ============================================================================
-- MOOSTIK AUTH & CREDITS SYSTEM
-- Bloodwing Studio - SOTA Février 2026
-- ============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/yatwvcojuomvjvrxlugs/sql
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Plan tiers
CREATE TYPE user_plan AS ENUM (
  'free',
  'starter',
  'pro', 
  'studio',
  'enterprise'
);

-- User roles
CREATE TYPE user_role AS ENUM (
  'user',
  'member',
  'creator',
  'admin',
  'super_admin'
);

-- Transaction types
CREATE TYPE transaction_type AS ENUM (
  'purchase',
  'usage',
  'bonus',
  'refund',
  'gift',
  'subscription',
  'admin_grant'
);

-- Transaction status
CREATE TYPE transaction_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

-- ============================================================================
-- PLANS TABLE - Pricing tiers
-- ============================================================================

CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tier user_plan NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  credits_monthly INTEGER NOT NULL DEFAULT 0,
  
  -- Feature limits
  max_episodes INTEGER DEFAULT NULL, -- NULL = unlimited
  max_shots_per_episode INTEGER DEFAULT NULL,
  max_parallel_generations INTEGER NOT NULL DEFAULT 1,
  max_video_duration_seconds INTEGER DEFAULT 5,
  
  -- Feature flags
  has_video_generation BOOLEAN NOT NULL DEFAULT false,
  has_blood_director BOOLEAN NOT NULL DEFAULT false,
  has_hd_export BOOLEAN NOT NULL DEFAULT false,
  has_4k_export BOOLEAN NOT NULL DEFAULT false,
  has_api_access BOOLEAN NOT NULL DEFAULT false,
  has_priority_queue BOOLEAN NOT NULL DEFAULT false,
  has_custom_models BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  badge_text TEXT,
  badge_color TEXT,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROFILES TABLE - Extended user data (linked to auth.users)
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Role & Plan
  role user_role NOT NULL DEFAULT 'user',
  plan_id TEXT REFERENCES plans(id) DEFAULT 'free',
  plan_started_at TIMESTAMPTZ,
  plan_expires_at TIMESTAMPTZ,
  
  -- Credits
  credits_balance INTEGER NOT NULL DEFAULT 0,
  credits_used_total INTEGER NOT NULL DEFAULT 0,
  
  -- Stats
  images_generated INTEGER NOT NULL DEFAULT 0,
  videos_generated INTEGER NOT NULL DEFAULT 0,
  episodes_created INTEGER NOT NULL DEFAULT 0,
  
  -- Preferences
  preferences JSONB DEFAULT '{}',
  
  -- Metadata
  stripe_customer_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREDIT_TRANSACTIONS TABLE - All credit movements
-- ============================================================================

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Transaction details
  type transaction_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  amount INTEGER NOT NULL, -- Positive = credit, Negative = debit
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  -- Context
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Reference to what triggered the transaction
  reference_type TEXT, -- 'image', 'video', 'plan', 'stripe', etc.
  reference_id TEXT,
  
  -- Admin tracking
  created_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREDIT_COSTS TABLE - Cost per operation type
-- ============================================================================

CREATE TABLE credit_costs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  credits_cost INTEGER NOT NULL,
  operation_type TEXT NOT NULL, -- 'image_generation', 'video_generation', 'export', etc.
  model_name TEXT, -- Specific model if applicable
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SUBSCRIPTIONS TABLE - Active subscriptions
-- ============================================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  
  -- Stripe data
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing
  
  -- Dates
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INVITATIONS TABLE - For invite system
-- ============================================================================

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  email TEXT, -- Optional: restrict to specific email
  
  -- Grant on redemption
  role user_role NOT NULL DEFAULT 'member',
  plan_id TEXT REFERENCES plans(id),
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  
  -- Usage
  max_uses INTEGER NOT NULL DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  
  -- Tracking
  created_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INVITATION_REDEMPTIONS TABLE - Track who used what code
-- ============================================================================

CREATE TABLE invitation_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(invitation_id, user_id)
);

-- ============================================================================
-- ADMIN_LOGS TABLE - Audit trail for admin actions
-- ============================================================================

CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'plan', 'credits', etc.
  target_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INSERT DEFAULT PLANS
-- ============================================================================

INSERT INTO plans (id, name, description, tier, price_monthly, price_yearly, credits_monthly, 
  max_episodes, max_shots_per_episode, max_parallel_generations, max_video_duration_seconds,
  has_video_generation, has_blood_director, has_hd_export, has_4k_export, has_api_access, 
  has_priority_queue, has_custom_models, badge_text, badge_color, is_popular, display_order)
VALUES
  ('free', 'Découverte', 'Pour tester Bloodwing Studio', 'free', 0, 0, 50,
   1, 10, 1, 5,
   false, false, false, false, false, false, false,
   NULL, NULL, false, 0),
  
  ('starter', 'Starter', 'Pour les créateurs indépendants', 'starter', 19, 190, 500,
   3, 30, 2, 10,
   true, false, true, false, false, false, false,
   NULL, NULL, false, 1),
  
  ('pro', 'Pro', 'Pour les créateurs sérieux', 'pro', 49, 490, 2000,
   10, 100, 5, 30,
   true, true, true, true, false, true, false,
   'Populaire', '#8B0000', true, 2),
  
  ('studio', 'Studio', 'Pour les studios de production', 'studio', 149, 1490, 10000,
   NULL, NULL, 10, 60,
   true, true, true, true, true, true, true,
   'Pro', '#DAA520', false, 3),
  
  ('enterprise', 'Enterprise', 'Solutions sur mesure', 'enterprise', 0, 0, 0,
   NULL, NULL, 20, 120,
   true, true, true, true, true, true, true,
   'Contact', '#4169E1', false, 4);

-- ============================================================================
-- INSERT DEFAULT CREDIT COSTS
-- ============================================================================

INSERT INTO credit_costs (id, name, description, credits_cost, operation_type, model_name)
VALUES
  ('image_flux', 'Image Flux', 'Génération image Flux Kontext', 1, 'image_generation', 'flux_kontext'),
  ('image_sd', 'Image SD', 'Génération image Stable Diffusion', 1, 'image_generation', 'stable_diffusion'),
  ('image_nano', 'Image Nano', 'Génération image Nano Banana Pro', 1, 'image_generation', 'nano_banana_pro'),
  ('video_kling', 'Vidéo Kling', 'Génération vidéo Kling 1.6', 5, 'video_generation', 'kling'),
  ('video_runway', 'Vidéo Runway', 'Génération vidéo Runway Gen-3', 8, 'video_generation', 'runway'),
  ('video_minimax', 'Vidéo Minimax', 'Génération vidéo Minimax', 5, 'video_generation', 'minimax'),
  ('video_luma', 'Vidéo Luma', 'Génération vidéo Luma Dream Machine', 6, 'video_generation', 'luma'),
  ('export_hd', 'Export HD', 'Export vidéo 1080p', 2, 'export', 'hd'),
  ('export_4k', 'Export 4K', 'Export vidéo 4K', 5, 'export', '4k'),
  ('blood_director', 'Blood Director', 'Montage automatique AI', 10, 'ai_feature', 'blood_director');

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Plans are public read
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by everyone" ON plans FOR SELECT USING (is_active = true);

-- Credit costs are public read
ALTER TABLE credit_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Credit costs are viewable by everyone" ON credit_costs FOR SELECT USING (is_active = true);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON credit_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all transactions" ON credit_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can insert transactions" ON credit_transactions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all subscriptions" ON subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Invitations policies
CREATE POLICY "Active invitations are viewable" ON invitations FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage invitations" ON invitations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Redemptions policies
CREATE POLICY "Users can view own redemptions" ON invitation_redemptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own redemptions" ON invitation_redemptions FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin logs policies
CREATE POLICY "Admins can view logs" ON admin_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can insert logs" ON admin_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_moostik_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type transaction_type,
  p_description TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance with lock
  SELECT credits_balance INTO v_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;
  
  IF v_balance IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check sufficient balance
  IF v_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  v_new_balance := v_balance - p_amount;
  
  -- Update balance
  UPDATE profiles
  SET credits_balance = v_new_balance,
      credits_used_total = credits_used_total + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    user_id, type, status, amount, balance_before, balance_after,
    description, reference_type, reference_id
  ) VALUES (
    p_user_id, p_type, 'completed', -p_amount, v_balance, v_new_balance,
    p_description, p_reference_type, p_reference_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type transaction_type,
  p_description TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance with lock
  SELECT credits_balance INTO v_balance
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;
  
  IF v_balance IS NULL THEN
    RETURN FALSE;
  END IF;
  
  v_new_balance := v_balance + p_amount;
  
  -- Update balance
  UPDATE profiles
  SET credits_balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    user_id, type, status, amount, balance_before, balance_after,
    description, created_by
  ) VALUES (
    p_user_id, p_type, 'completed', p_amount, v_balance, v_new_balance,
    p_description, p_created_by
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, plan_id, credits_balance)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'free',
    50 -- Free tier starting credits
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_plan ON profiles(plan_id);
CREATE INDEX idx_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_transactions_created ON credit_transactions(created_at DESC);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_invitations_code ON invitations(code);
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);

-- ============================================================================
-- GRANT PERMISSIONS (for service role)
-- ============================================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
