create extension if not exists pgcrypto;

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ui_language text not null default 'en' check (ui_language in ('en', 'fr')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  sort_order integer not null default 0,
  collapsed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  sort_order integer not null default 0,
  collapsed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lecture_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  title text not null check (length(trim(title)) > 0),
  notes text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transcript_segments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.lecture_sessions(id) on delete cascade,
  text text not null check (length(trim(text)) > 0),
  source_language text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.session_translations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.lecture_sessions(id) on delete cascade,
  target_language text not null check (target_language in ('en', 'fr', 'ja', 'de')),
  translated_text text not null check (length(trim(translated_text)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, target_language)
);

create index courses_user_order_idx on public.courses(user_id, sort_order, created_at);
create index workspaces_user_order_idx on public.workspaces(user_id, sort_order, created_at);
create index courses_workspace_order_idx on public.courses(workspace_id, sort_order, created_at);
create index lecture_sessions_course_order_idx on public.lecture_sessions(course_id, sort_order, created_at);
create index transcript_segments_session_order_idx on public.transcript_segments(session_id, sort_order, created_at);
create index session_translations_session_idx on public.session_translations(session_id);

alter table public.user_preferences enable row level security;
alter table public.workspaces enable row level security;
alter table public.courses enable row level security;
alter table public.lecture_sessions enable row level security;
alter table public.transcript_segments enable row level security;
alter table public.session_translations enable row level security;

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.courses to authenticated;
grant select, insert, update, delete on public.lecture_sessions to authenticated;
grant select, insert, update, delete on public.transcript_segments to authenticated;
grant select, insert, update, delete on public.session_translations to authenticated;

create policy "Users can manage their preferences"
  on public.user_preferences
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their workspaces"
  on public.workspaces
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their courses"
  on public.courses
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.workspaces
      where workspaces.id = courses.workspace_id
      and workspaces.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.workspaces
      where workspaces.id = courses.workspace_id
      and workspaces.user_id = auth.uid()
    )
  );

create policy "Users can manage their lecture sessions"
  on public.lecture_sessions
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.courses
      where courses.id = lecture_sessions.course_id
      and courses.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.courses
      where courses.id = lecture_sessions.course_id
      and courses.user_id = auth.uid()
    )
  );

create policy "Users can manage their transcript segments"
  on public.transcript_segments
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.lecture_sessions
      where lecture_sessions.id = transcript_segments.session_id
      and lecture_sessions.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.lecture_sessions
      where lecture_sessions.id = transcript_segments.session_id
      and lecture_sessions.user_id = auth.uid()
    )
  );

create policy "Users can manage their session translations"
  on public.session_translations
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.lecture_sessions
      where lecture_sessions.id = session_translations.session_id
      and lecture_sessions.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.lecture_sessions
      where lecture_sessions.id = session_translations.session_id
      and lecture_sessions.user_id = auth.uid()
    )
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create trigger workspaces_set_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

create trigger lecture_sessions_set_updated_at
  before update on public.lecture_sessions
  for each row execute function public.set_updated_at();

create trigger session_translations_set_updated_at
  before update on public.session_translations
  for each row execute function public.set_updated_at();
