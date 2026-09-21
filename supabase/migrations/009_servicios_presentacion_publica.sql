begin;

alter table public.servicios
  add column presentacion varchar(16) not null default 'normal',
  add column orden_publico integer not null default 0,
  add constraint servicios_presentacion_chk
    check (presentacion in ('normal', 'destacado', 'promocion')),
  add constraint servicios_orden_publico_chk
    check (orden_publico >= 0);

create index servicios_empresa_estado_orden_publico_idx
  on public.servicios (empresa_id, estado, orden_publico);

commit;
