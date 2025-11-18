-- ============================================
-- Favorite Recipes Table Setup
-- ============================================
-- This script creates the favorite_recipes table for storing user's
-- favorite recipes from the Discover tab, synced across devices.
--
-- Run this script once in Supabase SQL Editor.
-- It's safe to run multiple times (idempotent).
-- ============================================

-- Enable UUID extension if not already enabled
create extension if not exists "pgcrypto";

-- Drop existing policies if they exist (for re-running script)
drop policy if exists "Users can view their favorites" on public.favorite_recipes;
drop policy if exists "Users can insert their favorites" on public.favorite_recipes;
drop policy if exists "Users can update their favorites" on public.favorite_recipes;
drop policy if exists "Users can delete their favorites" on public.favorite_recipes;

-- Create the favorite_recipes table
create table if not exists public.favorite_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id bigint not null,
  recipe_title text not null,
  recipe_image text,
  ready_in_minutes integer,
  calories numeric,
  recipe_payload jsonb not null,
  created_at timestamptz not null default now()
);

-- Create unique index to prevent duplicate favorites
create unique index if not exists favorite_recipes_user_recipe_idx
  on public.favorite_recipes (user_id, recipe_id);

-- Create index for faster queries
create index if not exists favorite_recipes_user_id_created_at_idx
  on public.favorite_recipes (user_id, created_at desc);

-- Enable Row Level Security
alter table public.favorite_recipes enable row level security;

-- RLS Policy: SELECT - Users can view their own favorites
create policy "Users can view their favorites"
  on public.favorite_recipes
  for select
  using (auth.uid() = user_id);

-- RLS Policy: INSERT - Users can add their own favorites
create policy "Users can insert their favorites"
  on public.favorite_recipes
  for insert
  with check (auth.uid() = user_id);

-- RLS Policy: UPDATE - Users can update their own favorites
create policy "Users can update their favorites"
  on public.favorite_recipes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policy: DELETE - Users can delete their own favorites
create policy "Users can delete their favorites"
  on public.favorite_recipes
  for delete
  using (auth.uid() = user_id);

-- ============================================
-- Verification queries (optional - run separately)
-- ============================================
-- Check if table exists:
-- select * from information_schema.tables where table_name = 'favorite_recipes';
--
-- Check if RLS is enabled:
-- select tablename, rowsecurity from pg_tables where tablename = 'favorite_recipes';
--
-- Check policies:
-- select * from pg_policies where tablename = 'favorite_recipes';
-- ============================================

