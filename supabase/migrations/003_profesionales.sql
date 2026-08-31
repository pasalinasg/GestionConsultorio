begin;

create table public.profesionales (
  id uuid primary key,
  empresa_id uuid not null references public.empresas(id) on delete restrict,
  nombre_completo varchar(160) not null,
  descripcion text,
  estado varchar(16) not null default 'activo',
  creado_en timestamptz not null,
  actualizado_en timestamptz not null,
  constraint profesionales_nombre_chk check (char_length(btrim(nombre_completo)) between 2 and 160),
  constraint profesionales_estado_chk check (estado in ('activo', 'inactivo'))
);

create unique index profesionales_empresa_nombre_uq
  on public.profesionales (empresa_id, lower(btrim(nombre_completo)));
create index profesionales_empresa_estado_idx
  on public.profesionales (empresa_id, estado);

alter table public.profesionales enable row level security;
revoke all on public.profesionales from anon, authenticated;

create policy profesionales_lectura_empresa
  on public.profesionales for select to authenticated
  using (exists (
    select 1 from public.usuarios u
    where u.id = (select auth.uid()) and u.empresa_id = profesionales.empresa_id
      and u.estado = 'activo'
  ));

commit;
