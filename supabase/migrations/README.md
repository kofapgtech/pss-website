# Supabase migrations

`20260917_lovewell_core_schema.sql` is the schema that is already applied
to the `pride-south-side` project (`jcskmaiqkdoxubfsdons`). It is checked
in so the database is reproducible and reviewable alongside the site.

Re-apply it to a fresh project with the Supabase CLI:

```sh
supabase link --project-ref <ref>
supabase db push
```
