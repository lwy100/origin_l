-- Signal Garden shared comments and likes.
-- Run this entire file in Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.place_comments (
  id uuid primary key default gen_random_uuid(),
  place_key text not null check (char_length(place_key) between 1 and 160),
  name text not null default '匿名旅人' check (char_length(name) between 1 and 16),
  body text not null check (char_length(body) between 1 and 120),
  created_at timestamptz not null default now()
);


create table if not exists public.owner_visits (
  place_key text primary key check (char_length(place_key) between 1 and 160),
  updated_at timestamptz not null default now()
);

alter table public.owner_visits enable row level security;
revoke all on public.owner_visits from anon, authenticated;
grant select on public.owner_visits to anon, authenticated;
grant insert, delete on public.owner_visits to authenticated;

drop policy if exists "public can read owner visits" on public.owner_visits;
drop policy if exists "owner can insert visits" on public.owner_visits;
drop policy if exists "owner can update visits" on public.owner_visits;
drop policy if exists "owner can delete visits" on public.owner_visits;

create policy "public can read owner visits"
on public.owner_visits for select
to anon, authenticated
using (true);

create policy "owner can insert visits"
on public.owner_visits for insert
to authenticated
with check (lower(auth.jwt() ->> 'email') = '1142516819@qq.com');

create policy "owner can update visits"
on public.owner_visits for update
to authenticated
using (lower(auth.jwt() ->> 'email') = '1142516819@qq.com')
with check (lower(auth.jwt() ->> 'email') = '1142516819@qq.com');

create policy "owner can delete visits"
on public.owner_visits for delete
to authenticated
using (lower(auth.jwt() ->> 'email') = '1142516819@qq.com');

create table if not exists public.place_likes (
  visitor_id uuid not null,
  place_key text not null check (char_length(place_key) between 1 and 160),
  created_at timestamptz not null default now(),
  primary key (visitor_id, place_key)
);

create table if not exists public.quote_likes (
  visitor_id uuid not null,
  quote_id text not null check (char_length(quote_id) between 1 and 80),
  created_at timestamptz not null default now(),
  primary key (visitor_id, quote_id)
);

alter table public.place_comments enable row level security;
alter table public.place_likes enable row level security;
alter table public.quote_likes enable row level security;

revoke all on public.place_comments from anon, authenticated;
revoke all on public.place_likes from anon, authenticated;
revoke all on public.quote_likes from anon, authenticated;

grant select on public.place_comments to anon, authenticated;
grant insert(place_key, name, body) on public.place_comments to anon, authenticated;

drop policy if exists "public can read comments" on public.place_comments;
drop policy if exists "public can add short comments" on public.place_comments;

create policy "public can read comments"
on public.place_comments for select
to anon, authenticated
using (true);

create policy "public can add short comments"
on public.place_comments for insert
to anon, authenticated
with check (
  char_length(trim(name)) between 1 and 16
  and char_length(trim(body)) between 1 and 120
  and char_length(place_key) between 1 and 160
);

create or replace view public.place_like_counts
with (security_invoker = false)
as
select place_key, count(*)::bigint as like_count
from public.place_likes
group by place_key;

create or replace view public.quote_like_counts
with (security_invoker = false)
as
select quote_id, count(*)::bigint as like_count
from public.quote_likes
group by quote_id;

grant select on public.place_like_counts to anon, authenticated;
grant select on public.quote_like_counts to anon, authenticated;


create or replace function public.get_visitor_place_likes(p_visitor_id uuid)
returns table(place_key text)
language sql
security definer
set search_path = public
as $$
  select pl.place_key from public.place_likes pl where pl.visitor_id = p_visitor_id;
$$;

create or replace function public.get_visitor_quote_likes(p_visitor_id uuid)
returns table(quote_id text)
language sql
security definer
set search_path = public
as $$
  select ql.quote_id from public.quote_likes ql where ql.visitor_id = p_visitor_id;
$$;

create or replace function public.toggle_place_like(p_place_key text, p_visitor_id uuid)
returns table(liked boolean, like_count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_visitor_id is null or char_length(p_place_key) not between 1 and 160 then
    raise exception 'invalid place key';
  end if;

  if exists(select 1 from public.place_likes where visitor_id = p_visitor_id and place_key = p_place_key) then
    delete from public.place_likes where visitor_id = p_visitor_id and place_key = p_place_key;
    liked := false;
  else
    insert into public.place_likes(visitor_id, place_key) values (p_visitor_id, p_place_key);
    liked := true;
  end if;

  select count(*) into like_count from public.place_likes where place_key = p_place_key;
  return next;
end;
$$;

create or replace function public.toggle_quote_like(p_quote_id text, p_visitor_id uuid)
returns table(liked boolean, like_count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_visitor_id is null or char_length(p_quote_id) not between 1 and 80 then
    raise exception 'invalid quote id';
  end if;

  if exists(select 1 from public.quote_likes where visitor_id = p_visitor_id and quote_id = p_quote_id) then
    delete from public.quote_likes where visitor_id = p_visitor_id and quote_id = p_quote_id;
    liked := false;
  else
    insert into public.quote_likes(visitor_id, quote_id) values (p_visitor_id, p_quote_id);
    liked := true;
  end if;

  select count(*) into like_count from public.quote_likes where quote_id = p_quote_id;
  return next;
end;
$$;

revoke all on function public.get_visitor_place_likes(uuid) from public;
revoke all on function public.get_visitor_quote_likes(uuid) from public;
revoke all on function public.toggle_place_like(text, uuid) from public;
revoke all on function public.toggle_quote_like(text, uuid) from public;
grant execute on function public.get_visitor_place_likes(uuid) to anon, authenticated;
grant execute on function public.get_visitor_quote_likes(uuid) to anon, authenticated;
grant execute on function public.toggle_place_like(text, uuid) to anon, authenticated;
grant execute on function public.toggle_quote_like(text, uuid) to anon, authenticated;
