-- Local pgTAP validation for 001_seguridad_acceso.sql.
-- Run only against a local Supabase stack:
--   supabase test db
-- This file neither connects to nor changes the remote project.

begin;

select plan(24);

-- Required tables exist.
select ok(to_regclass('public.empresas') is not null, 'empresas exists');
select ok(to_regclass('public.usuarios') is not null, 'usuarios exists');
select ok(to_regclass('public.recursos') is not null, 'recursos exists');
select ok(to_regclass('public.permisos') is not null, 'permisos exists');
select ok(to_regclass('public.permisos_usuario') is not null, 'permisos_usuario exists');
select ok(to_regclass('public.auditorias_acceso') is not null, 'auditorias_acceso exists');

-- RLS is enabled on every application table.
select is(
  (select relrowsecurity from pg_class where oid = 'public.empresas'::regclass),
  true,
  'empresas has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.usuarios'::regclass),
  true,
  'usuarios has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.recursos'::regclass),
  true,
  'recursos has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.permisos'::regclass),
  true,
  'permisos has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.permisos_usuario'::regclass),
  true,
  'permisos_usuario has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.auditorias_acceso'::regclass),
  true,
  'auditorias_acceso has RLS enabled'
);

-- Browser roles receive no write privileges to the access-control schema.
select is(has_table_privilege('anon', 'public.empresas', 'select'), false, 'anon cannot read empresas');
select is(has_table_privilege('anon', 'public.usuarios', 'select'), false, 'anon cannot read usuarios');
select is(has_table_privilege('authenticated', 'public.empresas', 'insert'), false, 'authenticated cannot create empresas');
select is(has_table_privilege('authenticated', 'public.usuarios', 'insert'), false, 'authenticated cannot create usuarios');
select is(has_table_privilege('authenticated', 'public.permisos_usuario', 'update'), false, 'authenticated cannot change permissions');
select is(has_table_privilege('authenticated', 'public.auditorias_acceso', 'delete'), false, 'authenticated cannot delete audit records');

-- Only the safe read paths are granted to authenticated users.
select is(has_table_privilege('authenticated', 'public.recursos', 'select'), true, 'authenticated can read resources through RLS');
select is(has_table_privilege('authenticated', 'public.permisos', 'select'), true, 'authenticated can read permissions through RLS');
select is(has_table_privilege('authenticated', 'public.usuarios', 'select'), true, 'authenticated can read own user through RLS');
select is(has_table_privilege('authenticated', 'public.permisos_usuario', 'select'), true, 'authenticated can read own permissions through RLS');

-- The initial catalog is explicit and complete for the first scope.
select is((select count(*) from public.recursos), 6::bigint, 'six initial resources exist');
select is((select count(*) from public.permisos), 22::bigint, 'twenty-two initial permissions exist');

select * from finish();

rollback;
