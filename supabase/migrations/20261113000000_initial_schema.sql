-- Taco Journal: initial schema, row level security, and private photo storage.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Every row belongs to one user (user_id) and is only visible to that user.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  city text not null default '' check (char_length(city) <= 200),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

-- One row per place per person (case-insensitive).
create unique index restaurants_user_name_city_key
  on public.restaurants (user_id, lower(name), lower(city));

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  restaurant_id uuid not null,
  visited_at timestamptz not null,
  status text not null check (status in ('quick', 'complete')),
  reaction text not null check (reaction in ('loved', 'liked', 'meh')),
  rating numeric(2, 1) check (rating is null or (rating >= 0.5 and rating <= 5)),
  would_return boolean,
  mood text,
  occasion text,
  companions text not null default '',
  price_tier smallint check (price_tier is null or price_tier between 1 and 4),
  amount_paid numeric(10, 2) check (amount_paid is null or amount_paid >= 0),
  salsa_heat smallint check (salsa_heat is null or salsa_heat between 1 and 4),
  notes text not null default '',
  is_favorite boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  -- A visit can only point at a restaurant owned by the same user.
  foreign key (restaurant_id, user_id)
    references public.restaurants (id, user_id) on delete cascade
);

create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  visit_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  reaction text check (reaction is null or reaction in ('loved', 'liked', 'meh')),
  order_again boolean not null default false,
  notes text not null default '',
  sort_order integer not null default 0,
  foreign key (visit_id, user_id)
    references public.visits (id, user_id) on delete cascade
);

-- One row per photo. The image file itself lives in Storage at
-- food-photos/<user_id>/<photo id>.jpg
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  visit_id uuid not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  foreign key (visit_id, user_id)
    references public.visits (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index visits_user_visited_idx on public.visits (user_id, visited_at desc);
create index visits_restaurant_idx on public.visits (restaurant_id);
create index dishes_visit_idx on public.dishes (visit_id);
create index dishes_user_idx on public.dishes (user_id);
create index photos_visit_idx on public.photos (visit_id);
create index photos_user_idx on public.photos (user_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger visits_set_updated_at
  before update on public.visits
  for each row execute function public.set_updated_at();

-- At most 3 photos per visit.
create function public.enforce_photo_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.photos where visit_id = new.visit_id) >= 3 then
    raise exception 'A visit can have at most 3 photos' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger photos_enforce_limit
  before insert on public.photos
  for each row execute function public.enforce_photo_limit();

-- ---------------------------------------------------------------------------
-- Row level security: people can only see and change their own rows
-- ---------------------------------------------------------------------------

alter table public.restaurants enable row level security;
alter table public.visits enable row level security;
alter table public.dishes enable row level security;
alter table public.photos enable row level security;

create policy "Users manage their own restaurants" on public.restaurants
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own visits" on public.visits
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own dishes" on public.dishes
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own photos" on public.photos
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Signed-out visitors get no access at all.
revoke all on public.restaurants, public.visits, public.dishes, public.photos from anon;

-- ---------------------------------------------------------------------------
-- Photo storage: a private bucket, one folder per user
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('food-photos', 'food-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

create policy "Users read their own photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'food-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users upload their own photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'food-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users update their own photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'food-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'food-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users delete their own photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'food-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
