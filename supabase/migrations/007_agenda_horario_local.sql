begin;

-- Los turnos representan la hora civil de la clínica. Se conserva la fecha y
-- hora ingresadas sin conversión automática a UTC.
alter table public.agenda_turnos
  alter column inicio type timestamp without time zone
    using inicio at time zone 'America/Asuncion',
  alter column fin type timestamp without time zone
    using fin at time zone 'America/Asuncion';

comment on column public.agenda_turnos.inicio is 'Fecha y hora local de Paraguay';
comment on column public.agenda_turnos.fin is 'Fecha y hora local de Paraguay';

commit;
