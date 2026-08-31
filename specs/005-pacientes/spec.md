# Recurso Pacientes

## Objetivo
Permitir que usuarios autorizados consulten y administren pacientes de su empresa sin exponer datos de otra empresa. La ficha clínica queda fuera de este alcance.

## Historias de usuario

### US1 (P1) Listar y filtrar pacientes
Como usuario con permiso `pacientes.visualizar`, quiero ver una grilla de pacientes con búsqueda por nombre/documento y filtro por estado.

### US2 (P1) Crear paciente mínimo
Como usuario con permiso `pacientes.crear`, quiero registrar nombre, cédula, WhatsApp y sexo. El sistema asigna estado `prospecto` automáticamente; si la cédula ya existe y está inactiva, la reactiva.

### US3 (P1) Editar estado y datos
Como usuario con permiso `pacientes.editar`, quiero editar datos básicos y activar/inactivar pacientes. Los errores mantienen abierto el modal y los éxitos lo cierran mostrando un banner.

### US4 (P2) Eliminar paciente
Como usuario con permiso `pacientes.eliminar`, quiero eliminar un paciente cuando no existan dependencias que lo impidan.

## Reglas
- Todas las consultas se filtran por `empresa_id`.
- La cédula (`documento`) es única por empresa.
- Estados válidos: `prospecto`, `activo`, `inactivo`.
- Todas las acciones validan autorización en servidor.
- No se consulta ni modifica `paciente_ficha` en esta entrega.
