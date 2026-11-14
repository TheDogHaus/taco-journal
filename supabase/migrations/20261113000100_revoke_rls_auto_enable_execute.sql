-- Supabase installs public.rls_auto_enable() as an event trigger helper that turns on
-- row level security for new tables. It only needs to run as an event trigger, so
-- remove the (unneeded) permission for anyone to call it through the public API.
-- This clears the "SECURITY DEFINER function executable" security advisor warnings.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
