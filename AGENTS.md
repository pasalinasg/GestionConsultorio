# Gestion de consultorio — instrucciones del proyecto

## Flujo de trabajo

- Antes de implementar una funcionalidad relevante, crea y valida una especificación con el flujo Spec Kit disponible en `.agents/skills/`.
- Revisa las convenciones y los módulos existentes antes de introducir una solución nueva.
- Mantén la lógica del dominio separada de la interfaz y de la persistencia.
- Usa nombres de dominio claros y consistentes en español, sin tildes en identificadores técnicos.

## Supabase: control explícito

La base de datos es una frontera controlada. No se permite hacer cambios implícitos ni automáticos.

- Antes de cualquier cambio de esquema, presentar: entidades afectadas, campos, relaciones, reglas de integridad, datos sensibles, consulta prevista e impacto sobre datos existentes.
- Toda tabla, columna, índice, relación, restricción, política RLS, vista, función, trigger y dato inicial debe declararse en una migración SQL versionada y legible dentro de `supabase/migrations/`.
- Una migración debe tener un propósito único, un nombre descriptivo y ser revisable de forma aislada. No agrupar cambios no relacionados.
- No crear ni modificar tablas, políticas, funciones, triggers, RPC, vistas materializadas, jobs o datos remotos de Supabase sin aprobación explícita del usuario para esa migración concreta.
- Priorizar tablas normalizadas, claves foráneas, `NOT NULL`, `CHECK`, `UNIQUE` e índices justificados. No esconder reglas de negocio en funciones o triggers.
- Si una función, trigger o RPC fuese realmente necesaria, explicar primero por qué no basta una consulta o servicio de aplicación; requerirá aprobación explícita y pruebas.
- Nunca aplicar migraciones a un proyecto remoto como parte de la implementación. Entregar el SQL, sus pruebas y los pasos exactos para que el usuario decida cuándo aplicarlo.
- Las migraciones deben preservar los datos existentes y describir una reversión manual viable cuando corresponda.
- Todas las tablas con datos de pacientes, profesionales, agenda o administración deben definir explícitamente propiedad, acceso y políticas RLS antes de ser utilizadas.

## Seguridad y calidad

- Validar todas las entradas en el servidor y minimizar datos sensibles en logs y errores.
- No exponer credenciales, claves de servicio ni información clínica en el cliente.
- Añadir pruebas para reglas de negocio, permisos y cambios de datos que puedan afectar historiales o turnos.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
