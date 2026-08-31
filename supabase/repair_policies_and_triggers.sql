drop policy if exists "Users can manage their transcript segments" on public.transcript_segments;
drop policy if exists "Users can manage their session translations" on public.session_translations;

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

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

drop trigger if exists lecture_sessions_set_updated_at on public.lecture_sessions;
create trigger lecture_sessions_set_updated_at
  before update on public.lecture_sessions
  for each row execute function public.set_updated_at();

drop trigger if exists session_translations_set_updated_at on public.session_translations;
create trigger session_translations_set_updated_at
  before update on public.session_translations
  for each row execute function public.set_updated_at();
