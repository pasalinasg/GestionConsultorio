begin;

-- Vinculación opcional entre una profesional y su cuenta interna. Cada cuenta
-- solo puede representar a una profesional dentro de la plataforma.
alter table public.profesionales
  add column usuario_id uuid references public.usuarios(id) on delete restrict;

create unique index profesionales_usuario_uq
  on public.profesionales (usuario_id)
  where usuario_id is not null;

create index profesionales_empresa_usuario_idx
  on public.profesionales (empresa_id, usuario_id)
  where usuario_id is not null;

-- Recurso independiente de la agenda general. La aplicación verifica además
-- que el usuario vinculado solo lea y actualice turnos de su profesional.
insert into public.recursos (id, codigo, nombre, activo) values
  (7, 'mi_agenda', 'Mi agenda', true);

insert into public.permisos (id, recurso_id, codigo_accion, nombre, activo) values
  (23, 7, 'visualizar', 'Visualizar mi agenda', true),
  (24, 7, 'editar', 'Editar estado de mis turnos', true);

commit;
