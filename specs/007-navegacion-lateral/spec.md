# Navegacion lateral por permisos

**Feature Branch**: `007-navegacion-lateral`  
**Created**: 2026-08-31  
**Status**: Approved

## User Scenarios & Testing

### User Story 1 - Navegar los recursos autorizados (Priority: P1)

Un usuario ve en el menu lateral los recursos que puede visualizar y accede a ellos desde enlaces funcionales e identificables por su icono.

**Independent Test**: Iniciar sesion como propietario y verificar Dashboard, Agenda, Pacientes, Profesionales, Servicios y Usuarios y permisos; cada enlace abre su ruta y deja la opcion activa resaltada.

**Acceptance Scenarios**:

1. **Given** un propietario autenticado, **When** abre cualquier pantalla protegida, **Then** ve todos los recursos implementados agrupados por seccion.
2. **Given** una ruta activa, **When** se muestra el menu, **Then** su opcion queda resaltada.

### User Story 2 - Ocultar recursos no autorizados (Priority: P1)

Un usuario interno solo ve las opciones para las que tiene permiso de visualizar, sin que el menu revele recursos no habilitados.

**Independent Test**: Iniciar sesion con permiso `pacientes.visualizar` exclusivamente y comprobar que Pacientes se muestra, mientras los recursos sin ese permiso no aparecen.

**Acceptance Scenarios**:

1. **Given** un usuario sin `servicios.visualizar`, **When** carga el menu, **Then** Servicios no se renderiza.
2. **Given** un usuario con `agenda.visualizar`, **When** carga el menu, **Then** Agenda se renderiza como enlace navegable.

### Edge Cases

- Si no hay permisos de una seccion, su titulo no se muestra.
- La navegacion movil aplica la misma visibilidad por permisos y conserva el acceso a Inicio.
- El propietario conserva visibilidad completa aunque no tenga filas individuales de permisos.

## Requirements

### Functional Requirements

- **FR-001**: El menu debe incluir Inicio, Agenda, Pacientes, Profesionales, Servicios y Usuarios y permisos, sin opciones ficticias o deshabilitadas.
- **FR-002**: Cada recurso debe tener un icono semantico y consistente en escritorio y movil.
- **FR-003**: Cada recurso requiere `visualizar` para ser visible, salvo Inicio, accesible a toda sesion valida.
- **FR-004**: El menu debe centralizar ruta, recurso, etiqueta, grupo e icono para no duplicar reglas entre variantes de pantalla.
- **FR-005**: La opcion activa debe reflejar la seccion recibida por el shell.
- **FR-006**: No se modifican permisos, rutas, tablas ni politicas RLS.

## Success Criteria

- **SC-001**: Un propietario llega a cualquiera de los seis recursos desde el menu en un clic.
- **SC-002**: Un usuario interno no visualiza ningun recurso sin permiso `visualizar`.
- **SC-003**: El menu mantiene la misma lista autorizada en escritorio y movil.

## Assumptions

- Los recursos existentes usan los codigos `agenda`, `pacientes`, `profesionales`, `servicios` y `usuarios`.
- La pagina Inicio es el destino seguro para usuarios autenticados sin permisos funcionales.
