-- Operation: Mission Complete — Supabase schema
--
-- Paste this entire file into Supabase → SQL Editor → New query → Run.
-- Idempotent: safe to re-run; tables only created if they don't exist.
--
-- Design:
--   • rsvps        — one row per guest (email-unique).
--   • config       — single-row key/value store for tunable settings,
--                    today just the adventure capacity. FOR UPDATE
--                    locking on the config row serializes capacity
--                    checks at submission time — no race.
--   • RLS stays OFF; every write path goes through a server action
--                    using the service-role key.

create extension if not exists "pgcrypto";

create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Which LINK they came in through (determines what options they saw).
  invite_type text not null
    check (invite_type in ('adventure', 'welcome')),

  -- What they actually picked. 'declined' lets ops mark "RSVP'd no"
  -- without losing the contact (useful if someone replies via text/email
  -- and we want to record them as accounted-for).
  rsvp_choice text not null
    check (rsvp_choice in ('adventure', 'welcome', 'declined')),

  first_name text not null,
  last_name text not null,
  email text not null,
  mobile_phone text not null,
  guest_count int not null default 1 check (guest_count between 1 and 10),
  dietary_restrictions text,
  meal_choice text check (meal_choice in ('beef', 'chicken')),

  admin_notes text
);

-- Email-uniqueness so the same person can't double-RSVP. Case-insensitive
-- because guests will type their email in various casings.
create unique index if not exists rsvps_email_unique
  on rsvps (lower(email));

-- Fast lookup by invite_type / rsvp_choice for the dashboard counters
-- and the capacity check.
create index if not exists rsvps_rsvp_choice_idx on rsvps (rsvp_choice);
create index if not exists rsvps_invite_type_idx on rsvps (invite_type);

-- Auto-bump updated_at on every UPDATE.
create or replace function rsvps_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists rsvps_updated_at on rsvps;
create trigger rsvps_updated_at
  before update on rsvps
  for each row execute function rsvps_set_updated_at();

-- ─── Config ───────────────────────────────────────────────────────────
create table if not exists config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seed the adventure capacity. Editable from /admin/dashboard.
insert into config (key, value)
values ('adventure_capacity', '50'::jsonb)
on conflict (key) do nothing;

-- ─── reserve_adventure_seat ───────────────────────────────────────────
-- Race-safe insert for adventure RSVPs. Locks the config row, reads the
-- current adventure count, raises 'capacity_full' if the cap is hit,
-- otherwise inserts the row. Returns the new RSVP id on success.
--
-- Why an RPC: Supabase JS doesn't expose SELECT ... FOR UPDATE in a
-- clean way. Wrapping the count + insert in a single SQL function gets
-- us the transaction + the row lock + a single round-trip from the
-- server action.
create or replace function reserve_adventure_seat(
  p_invite_type text,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_mobile_phone text,
  p_guest_count int,
  p_dietary_restrictions text,
  p_meal_choice text
) returns uuid
language plpgsql
as $$
declare
  v_cap int;
  v_taken int;
  v_id uuid;
begin
  -- Lock the config row so two concurrent adventure RSVPs can't both
  -- read taken=49 and both insert. The lock holds until the
  -- transaction commits.
  select (value)::text::int into v_cap
  from config
  where key = 'adventure_capacity'
  for update;

  select count(*) into v_taken
  from rsvps
  where rsvp_choice = 'adventure';

  if v_taken >= v_cap then
    raise exception 'capacity_full' using errcode = 'P0001';
  end if;

  insert into rsvps (
    invite_type, rsvp_choice, first_name, last_name, email,
    mobile_phone, guest_count, dietary_restrictions, meal_choice
  )
  values (
    p_invite_type, 'adventure', p_first_name, p_last_name, p_email,
    p_mobile_phone, p_guest_count, p_dietary_restrictions, p_meal_choice
  )
  returning id into v_id;

  return v_id;
end;
$$;

