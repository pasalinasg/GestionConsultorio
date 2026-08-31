# Agenda y agendamiento

## Objetivo
Administrar turnos de la empresa y permitir que un paciente sea identificado por cédula, seleccionando profesional, servicio, modalidad y una franja realmente disponible.

## Historias de usuario

### US1 (P1) Consultar agenda
Usuario con `agenda.visualizar` consulta turnos por día, semana o mes y filtra por profesional, servicio y estado.

### US2 (P1) Crear reserva
Usuario interno o paciente público informa cédula, WhatsApp y sexo cuando corresponda. El sistema vincula al paciente existente o crea uno como prospecto, valida disponibilidad y reserva durante 30 minutos en estado pendiente.

### US3 (P1) Confirmar reserva
La empresa confirma o rechaza el turno desde la agenda después de verificar el pago por su canal externo (por ejemplo WhatsApp). No se almacenan comprobantes en el sistema.

### US4 (P1) Editar estado
Usuarios con `agenda.editar` cambian estados permitidos y gestionan turnos; eliminar físicamente no forma parte del flujo inicial.

## Reglas
- Toda cita pertenece a una empresa y se filtra por `empresa_id`.
- La disponibilidad se calcula usando franjas generales del profesional y franjas del servicio asignado.
- La modalidad es exclusiva: presencial u online.
- La duración proviene del servicio asignado.
- No se crean funciones, triggers o jobs automáticos sin aprobación explícita; el vencimiento se resolverá inicialmente al consultar/crear mediante servicio de aplicación.
- El mismo turno puede originarse en el flujo interno o desde un enlace público, identificado por `origen`.

## Flujo interno del modal
1. Solicitar cédula; buscar paciente y mostrar sus citas vigentes con opción de cancelar.
2. Si no existe, solicitar nombre, WhatsApp con código de país y sexo; crear como prospecto.
3. Seleccionar profesional activo.
4. Mostrar servicios asignados como tarjetas de precio con modalidad, duración y valor.
5. Mostrar calendario semanal con slots libres calculados desde las franjas configuradas.
6. Confirmar y mostrar que la reserva queda válida 30 minutos y recibirá confirmación por WhatsApp.
