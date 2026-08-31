# Profesionales: servicios y disponibilidad

La migración `004_profesionales_servicios_disponibilidad.sql` agrega tres entidades aisladas por empresa:

- `profesionales_servicios`: relación profesional-servicio con precio propio y estado.
- `profesionales_disponibilidad`: franjas semanales del profesional; admite varias franjas por día.
- `profesionales_servicios_franjas`: franjas independientes de cada relación profesional-servicio.

Las franjas usan días ISO (1 lunes a 7 domingo), horario de 24 horas y una restricción `hora_inicio < hora_fin`. Las operaciones se validan en el servicio de aplicación y exigen los permisos existentes del recurso `profesionales`: visualizar para consultar, crear para asignar un servicio, editar para modificar precios/estados/franjas e eliminar para quitar una asignación. No se agregan funciones, triggers ni permisos nuevos.

La migración no se aplica automáticamente ni modifica las tablas anteriores. Para habilitar esta funcionalidad, revisar y ejecutar manualmente el archivo en el proyecto Supabase correspondiente.
