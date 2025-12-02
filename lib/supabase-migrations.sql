-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.favorite_recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipe_id bigint NOT NULL,
  recipe_title text NOT NULL,
  recipe_image text,
  ready_in_minutes integer,
  calories numeric,
  recipe_payload jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT favorite_recipes_pkey PRIMARY KEY (id),
  CONSTRAINT favorite_recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.meal_plan_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  meal_plan_id uuid NOT NULL,
  spoonacular_recipe_id integer NOT NULL,
  recipe_name text NOT NULL,
  recipe_image_url text,
  calories_per_serving integer,
  ready_in_minutes integer,
  meal_date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text])),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  carbs_per_serving numeric,
  protein_per_serving numeric,
  fat_per_serving numeric,
  CONSTRAINT meal_plan_items_pkey PRIMARY KEY (id),
  CONSTRAINT meal_plan_items_meal_plan_id_fkey FOREIGN KEY (meal_plan_id) REFERENCES public.meal_plans(id)
);
CREATE TABLE public.meal_plans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Yemek Planım'::text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT meal_plans_pkey PRIMARY KEY (id),
  CONSTRAINT meal_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.pantry_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  amount numeric DEFAULT 0,
  unit text DEFAULT ''::text,
  quantity_label text DEFAULT ''::text,
  is_weight boolean DEFAULT false,
  spoonacular_id integer,
  spoonacular_name text,
  spoonacular_image text,
  category text DEFAULT 'other'::text,
  status text DEFAULT 'pantry'::text CHECK (status = ANY (ARRAY['pantry'::text, 'shopping_list'::text])),
  checked boolean DEFAULT false,
  recipe_name text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pantry_items_pkey PRIMARY KEY (id),
  CONSTRAINT pantry_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  username text,
  spoonacularPassword text,
  hash text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_body_metrics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text, 'prefer-not-to-say'::text])),
  age integer CHECK (age > 0 AND age < 150),
  height_cm double precision CHECK (height_cm > 0::double precision AND height_cm < 300::double precision),
  weight_kg double precision CHECK (weight_kg > 0::double precision AND weight_kg < 600::double precision),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_body_metrics_pkey PRIMARY KEY (id),
  CONSTRAINT user_body_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_goals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  goal_ids ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_goals_pkey PRIMARY KEY (id),
  CONSTRAINT user_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_meal_times (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  breakfast_time time without time zone,
  lunch_time time without time zone,
  dinner_time time without time zone,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_meal_times_pkey PRIMARY KEY (id),
  CONSTRAINT user_meal_times_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_taste_preferences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  meal_types ARRAY DEFAULT '{}'::text[],
  cuisines ARRAY DEFAULT '{}'::text[],
  allergies_dislikes ARRAY DEFAULT '{}'::text[],
  diet_preferences ARRAY DEFAULT '{}'::text[],
  cooking_skill_level text CHECK (cooking_skill_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  diet_nutrition_targets jsonb DEFAULT '{}'::jsonb,
  cuisine_dislikes ARRAY DEFAULT '{}'::text[],
  CONSTRAINT user_taste_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_taste_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);