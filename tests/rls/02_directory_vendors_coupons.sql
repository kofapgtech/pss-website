-- Care directory, vendor and coupon RLS, plus the data constraints.
-- Raises a PASS/FAIL summary and aborts, so nothing is persisted.
-- The final "ERROR: P0001" is the expected rollback — read its message.
do $$
declare
  a uuid := gen_random_uuid();
  vid uuid; n int; r text := ''; txt text;
begin
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                          email_confirmed_at, created_at, updated_at,
                          raw_app_meta_data, raw_user_meta_data)
  values (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          'rls-a@example.com', 'x', now(), now(), now(), '{}', '{"display_name":"Ada"}');

  insert into public.vendors (name, latitude, longitude, status)
    values ('Vendor Pub', 41.8, -87.6, 'published') returning id into vid;
  insert into public.vendors (name, status) values ('Vendor Draft', 'draft');

  insert into public.coupons (vendor_id, title, member_only, status)
    values (vid, 'Member Coupon', true, 'published');
  insert into public.coupons (vendor_id, title, member_only, status)
    values (vid, 'Public Coupon', false, 'published');
  insert into public.coupons (vendor_id, title, member_only, status)
    values (vid, 'Draft Coupon', true, 'draft');

  insert into public.health_providers (name, services, latitude, longitude, status)
    values ('Prov Pub', array['prep-prescribers','sti-testing'], 41.88, -87.63, 'published');
  insert into public.health_providers (name, status) values ('Prov Draft', 'draft');

  -- ---- anonymous visitor ----
  perform set_config('role','anon',true);
  perform set_config('request.jwt.claims', json_build_object('role','anon')::text, true);

  select count(*) into n from public.care_categories;
  r := r || format(E'01 anon reads filter vocabulary: %s (want 4) %s\n', n, case when n=4 then 'PASS' else 'FAIL' end);

  select count(*) into n from public.vendors;
  r := r || format(E'02 anon sees only published vendors: %s (want 1) %s\n', n, case when n=1 then 'PASS' else 'FAIL' end);

  select count(*) into n from public.coupons;
  r := r || format(E'03 anon sees ONLY non-member coupons: %s (want 1) %s\n', n, case when n=1 then 'PASS' else 'FAIL' end);

  select title into txt from public.coupons;
  r := r || format(E'04 and it is the public one: %s %s\n', txt, case when txt='Public Coupon' then 'PASS' else 'FAIL' end);

  select count(*) into n from public.health_providers;
  r := r || format(E'05 anon sees only published providers: %s (want 1) %s\n', n, case when n=1 then 'PASS' else 'FAIL' end);

  begin
    insert into public.vendors (name) values ('anon vendor');
    r := r || E'06 anon cannot create vendors: FAIL\n';
  exception when insufficient_privilege then
    r := r || E'06 anon cannot create vendors: PASS\n';
  end;

  begin
    insert into public.coupons (title) values ('anon coupon');
    r := r || E'07 anon cannot create coupons: FAIL\n';
  exception when insufficient_privilege then
    r := r || E'07 anon cannot create coupons: PASS\n';
  end;

  -- ---- signed-in member ----
  perform set_config('role','authenticated',true);
  perform set_config('request.jwt.claims', json_build_object('sub',a,'role','authenticated')::text, true);

  select count(*) into n from public.coupons;
  r := r || format(E'08 member sees member+public coupons: %s (want 2) %s\n', n, case when n=2 then 'PASS' else 'FAIL' end);

  select count(*) into n from public.coupons where status = 'draft';
  r := r || format(E'09 member cannot see draft coupons: %s (want 0) %s\n', n, case when n=0 then 'PASS' else 'FAIL' end);

  select count(*) into n from public.health_providers
    where services @> array['prep-prescribers'];
  r := r || format(E'10 filter-by-concern query works: %s (want 1) %s\n', n, case when n=1 then 'PASS' else 'FAIL' end);

  begin
    update public.coupons set title = 'hijacked' where status='published';
    get diagnostics n = row_count;
    r := r || format(E'11 member cannot edit coupons: %s rows (want 0) %s\n', n, case when n=0 then 'PASS' else 'FAIL' end);
  exception when insufficient_privilege then
    r := r || E'11 member cannot edit coupons: PASS\n';
  end;

  begin
    update public.health_providers set name = 'hijacked' where status='published';
    get diagnostics n = row_count;
    r := r || format(E'12 member cannot edit providers: %s rows (want 0) %s\n', n, case when n=0 then 'PASS' else 'FAIL' end);
  exception when insufficient_privilege then
    r := r || E'12 member cannot edit providers: PASS\n';
  end;

  -- ---- data integrity ----
  perform set_config('role','postgres',true);
  begin
    insert into public.vendors (name, latitude) values ('half-mapped', 41.8);
    r := r || E'13 half-set coordinates rejected: FAIL\n';
  exception when check_violation then
    r := r || E'13 half-set coordinates rejected: PASS\n';
  end;

  begin
    insert into public.coupons (title, valid_from, valid_until)
      values ('backwards', now(), now() - interval '1 day');
    r := r || E'14 backwards validity window rejected: FAIL\n';
  exception when check_violation then
    r := r || E'14 backwards validity window rejected: PASS\n';
  end;

  raise exception E'\n%', r;
end $$;
