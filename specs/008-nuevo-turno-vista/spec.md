# Nuevo turno como vista de Agenda

## US1 (P1) Crear turno sin modal

El usuario abre `Agenda > Nuevo turno` y completa los cinco pasos en una vista amplia dentro del shell. Puede volver a Agenda y, tras guardar, vuelve al listado actualizado.

**Acceptance**: `/agenda/nuevo` requiere `agenda.crear`; muestra volver a Agenda; no usa overlay ni modal; el exito vuelve a `/agenda`.

## Requirements

- Reutilizar reglas de paciente, disponibilidad y creacion existentes.
- Mantener `/agenda` como listado con enlace a la nueva ruta.
- No modificar base de datos ni permisos existentes.
