-- Separa los datos básicos de la ficha complementaria sin eliminar información existente.
-- Requiere que exista exactamente una empresa durante la primera ejecución.
begin;

alter table public."Paciente" rename to paciente;

alter table public.paciente
  add column empresa_id uuid;

update public.paciente p
set empresa_id = (select e.id from public.empresas e order by e.creado_en limit 1)
where p.empresa_id is null;

do $$
begin
  if (select count(*) from public.empresas) <> 1 then
    raise exception 'La migracion requiere exactamente una empresa para vincular pacientes existentes';
  end if;
end $$;

alter table public.paciente
  alter column empresa_id set not null;

create index paciente_empresa_idx on public.paciente (empresa_id);
create unique index paciente_empresa_documento_uq
  on public.paciente (empresa_id, btrim(documento))
  where documento is not null and btrim(documento) <> '';

create table public.paciente_ficha (
  paciente_id bigint primary key references public.paciente(paciente_id) on delete cascade,
  fecha_nacimiento date,
  estado_civil text,
  hijos bigint,
  ocupacion text,
  estudio text,
  diagnostico_salud text,
  alergia_intolerancia text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint paciente_ficha_hijos_chk check (hijos is null or hijos >= 0)
);

insert into public.paciente_ficha (
  paciente_id, fecha_nacimiento, estado_civil, hijos, ocupacion, estudio,
  diagnostico_salud, alergia_intolerancia, created_at, updated_at
)
select paciente_id, fecha_nacimiento, estado_civil, hijos, ocupacion, estudio,
       diagnostico_salud, alergia_intolerancia, created_at, now()
from public.paciente;

alter table public.paciente enable row level security;
alter table public.paciente_ficha enable row level security;
revoke all on public.paciente, public.paciente_ficha from anon, authenticated;

create policy paciente_lectura_empresa on public.paciente
  for select to authenticated
  using (exists (select 1 from public.usuarios u where u.id = (select auth.uid()) and u.empresa_id = paciente.empresa_id and u.estado = 'activo'));

create policy paciente_ficha_lectura_empresa on public.paciente_ficha
  for select to authenticated
  using (exists (select 1 from public.usuarios u join public.paciente p on p.empresa_id = u.empresa_id where u.id = (select auth.uid()) and u.estado = 'activo' and p.paciente_id = paciente_ficha.paciente_id));

commit;
