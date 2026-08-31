create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  sort_order integer not null default 0,
  collapsed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

grant select, insert, update, delete on public.workspaces to authenticated;

drop policy if exists "Users can manage their workspaces" on public.workspaces;
create policy "Users can manage their workspaces"
  on public.workspaces
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.courses
  add column if not exists workspace_id uuid references public.workspaces(id) on delete restrict;

insert into public.workspaces (user_id, name, sort_order, collapsed, created_at)
select courses.user_id, 'My Workspace', 0, false, min(courses.created_at)
from public.courses
where not exists (
  select 1 from public.workspaces
  where workspaces.user_id = courses.user_id
)
group by courses.user_id;

update public.courses
set workspace_id = (
  select workspaces.id
  from public.workspaces
  where workspaces.user_id = courses.user_id
  order by workspaces.sort_order, workspaces.created_at
  limit 1
)
where workspace_id is null;

alter table public.courses
  alter column workspace_id set not null;

drop policy if exists "Users can manage their courses" on public.courses;
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

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

create index if not exists workspaces_user_order_idx on public.workspaces(user_id, sort_order, created_at);
create index if not exists courses_workspace_order_idx on public.courses(workspace_id, sort_order, created_at);
