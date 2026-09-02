create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('transcription_session', 'translation', 'summary', 'speech_synthesis')),
  quantity integer not null default 1 check (quantity > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_type_idx
  on public.usage_events(user_id, event_type, created_at);

alter table public.admin_users enable row level security;
alter table public.usage_events enable row level security;

grant select on public.usage_events to authenticated;

drop policy if exists "Users can read their usage events" on public.usage_events;
create policy "Users can read their usage events"
  on public.usage_events
  for select
  using (auth.uid() = user_id);
