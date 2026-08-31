# Detalle operativo del profesional

## Objetivo
Reemplazar el modal de detalle por una vista dedicada para consultar y administrar la configuración operativa de un profesional.

## Flujo
- La grilla de profesionales navega al seleccionar una fila.
- La vista dedicada muestra resumen, servicios asignados y franjas horarias.
- Crear y editar siguen usando modales pequeños; las grillas permanecen en la página.
- La disponibilidad general admite múltiples franjas por día.
- Cada servicio asignado mantiene sus propias franjas y precio.

## Acceso
La vista requiere `profesionales.visualizar`. Crear asignaciones requiere `profesionales.crear`; cambios de precio, estado y franjas requieren `profesionales.editar`; eliminar requiere `profesionales.eliminar`.
