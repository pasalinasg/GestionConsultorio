# Revisión local de secretos y respuestas — 2026-08-30

## Alcance

Revisión estática de `src/`, `tests/`, `.env.example` y `docs/` para detectar exposición de claves, contraseñas, tokens, logs de depuración e identidades técnicas.

## Resultado

- La clave `SUPABASE_SERVICE_ROLE_KEY` se lee solo en `src/lib/supabase/admin.ts`, archivo marcado como `server-only`.
- No existe ninguna variable `NEXT_PUBLIC_` para la clave administrativa.
- La contraseña solo fluye desde el formulario hacia la llamada administrativa de Auth; no se devuelve, registra ni persiste en tablas propias.
- Los valores de contraseña visibles en pruebas son datos sintéticos.
- Los mensajes de error de alta son genéricos y no devuelven identificadores técnicos, claves ni detalle de disponibilidad fuera de la propia operación.
- No se detectaron llamadas `console.log` o `console.error` en el código de aplicación.

## Pendiente de validación de despliegue

Esta revisión no sustituye comprobar las variables reales del host ni los logs de un entorno desplegado. Esa comprobación se hará antes de habilitar el alta al público.
