alter table public.lecture_sessions
  add column if not exists summary text not null default '';
