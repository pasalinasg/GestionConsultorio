# Especificación — Reserva pública por profesional

## Objetivo

Permitir que un paciente reserve desde un enlace directo de una profesional, sin iniciar sesión ni elegir profesional.

## Historias

### US1 — Compartir enlace (P1)

Administración copia desde la ficha de una profesional la URL `/reservar/{profesionalId}`.

### US3 — Compartir servicio específico (P1)

Administración puede copiar desde cada servicio asignado la URL `/reservar/{profesionalId}/{asignacionId}`. Esta URL conserva a la profesional y preselecciona el servicio, por lo que la persona pasa desde la identificación directamente a elegir horario.

### US2 — Reservar públicamente (P1)

La persona informa cédula, nombre, WhatsApp y sexo, elige un servicio y un horario de esa profesional. La reserva queda pendiente por 30 minutos.

## Reglas

- Solo se exponen profesional, servicios y franjas activas.
- El enlace específico utiliza el identificador de la asignación profesional-servicio, no el catálogo global de servicios.
- La API pública de servicios devuelve `enlaceReserva` para cada servicio asignado.
- El servidor valida que el servicio pertenece a la profesional, que el slot pertenece a una franja activa y que no existe solapamiento.
- No se expone información de otros pacientes ni se requiere migración.
