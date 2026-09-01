alter table public.lecture_sessions
  add column if not exists summary text not null default '';

alter table public.lecture_sessions
  add column if not exists summary_language text not null default 'en';

alter table public.lecture_sessions
  add column if not exists summaries jsonb not null default '{}'::jsonb;
