begin;

create table public.servicios (
  id uuid primary key,
  empresa_id uuid not null references public.empresas(id) on delete restrict,
  nombre varchar(120) not null,
  descripcion text,
  modalidad varchar(16) not null,
  duracion_minutos integer not null,
  estado varchar(16) not null default 'activo',
  creado_en timestamptz not null,
  actualizado_en timestamptz not null,
  constraint servicios_nombre_chk check (char_length(btrim(nombre)) between 2 and 120),
  constraint servicios_modalidad_chk check (modalidad in ('presencial', 'online')),
  constraint servicios_duracion_chk check (duracion_minutos between 5 and 480),
  constraint servicios_estado_chk check (estado in ('activo', 'inactivo'))
);

create unique index servicios_empresa_nombre_modalidad_uq
  on public.servicios (empresa_id, lower(btrim(nombre)), modalidad);
create index servicios_empresa_estado_idx on public.servicios (empresa_id, estado);
create index servicios_empresa_modalidad_idx on public.servicios (empresa_id, modalidad);

alter table public.servicios enable row level security;
revoke all on public.servicios from anon, authenticated;

create policy servicios_lectura_empresa
  on public.servicios for select to authenticated
  using (exists (
    select 1 from public.usuarios u
    where u.id = (select auth.uid()) and u.empresa_id = servicios.empresa_id
      and u.estado = 'activo'
  ));

commit;
