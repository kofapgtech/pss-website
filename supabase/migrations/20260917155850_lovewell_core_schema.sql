-- =====================================================================
-- Pride South Side / Lovewell — core schema
-- Phase 1: membership, community posting, and content directories.
-- Content tables ship EMPTY on purpose; the site renders "coming soon"
-- placeholders until real data is imported.
-- =====================================================================

-- ---------------------------------------------------------------------
-- profiles: one row per Lovewell member, created on sign-up.
-- Membership == having a profile. membership_tier is reserved for the
-- paid tiers described in the program overview; everyone starts 'free'.
-- ---------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users on delete cascade,
  display_name    text not null check (char_length(display_name) between 1 and 80),
  pronouns        text check (char_length(pronouns) <= 40),
  neighborhood    text check (char_length(neighborhood) <= 80),
  bio             text check (char_length(bio) <= 500),
  avatar_url      text,
  role            text not null default 'member'
                    check (role in ('member', 'moderator', 'admin')),
  membership_tier text not null default 'free'
                    check (membership_tier in ('free', 'supporter', 'partner')),
  member_since    timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.profiles is
  'One row per Lovewell member. Created automatically by handle_new_user() when someone signs up. Deleting the auth user deletes the profile and, by cascade, their posts and comments.';
comment on column public.profiles.membership_tier is
  'Reserved for future paid tiers. Phase 1 membership is free, so every member is ''free'' until a billing integration exists.';

-- ---------------------------------------------------------------------
-- posts / post_comments: the Social Community Hub.
-- status supports moderation: new posts are 'published' by default but a
-- moderator can flip one to 'removed' without destroying the record.
-- ---------------------------------------------------------------------
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 5000),
  status     text not null default 'published'
               check (status in ('published', 'pending', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.posts.status is
  'published = visible to members. pending = awaiting moderation (used if member-submitted articles are switched on). removed = hidden by a moderator but retained for the record.';

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_author_idx on public.posts (author_id);

create table public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 2000),
  status     text not null default 'published'
               check (status in ('published', 'removed')),
  created_at timestamptz not null default now()
);

create index post_comments_post_idx on public.post_comments (post_id, created_at);

create table public.post_reactions (
  post_id    uuid not null references public.posts(id) on delete cascade,
  member_id  uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, member_id)
);

-- ---------------------------------------------------------------------
-- events: the Community Calendar. Published rows are world-readable so
-- the calendar works for logged-out visitors.
-- ---------------------------------------------------------------------
create table public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  summary      text,
  description  text,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  venue_name   text,
  address      text,
  neighborhood text,
  category     text,
  external_url text,
  image_url    text,
  is_featured  boolean not null default false,
  status       text not null default 'published'
                 check (status in ('draft', 'published', 'archived')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint events_end_after_start check (ends_at is null or ends_at >= starts_at)
);

create index events_starts_at_idx on public.events (starts_at);

-- event_submissions: the "Submit Your Event" CTA. Anyone may insert;
-- nobody may read back through the API. Organisers triage in the
-- Supabase dashboard (service role).
create table public.event_submissions (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  starts_at      timestamptz,
  venue_name     text,
  details        text,
  external_url   text,
  contact_name   text,
  contact_email  text not null,
  submitted_by   uuid references public.profiles(id) on delete set null,
  review_status  text not null default 'new'
                   check (review_status in ('new', 'approved', 'declined')),
  created_at     timestamptz not null default now()
);

comment on table public.event_submissions is
  'Write-only from the public site: there is an insert policy and deliberately no select policy. Review submissions with the service role.';

-- ---------------------------------------------------------------------
-- health_providers: the Community Healthcare Directory (FQHCs and
-- queer-affirming clinics). Ships empty — the site shows a placeholder.
-- ---------------------------------------------------------------------
create table public.health_providers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  provider_type text check (provider_type in ('fqhc', 'clinic', 'community_org', 'other')),
  address       text,
  neighborhood  text,
  phone         text,
  website       text,
  services      text[],
  is_affirming  boolean not null default true,
  notes         text,
  status        text not null default 'published'
                  check (status in ('draft', 'published', 'archived')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- partner_orgs: the paid "Directory of Services" tier for collective
-- organisations and partners.
-- ---------------------------------------------------------------------
create table public.partner_orgs (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  logo_url        text,
  address         text,
  neighborhood    text,
  focus_areas     text[],
  website         text,
  description     text,
  subscription    text not null default 'directory'
                    check (subscription in ('directory', 'storytelling', 'both')),
  status          text not null default 'draft'
                    check (status in ('draft', 'published', 'archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- marketplace_products: Pride South Side Marketplace. Empty in Phase 1
-- (the shop is a "coming soon" stub), but member_price_cents is here so
-- Lovewell member pricing is representable from day one.
-- ---------------------------------------------------------------------
create table public.marketplace_products (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  vendor_name        text,
  description        text,
  image_url          text,
  price_cents        integer check (price_cents >= 0),
  member_price_cents integer check (member_price_cents >= 0),
  external_url       text,
  status             text not null default 'draft'
                       check (status in ('draft', 'published', 'archived')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint marketplace_member_price_not_higher
    check (member_price_cents is null or price_cents is null
           or member_price_cents <= price_cents)
);

-- ---------------------------------------------------------------------
-- newsletter_signups: mailing-list capture. Write-only, like submissions.
-- ---------------------------------------------------------------------
create table public.newsletter_signups (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Helpers
-- =====================================================================

-- Role lookup used by the moderation policies. SECURITY DEFINER so the
-- policy can read profiles without recursing through profiles' own RLS.
create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role in ('moderator', 'admin')
  );
$$;

-- Sign-up hook: mint a profile for every new auth user. display_name
-- comes from the sign-up form's metadata, falling back to the part of
-- the email before the @ so the column is never empty.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, pronouns, neighborhood)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    nullif(btrim(new.raw_user_meta_data ->> 'pronouns'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'neighborhood'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generic updated_at bump.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();
create trigger health_providers_touch before update on public.health_providers
  for each row execute function public.touch_updated_at();
create trigger partner_orgs_touch before update on public.partner_orgs
  for each row execute function public.touch_updated_at();
create trigger marketplace_products_touch before update on public.marketplace_products
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.profiles             enable row level security;
alter table public.posts                enable row level security;
alter table public.post_comments        enable row level security;
alter table public.post_reactions       enable row level security;
alter table public.events               enable row level security;
alter table public.event_submissions    enable row level security;
alter table public.health_providers     enable row level security;
alter table public.partner_orgs         enable row level security;
alter table public.marketplace_products enable row level security;
alter table public.newsletter_signups   enable row level security;

-- profiles: members see each other (it is a community hub); only the
-- owner may edit their own row, and only a moderator may change roles.
create policy profiles_select_members on public.profiles
  for select to authenticated using (true);
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy profiles_moderate on public.profiles
  for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());

-- posts: members read published posts (plus their own, whatever the
-- status, so a pending post does not vanish from its author's view).
create policy posts_select on public.posts
  for select to authenticated
  using (status = 'published' or author_id = (select auth.uid()) or public.is_moderator());
create policy posts_insert_own on public.posts
  for insert to authenticated with check (author_id = (select auth.uid()));
create policy posts_update_own on public.posts
  for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy posts_delete_own on public.posts
  for delete to authenticated using (author_id = (select auth.uid()));
create policy posts_moderate on public.posts
  for update to authenticated
  using (public.is_moderator()) with check (public.is_moderator());
create policy posts_moderate_delete on public.posts
  for delete to authenticated using (public.is_moderator());

-- comments
create policy comments_select on public.post_comments
  for select to authenticated
  using (status = 'published' or author_id = (select auth.uid()) or public.is_moderator());
create policy comments_insert_own on public.post_comments
  for insert to authenticated with check (author_id = (select auth.uid()));
create policy comments_delete_own on public.post_comments
  for delete to authenticated
  using (author_id = (select auth.uid()) or public.is_moderator());

-- reactions
create policy reactions_select on public.post_reactions
  for select to authenticated using (true);
create policy reactions_insert_own on public.post_reactions
  for insert to authenticated with check (member_id = (select auth.uid()));
create policy reactions_delete_own on public.post_reactions
  for delete to authenticated using (member_id = (select auth.uid()));

-- Public content: readable by everyone, including logged-out visitors.
create policy events_select_published on public.events
  for select to anon, authenticated using (status = 'published');
create policy providers_select_published on public.health_providers
  for select to anon, authenticated using (status = 'published');
create policy partners_select_published on public.partner_orgs
  for select to anon, authenticated using (status = 'published');
create policy products_select_published on public.marketplace_products
  for select to anon, authenticated using (status = 'published');

-- Write-only intake: insert allowed, no select policy by design.
create policy event_submissions_insert on public.event_submissions
  for insert to anon, authenticated with check (true);
create policy newsletter_insert on public.newsletter_signups
  for insert to anon, authenticated with check (true);
