# Implementation Plan: Navegacion lateral por permisos

**Branch**: `007-navegacion-lateral` | **Date**: 2026-08-31 | **Spec**: [spec.md](spec.md)

## Summary

Centralizar la definicion de navegacion y renderizarla en el shell de escritorio y movil segun `tienePermiso(contexto, recurso, "visualizar")`. Se reutiliza el contexto de autorizacion existente; no hay cambios de datos.

## Technical Context

**Language/Version**: TypeScript, Next.js 16 App Router  
**Primary Dependencies**: React, Next.js Link, Tailwind CSS  
**Storage**: Supabase existente, solo lectura de sesion/permisos  
**Testing**: `npm run typecheck` y validacion manual de roles  
**Target Platform**: Navegador web, escritorio y movil  
**Project Type**: Aplicacion web  
**Performance Goals**: Sin consultas adicionales; reutilizar `ContextoAutorizado` ya cargado por el shell.  
**Constraints**: La visibilidad de menu complementa, no sustituye, la autorizacion de paginas y acciones.  
**Scale/Scope**: Un shell y seis destinos implementados.

## Constitution Check

- Privacidad y acceso: cumple. El shell usa permisos obtenidos en servidor y las rutas mantienen su comprobacion propia.
- Base de datos: cumple. No se crea ni altera esquema remoto.
- Limites modulares: cumple. La configuracion de menu vive en `features/navegacion`.
- Evolucion segura: cumple. Se valida tipado y escenarios por rol.

## Project Structure

```text
src/
├── features/
│   ├── autenticacion/servicio-autorizacion.ts
│   └── navegacion/aplicacion-shell.tsx
└── app/(protegido)/.../page.tsx
```

**Structure Decision**: Se modifica solo el shell reutilizable. Las paginas siguen enviando su seccion activa y conservan sus validaciones de ruta.

## Complexity Tracking

No aplica.
