-- handle_new_user() is a trigger function on auth.users. Nothing should
-- ever reach it through PostgREST, so take it off the exposed API.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- is_moderator() is referenced by the RLS policies on posts, comments and
-- profiles. Policy expressions run as the querying role, so `authenticated`
-- must keep EXECUTE or those policies fail. `anon` never hits a policy that
-- calls it, so drop its grant and stop exposing the RPC to logged-out
-- callers.
revoke all on function public.is_moderator() from public, anon;
grant execute on function public.is_moderator() to authenticated;
