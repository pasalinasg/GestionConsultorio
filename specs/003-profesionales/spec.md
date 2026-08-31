# Especificacion: Profesionales

## Objetivo

Permitir que cada empresa administre sus profesionales y posteriormente les
asigne servicios con precios y disponibilidad propios.

## Alcance inicial

- Listar profesionales de la empresa autenticada.
- Buscar y filtrar por estado.
- Crear profesionales mediante modal.
- Editar sus datos y estado.
- Inactivar profesionales sin eliminarlos fisicamente cuando tengan historial.
- Permisos `visualizar`, `crear`, `editar` y `eliminar`.

## Datos iniciales

- Nombre completo.
- Descripcion o especialidad opcional.
- Estado activo/inactivo.

## Fuera de alcance inmediato

Asignacion de servicios, precios, horarios, feriados, vacaciones y bloqueos;
se incorporaran en la siguiente iteracion del recurso.

## Disponibilidad futura

La disponibilidad del profesional se modelara como intervalos independientes.
Un mismo dia puede tener varias franjas, por ejemplo 08:00-11:00 y 13:00-16:00.
Las franjas de cada servicio asignado utilizaran el mismo modelo y nunca se
asumira que un dia tiene un unico bloque continuo.
