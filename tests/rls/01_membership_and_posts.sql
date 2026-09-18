-- Membership and community-feed RLS.
-- Raises a PASS/FAIL summary and aborts, so nothing is persisted.
-- The final "ERROR: P0001" is the expected rollback — read its message.
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  pid uuid; n int; ok boolean; txt text; r text := '';
begin
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                          email_confirmed_at, created_at, updated_at,
                          raw_app_meta_data, raw_user_meta_data)
  values
    (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'test-a@example.com', 'x', now(), now(), now(), '{}',
     '{"display_name":"Ada Test","pronouns":"they/them","neighborhood":"Bronzeville"}'),
    (b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'test-b@example.com', 'x', now(), now(), now(), '{}', '{}');

  select count(*) into n from public.profiles where id in (a, b);
  r := r || format(E'01 signup creates profile: %s (want 2) %s\n', n, case when n=2 then 'PASS' else 'FAIL' end);

  select (display_name='Ada Test' and pronouns='they/them' and neighborhood='Bronzeville')
    into ok from public.profiles where id=a;
  r := r || format(E'02 signup metadata copied: %s %s\n', ok, case when ok then 'PASS' else 'FAIL' end);

  select display_name into txt from public.profiles where id=b;
  r := r || format(E'03 display_name fallback: %s (want test-b) %s\n', txt, case when txt='test-b' then 'PASS' else 'FAIL' end);

  perform set_config('role','authenticated',true);
  perform set_config('request.jwt.claims', json_build_object('sub',a,'role','authenticated')::text, true);

  insert into public.posts (author_id, body) values (a,'hello neighbors') returning id into pid;
  r := r || E'04 member can create post: PASS\n';

  select count(*) into n from public.posts where id=pid;
  r := r || format(E'05 author reads own post: %s (want 1) %s\n', n, case when n=1 then 'PASS' else 'FAIL' end);

  begin
    insert into public.posts (author_id, body) values (b,'impersonation');
    r := r || E'06 impersonation blocked: FAIL (insert succeeded)\n';
  exception when insufficient_privilege then
    r := r || E'06 impersonation blocked: PASS\n';
  end;

  perform set_config('request.jwt.claims', json_build_object('sub',b,'role','authenticated')::text, true);

  update public.posts set body='hijacked' where id=pid;
  get diagnostics n = row_count;
  r := r || format(E'07 other member cannot edit: %s rows (want 0) %s\n', n, case when n=0 then 'PASS' else 'FAIL' end);

  select count(*) into n from public.posts where id=pid;
  r := r || format(E'08 other member can read feed: %s (want 1) %s\n', n, case when n=1 then 'PASS' else 'FAIL' end);

  insert into public.post_comments (post_id, author_id, body) values (pid,b,'welcome!');
  r := r || E'09 member can comment: PASS\n';

  delete from public.posts where id=pid;
  get diagnostics n = row_count;
  r := r || format(E'10 other member cannot delete: %s rows (want 0) %s\n', n, case when n=0 then 'PASS' else 'FAIL' end);

  perform set_config('role','anon',true);
  perform set_config('request.jwt.claims', json_build_object('role','anon')::text, true);

  select count(*) into n from public.posts;
  r := r || format(E'11 anon cannot read posts: %s (want 0) %s\n', n, case when n=0 then 'PASS' else 'FAIL' end);

  select count(*) into n from public.profiles;
  r := r || format(E'12 anon cannot read profiles: %s (want 0) %s\n', n, case when n=0 then 'PASS' else 'FAIL' end);

  insert into public.event_submissions (title, contact_email) values ('Test event','x@example.com');
  r := r || E'13 anon can submit event: PASS\n';

  select count(*) into n from public.event_submissions;
  r := r || format(E'14 anon cannot read submissions: %s (want 0) %s\n', n, case when n=0 then 'PASS' else 'FAIL' end);

  select count(*) into n from public.events;
  r := r || format(E'15 anon can query public events: %s rows, no error PASS\n', n);

  perform set_config('role','postgres',true);
  raise exception E'\n%', r;
end $$;
