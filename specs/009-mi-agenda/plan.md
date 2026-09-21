# Plan — Mi agenda

La relación será opcional y 1:1 mediante `profesionales.usuario_id`. Se agrega el recurso independiente `mi_agenda` con permisos de visualizar y editar. Las consultas y actualizaciones se filtran en el servicio de agenda usando el usuario autenticado; la interfaz no es frontera de seguridad.

La migración `008_profesionales_mi_agenda.sql` no se aplica automáticamente.
