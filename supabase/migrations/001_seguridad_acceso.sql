-- DRAFT FOR REVIEW ONLY.
-- Do not apply to a Supabase project without explicit owner approval.
-- Purpose: initial access-control schema for Gestión de consultorio.
-- This migration intentionally contains no custom functions, triggers, RPCs,
-- views, materialized views, scheduled jobs, or modifications to legacy tables.

begin;

create table public.empresas (
  id uuid primary key,
  nombre varchar(120) not null,
  estado varchar(16) not null,
  creado_en timestamptz not null,
  actualizado_en timestamptz not null,
  inactivado_en timestamptz,
  constraint empresas_nombre_no_vacio_chk check (char_length(btrim(nombre)) > 0),
  constraint empresas_estado_chk check (estado in ('activa', 'inactiva')),
  constraint empresas_inactivacion_chk check (
    (estado = 'activa' and inactivado_en is null)
    or (estado = 'inactiva' and inactivado_en is not null)
  )
);

-- Temporary product rule: only one company can be active platform-wide.
-- Remove this index only through an approved migration when multi-company
-- onboarding becomes available.
create unique index empresas_una_activa_uq
  on public.empresas (estado)
  where estado = 'activa';

create table public.usuarios (
  id uuid primary key references auth.users(id) on delete restrict,
  empresa_id uuid not null references public.empresas(id) on delete restrict,
  nombre_usuario varchar(50) not null,
  nombre_usuario_normalizado varchar(50) not null,
  estado varchar(16) not null,
  es_propietario boolean not null default false,
  creado_en timestamptz not null,
  actualizado_en timestamptz not null,
  desactivado_en timestamptz,
  desactivado_por_usuario_id uuid references public.usuarios(id) on delete restrict,
  constraint usuarios_nombre_usuario_no_vacio_chk
    check (char_length(btrim(nombre_usuario)) > 0),
  constraint usuarios_nombre_usuario_normalizado_chk
    check (
      nombre_usuario_normalizado = lower(btrim(nombre_usuario_normalizado))
      and char_length(nombre_usuario_normalizado) > 0
    ),
  constraint usuarios_estado_chk check (estado in ('activo', 'inactivo')),
  constraint usuarios_desactivacion_chk check (
    (estado = 'activo' and desactivado_en is null)
    or (estado = 'inactivo' and desactivado_en is not null)
  )
);

create unique index usuarios_nombre_usuario_normalizado_uq
  on public.usuarios (nombre_usuario_normalizado);

create unique index usuarios_un_propietario_por_empresa_uq
  on public.usuarios (empresa_id)
  where es_propietario;

create index usuarios_empresa_estado_idx
  on public.usuarios (empresa_id, estado);

create table public.recursos (
  id smallint primary key,
  codigo varchar(50) not null,
  nombre varchar(100) not null,
  activo boolean not null default true,
  constraint recursos_codigo_no_vacio_chk check (char_length(btrim(codigo)) > 0),
  constraint recursos_nombre_no_vacio_chk check (char_length(btrim(nombre)) > 0),
  constraint recursos_codigo_uq unique (codigo)
);

create table public.permisos (
  id smallint primary key,
  recurso_id smallint not null references public.recursos(id) on delete restrict,
  codigo_accion varchar(50) not null,
  nombre varchar(120) not null,
  activo boolean not null default true,
  constraint permisos_codigo_accion_no_vacio_chk
    check (char_length(btrim(codigo_accion)) > 0),
  constraint permisos_nombre_no_vacio_chk check (char_length(btrim(nombre)) > 0),
  constraint permisos_recurso_accion_uq unique (recurso_id, codigo_accion)
);

create index permisos_recurso_idx on public.permisos (recurso_id);

create table public.permisos_usuario (
  usuario_id uuid not null references public.usuarios(id) on delete restrict,
  permiso_id smallint not null references public.permisos(id) on delete restrict,
  asignado_en timestamptz not null,
  asignado_por_usuario_id uuid not null references public.usuarios(id) on delete restrict,
  primary key (usuario_id, permiso_id)
);

create index permisos_usuario_permiso_idx
  on public.permisos_usuario (permiso_id);

create table public.auditorias_acceso (
  id uuid primary key,
  empresa_id uuid not null references public.empresas(id) on delete restrict,
  actor_usuario_id uuid references public.usuarios(id) on delete restrict,
  actor_tipo varchar(24) not null,
  actor_referencia varchar(120),
  usuario_afectado_id uuid references public.usuarios(id) on delete restrict,
  codigo_evento varchar(80) not null,
  detalles_no_sensibles jsonb,
  creado_en timestamptz not null,
  constraint auditorias_acceso_actor_tipo_chk
    check (actor_tipo in ('usuario_interno', 'soporte')),
  constraint auditorias_acceso_actor_chk check (
    (actor_tipo = 'usuario_interno' and actor_usuario_id is not null)
    or (actor_tipo = 'soporte' and actor_usuario_id is null)
  ),
  constraint auditorias_acceso_evento_no_vacio_chk
    check (char_length(btrim(codigo_evento)) > 0)
);

create index auditorias_acceso_empresa_fecha_idx
  on public.auditorias_acceso (empresa_id, creado_en desc);

create index auditorias_acceso_usuario_afectado_fecha_idx
  on public.auditorias_acceso (usuario_afectado_id, creado_en desc);

create index auditorias_acceso_evento_fecha_idx
  on public.auditorias_acceso (codigo_evento, creado_en desc);

-- Fixed permission catalog. These rows are controlled by the application and
-- not created through the browser in the first version.
insert into public.recursos (id, codigo, nombre, activo) values
  (1, 'empresa', 'Empresa', true),
  (2, 'usuarios', 'Usuarios', true),
  (3, 'agenda', 'Agenda', true),
  (4, 'profesionales', 'Profesionales', true),
  (5, 'servicios', 'Servicios', true),
  (6, 'pacientes', 'Pacientes', true);

insert into public.permisos (id, recurso_id, codigo_accion, nombre, activo) values
  (1, 1, 'visualizar', 'Visualizar empresa', true),
  (2, 1, 'editar', 'Editar empresa', true),
  (3, 2, 'visualizar', 'Visualizar usuarios', true),
  (4, 2, 'crear', 'Crear usuarios', true),
  (5, 2, 'editar', 'Editar usuarios', true),
  (6, 2, 'eliminar', 'Eliminar usuarios', true),
  (7, 3, 'visualizar', 'Visualizar agenda', true),
  (8, 3, 'crear', 'Crear citas', true),
  (9, 3, 'editar', 'Editar citas', true),
  (10, 3, 'validar_comprobante', 'Validar comprobantes', true),
  (11, 4, 'visualizar', 'Visualizar profesionales', true),
  (12, 4, 'crear', 'Crear profesionales', true),
  (13, 4, 'editar', 'Editar profesionales', true),
  (14, 4, 'eliminar', 'Eliminar profesionales', true),
  (15, 5, 'visualizar', 'Visualizar servicios', true),
  (16, 5, 'crear', 'Crear servicios', true),
  (17, 5, 'editar', 'Editar servicios', true),
  (18, 5, 'eliminar', 'Eliminar servicios', true),
  (19, 6, 'visualizar', 'Visualizar pacientes', true),
  (20, 6, 'crear', 'Crear pacientes', true),
  (21, 6, 'editar', 'Editar pacientes', true),
  (22, 6, 'eliminar', 'Eliminar pacientes', true);

-- Defense in depth: every new application table has RLS enabled.
alter table public.empresas enable row level security;
alter table public.usuarios enable row level security;
alter table public.recursos enable row level security;
alter table public.permisos enable row level security;
alter table public.permisos_usuario enable row level security;
alter table public.auditorias_acceso enable row level security;

-- Do not expose write access from the browser. Company creation, user
-- management, permission changes, and auditing are server-side operations
-- that validate ownership and authorization before using administrative access.
revoke all on public.empresas from anon, authenticated;
revoke all on public.usuarios from anon, authenticated;
revoke all on public.recursos from anon, authenticated;
revoke all on public.permisos from anon, authenticated;
revoke all on public.permisos_usuario from anon, authenticated;
revoke all on public.auditorias_acceso from anon, authenticated;

-- Authenticated, active users can read the static catalog and only their own
-- active user and permission records. No policy grants browser writes.
grant select on public.recursos to authenticated;
grant select on public.permisos to authenticated;
grant select on public.usuarios to authenticated;
grant select on public.permisos_usuario to authenticated;

create policy recursos_lectura_usuario_activo
  on public.recursos
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.usuarios as usuario_actual
      where usuario_actual.id = (select auth.uid())
        and usuario_actual.estado = 'activo'
    )
  );

create policy permisos_lectura_usuario_activo
  on public.permisos
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.usuarios as usuario_actual
      where usuario_actual.id = (select auth.uid())
        and usuario_actual.estado = 'activo'
    )
  );

create policy usuarios_lectura_propia_activa
  on public.usuarios
  for select
  to authenticated
  using (
    id = (select auth.uid())
    and estado = 'activo'
  );

create policy permisos_usuario_lectura_propia_activa
  on public.permisos_usuario
  for select
  to authenticated
  using (
    usuario_id = (select auth.uid())
    and exists (
      select 1
      from public.usuarios as usuario_actual
      where usuario_actual.id = (select auth.uid())
        and usuario_actual.estado = 'activo'
    )
  );

commit;
