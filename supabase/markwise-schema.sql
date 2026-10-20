-- Markwise cloud sync schema for Supabase
-- Run this in Supabase SQL Editor before enabling cloud sync.
create table if not exists public.markwise_libraries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  library jsonb not null default '{"collections":[],"items":[]}'::jsonb
    check (jsonb_typeof(library) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.markwise_libraries enable row level security;

drop policy if exists "Users can read their own Markwise library" on public.markwise_libraries;
create policy "Users can read their own Markwise library"
  on public.markwise_libraries for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own Markwise library" on public.markwise_libraries;
create policy "Users can create their own Markwise library"
  on public.markwise_libraries for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own Markwise library" on public.markwise_libraries;
create policy "Users can update their own Markwise library"
  on public.markwise_libraries for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.markwise_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists markwise_libraries_set_updated_at on public.markwise_libraries;
create trigger markwise_libraries_set_updated_at
before update on public.markwise_libraries
for each row execute function public.markwise_set_updated_at();

-- Do not create a policy for anon/public access.
-- The app must use Supabase Auth and the publishable/anon key only.
-- Never put a service_role key in this repository or browser code.
