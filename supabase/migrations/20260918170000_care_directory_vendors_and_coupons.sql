-- =====================================================================
-- Care directory filtering + maps, participating vendors, and member
-- coupons. All content tables stay EMPTY; only the filter vocabulary is
-- seeded, using the exact category names the program specified.
-- =====================================================================

create table public.care_categories (
  slug       text primary key,
  label      text not null,
  sort_order integer not null default 100,
  status     text not null default 'published'
               check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

comment on table public.care_categories is
  'Controlled vocabulary for filtering the healthcare directory. health_providers.services holds these slugs.';

insert into public.care_categories (slug, label, sort_order) values
  ('prep-prescribers',      'PrEP prescribers',       10),
  ('sti-testing',           'STI Testing',            20),
  ('gender-affirming-care', 'Gender Affirming Care',  30),
  ('family-therapist',      'Family Therapist',       40);

alter table public.health_providers
  add column latitude  double precision check (latitude between -90 and 90),
  add column longitude double precision check (longitude between -180 and 180);

comment on column public.health_providers.services is
  'Slugs from care_categories. Drives the "filter by concern" chips.';

-- A provider is mappable only with both coordinates, never one.
alter table public.health_providers
  add constraint health_providers_coords_paired
    check ((latitude is null) = (longitude is null));

create index health_providers_services_idx
  on public.health_providers using gin (services);

create table public.vendors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  address       text,
  neighborhood  text,
  website       text,
  phone         text,
  logo_url      text,
  latitude      double precision check (latitude between -90 and 90),
  longitude     double precision check (longitude between -180 and 180),
  is_participating boolean not null default true,
  status        text not null default 'draft'
                  check (status in ('draft', 'published', 'archived')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint vendors_coords_paired check ((latitude is null) = (longitude is null))
);

comment on column public.vendors.is_participating is
  'Whether this vendor currently honours Lovewell member discounts. A vendor can stay published on the map after it stops participating.';

-- wallet_pass_url points at a signed Apple Wallet .pkpass file. Signing a
-- pass requires an Apple Developer Pass Type ID certificate and a
-- server-side signer, which does not exist yet — so the column is
-- nullable and the UI offers the Wallet button only when it is set.
create table public.coupons (
  id              uuid primary key default gen_random_uuid(),
  vendor_id       uuid references public.vendors(id) on delete cascade,
  title           text not null,
  description     text,
  discount_text   text,
  code            text,
  redeem_url      text,
  wallet_pass_url text,
  terms           text,
  member_only     boolean not null default true,
  valid_from      timestamptz,
  valid_until     timestamptz,
  status          text not null default 'draft'
                    check (status in ('draft', 'published', 'archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint coupons_valid_window check (valid_until is null or valid_from is null
                                         or valid_until >= valid_from)
);

comment on column public.coupons.wallet_pass_url is
  'URL of a signed .pkpass file. Null until Apple Wallet pass signing is set up; the UI hides the Add to Apple Wallet button while it is null.';
comment on column public.coupons.member_only is
  'member_only coupons are readable by authenticated members only. Non-member coupons are public, so a discount can be used to advertise membership.';

create index coupons_vendor_idx on public.coupons (vendor_id);

create trigger vendors_touch before update on public.vendors
  for each row execute function public.touch_updated_at();
create trigger coupons_touch before update on public.coupons
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.care_categories enable row level security;
alter table public.vendors         enable row level security;
alter table public.coupons         enable row level security;

-- Filter vocabulary and the vendor map are public: a logged-out visitor
-- should be able to see who participates before deciding to join.
create policy care_categories_select_published on public.care_categories
  for select to anon, authenticated using (status = 'published');

create policy vendors_select_published on public.vendors
  for select to anon, authenticated using (status = 'published');

-- Member-only coupons are exactly that: signing in is what reveals them.
create policy coupons_select_public on public.coupons
  for select to anon
  using (status = 'published' and member_only = false);

create policy coupons_select_member on public.coupons
  for select to authenticated
  using (status = 'published');
