begin;

-- Turnos de agenda. El comprobante de pago se verifica fuera del sistema;
-- por eso no existe una tabla de archivos/comprobantes en esta migración.
create table public.agenda_turnos (
  id uuid primary key,
  empresa_id uuid not null references public.empresas(id) on delete restrict,
  paciente_id bigint not null references public.paciente(paciente_id) on delete restrict,
  profesional_id uuid not null references public.profesionales(id) on delete restrict,
  profesional_servicio_id uuid not null references public.profesionales_servicios(id) on delete restrict,
  inicio timestamptz not null,
  fin timestamptz not null,
  modalidad varchar(16) not null,
  estado varchar(20) not null default 'pendiente',
  origen varchar(12) not null default 'interno',
  precio_gs numeric(14,0) not null,
  creado_por uuid references public.usuarios(id) on delete restrict,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint agenda_turnos_horario_chk check (inicio < fin),
  constraint agenda_turnos_modalidad_chk check (modalidad in ('presencial','online')),
  constraint agenda_turnos_estado_chk check (estado in ('pendiente','confirmada','rechazada','vencida','cancelada','atendida','no_asistio')),
  constraint agenda_turnos_origen_chk check (origen in ('interno','publico')),
  constraint agenda_turnos_precio_chk check (precio_gs >= 0)
);

create index agenda_turnos_empresa_inicio_idx on public.agenda_turnos (empresa_id, inicio);
create index agenda_turnos_profesional_inicio_idx on public.agenda_turnos (profesional_id, inicio);
create index agenda_turnos_paciente_idx on public.agenda_turnos (paciente_id, inicio desc);
create index agenda_turnos_estado_idx on public.agenda_turnos (empresa_id, estado, inicio);

alter table public.agenda_turnos enable row level security;
revoke all on public.agenda_turnos from anon, authenticated;

create policy agenda_turnos_lectura_empresa
  on public.agenda_turnos for select to authenticated
  using (exists (
    select 1 from public.usuarios u
    where u.id = (select auth.uid())
      and u.empresa_id = agenda_turnos.empresa_id
      and u.estado = 'activo'
  ));

commit;
