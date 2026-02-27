-- ReadWatch: Supabase Database Schema
-- Run this in the Supabase SQL Editor to create the watchlist table

create table if not exists watchlist (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null check (category in ('movie', 'show', 'anime', 'manga')),
  status text not null default 'plan_to_watch' check (status in ('plan_to_watch', 'watching', 'completed', 'dropped')),
  poster_url text,
  external_id text not null,
  date_added timestamptz default now(),
  notes text,
  
  unique(external_id, category)
);

-- Enable Row Level Security (optional for single-user, but good practice)
alter table watchlist enable row level security;

-- Allow all operations for anon key (single-user app)
create policy "Allow all operations" on watchlist
  for all
  using (true)
  with check (true);

-- Index for common queries
create index idx_watchlist_category on watchlist(category);
create index idx_watchlist_status on watchlist(status);
create index idx_watchlist_date on watchlist(date_added desc);
