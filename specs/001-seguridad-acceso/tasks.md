# Tareas: seguridad de datos y acceso

**Entrada:** Documentos de `specs/001-seguridad-acceso/`  
**Prerequisitos:** `spec.md`, `plan.md`, `research.md`, `data-model.md`, `esquema-propuesto.md`, `contracts/autorizacion.md`, `quickstart.md`  
**Regla de control:** ninguna tarea aplica migraciones, RLS o cambios a Supabase remoto. Cada migración se entrega para aprobación explícita.

## Fase 1: Preparación

**Propósito:** crear la estructura de aplicación y documentación necesaria sin tocar datos remotos.

- [x] T001 Crear el proyecto web Next.js con TypeScript y estructura base en `src/app/`, `src/features/`, `src/lib/` y `tests/`.
- [x] T002 [P] Crear `.env.example` con nombres de variables de Supabase sin valores ni secretos.
- [x] T003 [P] Crear `supabase/migrations/` y `supabase/tests/` con un `README.md` que prohíba aplicar SQL remoto sin aprobación del propietario.
- [x] T004 [P] Registrar las tablas heredadas sin modificación en `docs/inventario-supabase-existente.md` y enlazarlo desde `docs/PRD.md`.

---

## Fase 2: Fundaciones de seguridad

**Propósito:** preparar el esquema, la autenticación y la autorización que bloquean todas las historias posteriores.

**CRÍTICO:** no iniciar historias de usuario hasta revisar y aprobar la migración propuesta.

- [x] T005 Crear `supabase/migrations/001_seguridad_acceso.sql` con las seis tablas aprobadas: `empresas`, `usuarios`, `recursos`, `permisos`, `permisos_usuario` y `auditorias_acceso`; incluir campos, claves foráneas, restricciones, índices y datos iniciales explícitos de recursos/permisos.
- [x] T006 Crear `supabase/tests/001_seguridad_acceso_rls.sql` con validaciones de estructura, RLS, grants permitidos y grants denegados para `anon` y `authenticated`.
- [x] T007 Documentar en `docs/revision-migracion-001.md` el propósito, impacto, SQL propuesto, verificación, reversión manual y confirmación explícita de que no hay funciones, triggers, RPCs ni jobs.
- [x] T008 Implementar clientes Supabase de navegador y servidor en `src/lib/supabase/client.ts` y `src/lib/supabase/server.ts`, manteniendo credenciales administrativas fuera del cliente.
- [x] T009 Implementar en `src/features/autenticacion/servicio-autorizacion.ts` la resolución de sesión, usuario interno activo, empresa y permiso requerido.
- [x] T010 Implementar respuestas de autorización seguras y genéricas en `src/lib/errores-autorizacion.ts` sin revelar usuarios, empresas o permisos existentes.
- [x] T011 Crear pruebas unitarias de `servicio-autorizacion` en `tests/unit/servicio-autorizacion.test.ts` para sesión ausente, usuario inexistente, cuenta inactiva, propietario y permiso explícito.

**Punto de control:** migración revisada y aprobada por el propietario; la fundación de autorización está lista para usar en cada módulo.

---

## Fase 3: Historia de usuario 1 — Crear la empresa propietaria (P1) 🎯 MVP

**Objetivo:** una persona crea la única empresa activa y obtiene acceso total como propietaria.

**Prueba independiente:** un visitante crea la primera empresa con nombre, usuario y contraseña; inicia sesión como propietario. Un segundo intento de alta se rechaza sin identidades ni filas parciales.

- [x] T012 [P] [US1] Crear validaciones de alta de empresa y nombre de usuario en `src/features/empresas/validacion-alta-empresa.ts`.
- [x] T013 [P] [US1] Crear pruebas unitarias de normalización y unicidad visible del usuario en `tests/unit/validacion-alta-empresa.test.ts`.
- [x] T014 [US1] Implementar en `src/features/empresas/servicio-alta-empresa.ts` la creación compensada de identidad técnica, empresa, usuario propietario y permisos completos.
- [x] T015 [US1] Implementar la acción de servidor de alta en `src/features/empresas/acciones-empresa.ts`, con mensajes genéricos y sin exponer identificadores técnicos.
- [x] T016 [US1] Crear la pantalla pública de alta en `src/app/crear-empresa/page.tsx` y su formulario en `src/features/empresas/formulario-alta-empresa.tsx`.
- [x] T017 [US1] Crear prueba de integración del alta única y compensada en `tests/integration/alta-empresa.test.ts`.
- [ ] T018 [US1] Validar el escenario “Crear empresa” de `specs/001-seguridad-acceso/quickstart.md` en un proyecto Supabase local; no usar el proyecto remoto.

**Punto de control:** la primera empresa puede crearse de forma segura y una segunda alta queda bloqueada.

---

## Fase 4: Historia de usuario 2 — Gestionar usuarios y permisos (P1)

**Objetivo:** el propietario crea usuarios de su empresa y asigna acciones por recurso.

**Prueba independiente:** el propietario crea un usuario con solo `agenda.visualizar`; ese usuario puede consultar la agenda de su empresa cuando el módulo exista, pero no crear, editar ni validar comprobantes.

- [x] T019 [P] [US2] Crear validaciones de usuario interno y asignación de permisos en `src/features/usuarios/validacion-usuarios.ts`.
- [x] T020 [P] [US2] Crear contrato de datos de usuario seguro en `src/features/usuarios/tipos-usuarios.ts` sin contraseña ni identidad técnica.
- [x] T021 [US2] Implementar en `src/features/usuarios/servicio-usuarios.ts` la creación de identidad técnica y usuario interno bajo autorización exclusiva del propietario.
- [x] T022 [US2] Implementar en `src/features/permisos/servicio-permisos.ts` el reemplazo validado de permisos de usuarios de la misma empresa.
- [x] T023 [US2] Implementar acciones de servidor para usuarios y permisos en `src/features/usuarios/acciones-usuarios.ts` y `src/features/permisos/acciones-permisos.ts`.
- [x] T024 [US2] Crear pantalla de usuarios y permisos en `src/app/(protegido)/usuarios/page.tsx` y `src/features/usuarios/lista-usuarios.tsx`.
- [x] T025 [US2] Crear pruebas de integración de propietario, empresa ajena y permiso `agenda.visualizar` en `tests/integration/usuarios-permisos.test.ts`.

**Punto de control:** el propietario administra únicamente usuarios de su empresa y los permisos se aplican por acción.

---

## Fase 5: Historia de usuario 3 — Desactivar y restablecer acceso (P2)

**Objetivo:** el propietario corta el acceso de un usuario sin borrar su historial y le asigna una contraseña nueva cuando corresponda.

**Prueba independiente:** un usuario con sesión activa es desactivado; su siguiente operación se deniega. Tras reactivarse y recibir una contraseña nueva del propietario, solo puede acceder con la contraseña nueva.

- [x] T026 [P] [US3] Crear transiciones de estado y validaciones de usuario en `src/features/usuarios/estado-usuario.ts`.
- [x] T027 [US3] Implementar desactivación, reactivación, revocación de sesión y auditoría en `src/features/usuarios/servicio-estado-usuario.ts`.
- [x] T028 [US3] Implementar restablecimiento de contraseña exclusivo del propietario en `src/features/usuarios/servicio-contrasenas.ts` sin flujo de cambio para usuarios internos.
- [x] T029 [US3] Implementar acciones de servidor de estado y contraseña en `src/features/usuarios/acciones-estado-usuario.ts`.
- [x] T030 [US3] Incorporar controles de activación, desactivación y restablecimiento en `src/features/usuarios/lista-usuarios.tsx`.
- [x] T031 [US3] Crear pruebas de integración de sesión activa, desactivación, reactivación y contraseña nueva en `tests/integration/estado-usuario.test.ts`.
- [x] T032 [US3] Documentar el procedimiento externo de recuperación del propietario en `docs/procedimiento-recuperacion-propietario.md` sin incluir secretos ni rutas de acceso ocultas.

**Punto de control:** los accesos se retiran de forma trazable y los usuarios no pueden cambiar su propia contraseña.

---

## Fase 6: Seguridad transversal y validación

**Propósito:** verificar defensa en profundidad, trazabilidad y calidad antes de considerar terminada la funcionalidad.

- [ ] T033 [P] Revisar grants, políticas RLS y pruebas de denegación en `supabase/migrations/001_seguridad_acceso.sql` y `supabase/tests/001_seguridad_acceso_rls.sql` antes de cualquier aplicación remota.
- [x] T034 [P] Configurar controles de contraseña y duración corta de sesión en `docs/configuracion-supabase-auth.md`, dejando la modificación del dashboard para aprobación manual del propietario.
- [x] T035 [P] Revisar que ningún DTO, registro o error exponga claves, contraseñas, hashes, tokens o identidades técnicas en `src/` y `tests/`.
- [ ] T036 Ejecutar todas las validaciones de `specs/001-seguridad-acceso/quickstart.md` y registrar resultados en `specs/001-seguridad-acceso/validacion.md`.
- [ ] T037 Crear escenarios con usuarios de prueba para empresa ajena, cuenta inactiva y permiso ausente en `supabase/tests/002_acceso_datos_rls.sql` antes de exponer datos operativos al navegador.

## Dependencias y orden de ejecución

- Fase 1 → Fase 2 → Historia 1.
- La Historia 2 depende de la Historia 1, porque necesita empresa propietaria activa.
- La Historia 3 depende de la Historia 2, porque opera sobre usuarios internos creados.
- La Fase 6 depende de las historias implementadas.
- T005, T006 y T007 forman la puerta obligatoria de revisión de migración; no se aplica SQL remoto hasta una aprobación explícita.

## Oportunidades de trabajo en paralelo

- En Fase 1: T002, T003 y T004.
- En Fase 2: T006 y T008 pueden avanzar mientras se revisa T005; T011 puede comenzar con contratos simulados de T009.
- En US1: T012 y T013.
- En US2: T019 y T020.
- En US3: T026 y T032.
- En Fase 6: T033, T034 y T035.

## Estrategia de implementación

1. Preparar proyecto y artefactos de migración, pero detenerse para revisión del propietario.
2. Implementar el alta única de empresa como MVP.
3. Añadir gestión de usuarios y permisos.
4. Añadir desactivación, restablecimiento y auditoría.
5. Ejecutar pruebas locales y revisión final antes de conectar o aplicar cualquier cambio remoto.
