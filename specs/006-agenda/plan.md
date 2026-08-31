# Plan de implementación — Agenda

## Alcance de esta fase
Diseñar el modelo y contratos de agenda. La migración será entregada como SQL versionado para aprobación; no se aplicará remotamente.

## Entidades propuestas
- `agenda_turnos`: turno, empresa, paciente, profesional, asignación de servicio, inicio/fin, modalidad, estado, origen y timestamps.

## Estados
`pendiente`, `confirmada`, `rechazada`, `vencida`, `cancelada`, `atendida`, `no_asistio`.

## Seguridad
RLS explícita por empresa. La autorización de aplicación usa `agenda.visualizar`, `agenda.crear`, `agenda.editar` y `agenda.validar_comprobante`. El acceso público no reutiliza permisos internos y tendrá contrato separado.

## Flujos
1. **Interno:** usuario autorizado abre Agenda, busca paciente por cédula, elige profesional/servicio/slot y crea o edita el turno.
2. **Público:** enlace de la empresa muestra únicamente servicios/profesionales/slots activos; la persona informa cédula, WhatsApp y sexo mínimo. Se crea o vincula paciente y el turno queda pendiente.
3. **Confirmación:** personal interno cambia el estado luego de verificar el pago fuera del sistema.

## Decisión pendiente
Aprobar nombres/campos de la migración y si el importe/precio debe ser una copia histórica del precio asignado al servicio.
