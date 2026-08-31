# Plan de implementación — Pacientes

## Contexto técnico
Next.js App Router, Server Actions, TypeScript y Supabase. Se reutilizan los patrones de autorización, banners, modales y grillas de Servicios/Usuarios.

## Diseño
- Persistencia existente: `public.paciente` con `paciente_id` generado por Supabase, `empresa_id`, `nombre_apellido`, `documento`, `telefono`, `sexo`, `estado`.
- Capa de dominio: validación y normalización en `src/features/pacientes`.
- Acciones: Server Actions con DTOs y mensajes seguros.
- UI: página protegida y componente cliente con filtros, grilla y modales con scroll interno.

## Seguridad
Propietario obtiene acceso completo. Otros usuarios requieren `pacientes.visualizar`, `.crear`, `.editar` o `.eliminar`. No se agregan funciones, triggers ni migraciones nuevas.

## Verificación
Typecheck, lint y pruebas unitarias de validación; prueba manual de aislamiento por empresa y mensajes de permisos.
