-- Supabase Onboarding Schema
-- This file contains all migrations for onboarding data tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USER_GOALS table
-- ==========================================
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_goals_user_id_unique UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);

-- Enable RLS for user_goals
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own goals
CREATE POLICY "Users can view their own goals" ON user_goals
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own goals
CREATE POLICY "Users can insert their own goals" ON user_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own goals
CREATE POLICY "Users can update their own goals" ON user_goals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own goals
CREATE POLICY "Users can delete their own goals" ON user_goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 2. USER_BODY_METRICS table
-- ==========================================
CREATE TABLE IF NOT EXISTS user_body_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gender TEXT CHECK (gender IN ('male', 'female', 'prefer-not-to-say')) DEFAULT NULL,
  age INTEGER CHECK (age > 0 AND age < 150) DEFAULT NULL,
  height_cm FLOAT CHECK (height_cm > 0 AND height_cm < 300) DEFAULT NULL,
  weight_kg FLOAT CHECK (weight_kg > 0 AND weight_kg < 600) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_body_metrics_user_id_unique UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_body_metrics_user_id ON user_body_metrics(user_id);

-- Enable RLS for user_body_metrics
ALTER TABLE user_body_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own body metrics
CREATE POLICY "Users can view their own body metrics" ON user_body_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own body metrics
CREATE POLICY "Users can insert their own body metrics" ON user_body_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own body metrics
CREATE POLICY "Users can update their own body metrics" ON user_body_metrics
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own body metrics
CREATE POLICY "Users can delete their own body metrics" ON user_body_metrics
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 3. USER_MEAL_TIMES table
-- ==========================================
CREATE TABLE IF NOT EXISTS user_meal_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  breakfast_time TIME DEFAULT NULL,
  lunch_time TIME DEFAULT NULL,
  dinner_time TIME DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_meal_times_user_id_unique UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_meal_times_user_id ON user_meal_times(user_id);

-- Enable RLS for user_meal_times
ALTER TABLE user_meal_times ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own meal times
CREATE POLICY "Users can view their own meal times" ON user_meal_times
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own meal times
CREATE POLICY "Users can insert their own meal times" ON user_meal_times
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own meal times
CREATE POLICY "Users can update their own meal times" ON user_meal_times
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own meal times
CREATE POLICY "Users can delete their own meal times" ON user_meal_times
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 4. USER_TASTE_PREFERENCES table
-- ==========================================
CREATE TABLE IF NOT EXISTS user_taste_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_types TEXT[] DEFAULT '{}',
  cuisines TEXT[] DEFAULT '{}',
  allergies_dislikes TEXT[] DEFAULT '{}',
  diet_preferences TEXT[] DEFAULT '{}',
  cooking_skill_level TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_taste_preferences_user_id_unique UNIQUE(user_id),
  CONSTRAINT cooking_skill_valid CHECK (cooking_skill_level IN ('novice', 'basic', 'intermediate', 'advanced'))
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_taste_preferences_user_id ON user_taste_preferences(user_id);

-- Enable RLS for user_taste_preferences
ALTER TABLE user_taste_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own taste preferences
CREATE POLICY "Users can view their own taste preferences" ON user_taste_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own taste preferences
CREATE POLICY "Users can insert their own taste preferences" ON user_taste_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own taste preferences
CREATE POLICY "Users can update their own taste preferences" ON user_taste_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own taste preferences
CREATE POLICY "Users can delete their own taste preferences" ON user_taste_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- Trigger to auto-update updated_at timestamp
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all onboarding tables
CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_body_metrics_updated_at BEFORE UPDATE ON user_body_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_meal_times_updated_at BEFORE UPDATE ON user_meal_times
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_taste_preferences_updated_at BEFORE UPDATE ON user_taste_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 1. Meal Plans (Başlık Tablosu)
-- Bir kullanıcının planını (örn: "Bu Haftanın Planı") tanımlar.
CREATE TABLE public.meal_plans (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Yemek Planım',
  start_date date NOT NULL,
  end_date date NOT NULL,
  
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- 2. Meal Plan Items (Detay Tablosu)
-- Bir Spoonacular tarifini belirli bir plana, tarihe ve öğüne bağlar.
CREATE TABLE public.meal_plan_items (
  id serial PRIMARY KEY,
  
  -- Ana plana bağlantı (RLS politikasının çalışması için kritik)
  meal_plan_id integer NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  
  -- === SPOONACULAR ENTEGRASYONU ===
  -- Tarif detayları için kullanılacak ID
  spoonacular_recipe_id integer NOT NULL, 
  
  -- === PERFORMANS İÇİN ÖNBELLEK (CACHING) ===
  -- Bu alanlar, planı görüntülerken API çağrısı yapmamak için kullanılır.
  recipe_name text NOT NULL,
  recipe_image_url text,
  calories_per_serving integer,       -- Kalori bilgisi
  carbs_per_serving numeric(10, 2),   -- Karbonhidrat (gram)
  protein_per_serving numeric(10, 2), -- Protein (gram)
  fat_per_serving numeric(10, 2),     -- Yağ (gram)
  ready_in_minutes integer,           -- Hazırlık süresi bilgisi
  
  -- === PLANLAMA DETAYLARI ===
  meal_date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text])),
  
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  
  -- Bir kullanıcı aynı tarifi aynı yuvaya iki kez ekleyememeli
  CONSTRAINT uq_plan_slot UNIQUE (meal_plan_id, meal_date, meal_type, spoonacular_recipe_id)
);

-- ==========================================
-- RLS Policies for Meal Plans Tables
-- ==========================================

-- Enable RLS for meal_plans
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_dates ON public.meal_plans(start_date, end_date);

-- RLS Policy: Users can only view their own meal plans
CREATE POLICY "Users can view their own meal plans" ON public.meal_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own meal plans
CREATE POLICY "Users can insert their own meal plans" ON public.meal_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own meal plans
CREATE POLICY "Users can update their own meal plans" ON public.meal_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own meal plans
CREATE POLICY "Users can delete their own meal plans" ON public.meal_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS for meal_plan_items
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_meal_plan_id ON public.meal_plan_items(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_meal_date ON public.meal_plan_items(meal_date);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_spoonacular_id ON public.meal_plan_items(spoonacular_recipe_id);

-- RLS Policy: Users can only view meal plan items from their own meal plans
CREATE POLICY "Users can view their own meal plan items" ON public.meal_plan_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meal_plan_items.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can only insert meal plan items to their own meal plans
CREATE POLICY "Users can insert their own meal plan items" ON public.meal_plan_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meal_plan_items.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can only update meal plan items from their own meal plans
CREATE POLICY "Users can update their own meal plan items" ON public.meal_plan_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meal_plan_items.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meal_plan_items.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can only delete meal plan items from their own meal plans
CREATE POLICY "Users can delete their own meal plan items" ON public.meal_plan_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meal_plan_items.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

-- Apply trigger to meal_plans table for updated_at
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Diet nutrition targets for taste preferences
-- ==========================================
ALTER TABLE public.user_taste_preferences
ADD COLUMN IF NOT EXISTS diet_nutrition_targets jsonb DEFAULT '{}'::jsonb;

  
-- ==========================================
-- Disliked cuisines for taste preferences
-- ==========================================
ALTER TABLE public.user_taste_preferences
ADD COLUMN IF NOT EXISTS cuisine_dislikes TEXT[] DEFAULT '{}';