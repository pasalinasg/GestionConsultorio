# Especificación — Reserva pública por profesional

## Objetivo

Permitir que un paciente reserve desde un enlace directo de una profesional, sin iniciar sesión ni elegir profesional.

## Historias

### US1 — Compartir enlace (P1)

Administración copia desde la ficha de una profesional la URL `/reservar/{profesionalId}`.

### US2 — Reservar públicamente (P1)

La persona informa cédula, nombre, WhatsApp y sexo, elige un servicio y un horario de esa profesional. La reserva queda pendiente por 30 minutos.

## Reglas

- Solo se exponen profesional, servicios y franjas activas.
- El servidor valida que el servicio pertenece a la profesional, que el slot pertenece a una franja activa y que no existe solapamiento.
- No se expone información de otros pacientes ni se requiere migración.
