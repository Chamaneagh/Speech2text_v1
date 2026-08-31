grant usage on schema public to authenticated;

grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.courses to authenticated;
grant select, insert, update, delete on public.lecture_sessions to authenticated;
grant select, insert, update, delete on public.transcript_segments to authenticated;
grant select, insert, update, delete on public.session_translations to authenticated;
