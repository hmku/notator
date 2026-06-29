-- Run this in the Supabase SQL editor after creating a project.

create table if not exists pieces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  meta text not null default '',
  doc jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists pieces_user_id_updated_at_idx
  on pieces (user_id, updated_at desc);

alter table pieces enable row level security;

create policy "Users manage own pieces"
  on pieces
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
