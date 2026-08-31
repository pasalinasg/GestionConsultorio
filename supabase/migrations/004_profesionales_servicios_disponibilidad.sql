begin;

create table public.profesionales_servicios (
  id uuid primary key,
  empresa_id uuid not null references public.empresas(id) on delete restrict,
  profesional_id uuid not null references public.profesionales(id) on delete restrict,
  servicio_id uuid not null references public.servicios(id) on delete restrict,
  precio numeric(14,2) not null,
  estado varchar(16) not null default 'activo',
  creado_en timestamptz not null,
  actualizado_en timestamptz not null,
  constraint profesionales_servicios_precio_chk check (precio >= 0),
  constraint profesionales_servicios_estado_chk check (estado in ('activo','inactivo'))
);
create unique index profesionales_servicios_unico_uq on public.profesionales_servicios(profesional_id, servicio_id);
create index profesionales_servicios_empresa_idx on public.profesionales_servicios(empresa_id, estado);

create table public.profesionales_disponibilidad (
  id uuid primary key,
  empresa_id uuid not null references public.empresas(id) on delete restrict,
  profesional_id uuid not null references public.profesionales(id) on delete restrict,
  dia_semana smallint not null,
  hora_inicio time not null,
  hora_fin time not null,
  estado varchar(16) not null default 'activo',
  creado_en timestamptz not null,
  actualizado_en timestamptz not null,
  constraint profesionales_disponibilidad_dia_chk check (dia_semana between 1 and 7),
  constraint profesionales_disponibilidad_hora_chk check (hora_inicio < hora_fin),
  constraint profesionales_disponibilidad_estado_chk check (estado in ('activo','inactivo'))
);
create index profesionales_disponibilidad_busqueda_idx on public.profesionales_disponibilidad(profesional_id,dia_semana,estado);

create table public.profesionales_servicios_franjas (
  id uuid primary key,
  empresa_id uuid not null references public.empresas(id) on delete restrict,
  profesional_servicio_id uuid not null references public.profesionales_servicios(id) on delete restrict,
  dia_semana smallint not null,
  hora_inicio time not null,
  hora_fin time not null,
  estado varchar(16) not null default 'activo',
  creado_en timestamptz not null,
  actualizado_en timestamptz not null,
  constraint profesionales_servicios_franjas_dia_chk check (dia_semana between 1 and 7),
  constraint profesionales_servicios_franjas_hora_chk check (hora_inicio < hora_fin),
  constraint profesionales_servicios_franjas_estado_chk check (estado in ('activo','inactivo'))
);
create index profesionales_servicios_franjas_busqueda_idx on public.profesionales_servicios_franjas(profesional_servicio_id,dia_semana,estado);

alter table public.profesionales_servicios enable row level security;
alter table public.profesionales_disponibilidad enable row level security;
alter table public.profesionales_servicios_franjas enable row level security;
revoke all on public.profesionales_servicios, public.profesionales_disponibilidad, public.profesionales_servicios_franjas from anon, authenticated;

create policy profesionales_servicios_lectura_empresa on public.profesionales_servicios for select to authenticated using (exists (select 1 from public.usuarios u where u.id=(select auth.uid()) and u.empresa_id=profesionales_servicios.empresa_id and u.estado='activo'));
create policy profesionales_disponibilidad_lectura_empresa on public.profesionales_disponibilidad for select to authenticated using (exists (select 1 from public.usuarios u where u.id=(select auth.uid()) and u.empresa_id=profesionales_disponibilidad.empresa_id and u.estado='activo'));
create policy profesionales_servicios_franjas_lectura_empresa on public.profesionales_servicios_franjas for select to authenticated using (exists (select 1 from public.usuarios u where u.id=(select auth.uid()) and u.empresa_id=profesionales_servicios_franjas.empresa_id and u.estado='activo'));

commit;
