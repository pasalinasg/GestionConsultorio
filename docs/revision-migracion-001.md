# Revisión de migración 001 — seguridad y acceso

## Estado

- **Archivo:** `supabase/migrations/001_seguridad_acceso.sql`.
- **Aplicación remota:** el propietario del proyecto informó que la ejecutó manualmente el 2026-08-30.
- **Verificación técnica remota:** pendiente; este proyecto todavía no está vinculado a Supabase desde el entorno local.

## Propósito y alcance

La migración crea el núcleo de seguridad del producto:

- `empresas`
- `usuarios`
- `recursos`
- `permisos`
- `permisos_usuario`
- `auditorias_acceso`

También crea sus claves, restricciones, índices, catálogo inicial de recursos/permisos, grants mínimos y políticas RLS de lectura segura. No modifica las tablas existentes `Paciente`, `Consultas` ni `servicio`.

## Confirmaciones de control

- No contiene funciones, triggers, RPCs, vistas, vistas materializadas ni jobs.
- No contiene `DROP`, `ALTER` de tablas existentes ni datos clínicos.
- La única regla temporal de plataforma es el índice que permite una sola empresa `activa`.
- El navegador no recibe permisos de escritura sobre este núcleo; las operaciones administrativas se validan en el servidor.

## Verificación manual sugerida

Ejecutar estas consultas de solo lectura en el SQL Editor del proyecto:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'empresas', 'usuarios', 'recursos', 'permisos',
    'permisos_usuario', 'auditorias_acceso'
  )
order by table_name;

select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('empresas', 'usuarios', 'recursos', 'permisos', 'permisos_usuario', 'auditorias_acceso')
order by tablename, policyname;

select indexname, tablename
from pg_indexes
where schemaname = 'public'
  and tablename in ('empresas', 'usuarios', 'recursos', 'permisos', 'permisos_usuario', 'auditorias_acceso')
order by tablename, indexname;
```

La validación local automatizada está en `supabase/tests/001_seguridad_acceso_rls.sql` y se ejecutará más adelante con `supabase test db` contra un entorno local, no el proyecto remoto.

## Reversión manual

No se debe editar ni volver a ejecutar esta migración. Si fuera necesario revertirla antes de que existan datos de aplicación, se creará una nueva migración de reversión revisada y aprobada.

Una reversión que elimine estas tablas destruiría empresas, usuarios internos, permisos y auditorías creadas después de esta migración. Por esa razón, no se incluye SQL de `DROP` automático en este documento.

## Siguiente paso

Implementar el cliente Supabase y el servicio de autorización local. Antes de usar el proyecto remoto desde la aplicación, se configurarán sus variables de entorno de manera local y nunca se confirmarán claves al repositorio.
