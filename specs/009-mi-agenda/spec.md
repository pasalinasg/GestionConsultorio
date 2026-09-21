# Especificación — Mi agenda

## Objetivo

Separar la agenda general de la agenda personal de cada profesional vinculada a una cuenta interna.

## Historias

### US1 — Vincular profesional y usuario (P1)

Un administrador puede asociar opcionalmente un usuario activo de su empresa a una profesional. Un usuario no puede pertenecer a más de una profesional.

### US2 — Consultar mi agenda (P1)

Una profesional con el permiso `mi_agenda.visualizar` solo consulta los turnos cuyo `profesional_id` coincide con su vínculo. No puede crear reservas desde esta vista.

### US3 — Actualizar mis estados (P1)

Una profesional con `mi_agenda.editar` puede actualizar únicamente el estado de sus propios turnos.

## Fuera de alcance

Reserva pública, notificaciones de WhatsApp, cambios de agenda general y comprobantes.
