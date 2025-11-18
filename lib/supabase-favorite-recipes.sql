-- Favorite recipes table for storing Discover hearts across devices
create extension if not exists "pgcrypto";

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

create unique index if not exists favorite_recipes_user_recipe_idx
  on public.favorite_recipes (user_id, recipe_id);

alter table public.favorite_recipes enable row level security;

create policy "Users can view their favorites"
  on public.favorite_recipes
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their favorites"
  on public.favorite_recipes
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their favorites"
  on public.favorite_recipes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their favorites"
  on public.favorite_recipes
  for delete
  using (auth.uid() = user_id);

