# Tasks: Navegacion lateral por permisos

**Input**: Design documents from `/specs/007-navegacion-lateral/`

## Phase 1: Setup

- [ ] T001 Revisar las rutas protegidas y los codigos de permisos existentes en `src/features/autenticacion/servicio-autorizacion.ts` y `src/app/(protegido)/`.

## Phase 2: Foundational

- [ ] T002 Definir una configuracion tipada de entradas de navegacion, grupos e iconos reutilizables en `src/features/navegacion/aplicacion-shell.tsx`.

## Phase 3: User Story 1 - Navegar los recursos autorizados (Priority: P1)

**Goal**: Mostrar todos los destinos existentes como enlaces funcionales y con iconos apropiados.

**Independent Test**: Como propietario, navegar a Inicio, Agenda, Pacientes, Profesionales, Servicios y Usuarios y permisos; validar opcion activa.

- [ ] T003 [US1] Renderizar los grupos Panorama, Gestion y Organizacion desde la configuracion en `src/features/navegacion/aplicacion-shell.tsx`.
- [ ] T004 [US1] Sustituir los simbolos de texto y opciones deshabilitadas por iconos SVG y enlaces consistentes en `src/features/navegacion/aplicacion-shell.tsx`.
- [ ] T005 [US1] Actualizar la barra movil para consumir la misma configuracion en `src/features/navegacion/aplicacion-shell.tsx`.
- [ ] T006 [US1] Enviar `seccionActiva="agenda"` desde `src/app/(protegido)/agenda/page.tsx`.

## Phase 4: User Story 2 - Ocultar recursos no autorizados (Priority: P1)

**Goal**: No mostrar accesos sin permiso de visualizar en ninguna variante del menu.

**Independent Test**: Con un usuario de solo `pacientes.visualizar`, confirmar que el menu deja visibles exclusivamente Inicio y Pacientes.

- [ ] T007 [US2] Filtrar entradas con recurso mediante `tienePermiso(..., "visualizar")` antes de renderizar el menu en `src/features/navegacion/aplicacion-shell.tsx`.
- [ ] T008 [US2] Omitir encabezados de grupo vacios en `src/features/navegacion/aplicacion-shell.tsx`.

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T009 Validar tipado mediante `npm run typecheck`.
- [ ] T010 Validar los escenarios de `specs/007-navegacion-lateral/quickstart.md`.

## Dependencies & Execution Order

T001 → T002 → T003/T004/T005/T006 → T007/T008 → T009/T010.

## Implementation Strategy

La configuracion unica y el filtrado en servidor son el MVP; las dos presentaciones se alimentan de la misma lista y conservan las validaciones individuales de cada ruta.
