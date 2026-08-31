# Esquema propuesto — seguridad y acceso

**Estado:** diseño para revisión.  
**No es una migración SQL.** Ninguna tabla, índice, RLS o dato inicial ha sido creado.

## Convenciones

- Los UUID se generan desde el servicio de servidor; no se incorporan triggers ni funciones de base de datos.
- Todas las fechas son `timestamptz` y se asignan explícitamente desde el servicio.
- Los estados y códigos se validan con restricciones `CHECK` visibles en la futura migración.
- Las claves foráneas a `auth.users(id)` referencian únicamente su clave primaria administrada por Supabase.

## 1. `empresas`

| Campo            | Tipo propuesto | Regla                                                           |
| ---------------- | -------------- | --------------------------------------------------------------- |
| `id`             | `uuid`         | Clave primaria.                                                 |
| `nombre`         | `varchar(120)` | Obligatorio; nombre visible.                                    |
| `estado`         | `varchar(16)`  | Obligatorio; solo `activa` o `inactiva`.                        |
| `creado_en`      | `timestamptz`  | Obligatorio.                                                    |
| `actualizado_en` | `timestamptz`  | Obligatorio; actualizado por el servicio, no por trigger.       |
| `inactivado_en`  | `timestamptz`  | Opcional; obligatorio cuando se inactiva por regla de servicio. |

**Restricciones e índices:**

- Clave primaria sobre `id`.
- Índice único parcial para permitir solo una fila con estado `activa` durante la etapa inicial.
- Índice por `estado` solo si las consultas administrativas lo justifican; el índice único parcial ya cubre el caso inicial.

## 2. `usuarios`

| Campo                        | Tipo propuesto | Regla                                                                       |
| ---------------------------- | -------------- | --------------------------------------------------------------------------- |
| `id`                         | `uuid`         | Clave primaria y referencia a `auth.users(id)`.                             |
| `empresa_id`                 | `uuid`         | Obligatorio; referencia a `empresas(id)`.                                   |
| `nombre_usuario`             | `varchar(50)`  | Obligatorio; valor visible elegido por la empresa.                          |
| `nombre_usuario_normalizado` | `varchar(50)`  | Obligatorio; minúsculas y sin espacios externos, calculado por el servidor. |
| `estado`                     | `varchar(16)`  | Obligatorio; solo `activo` o `inactivo`.                                    |
| `es_propietario`             | `boolean`      | Obligatorio; por defecto `false`.                                           |
| `creado_en`                  | `timestamptz`  | Obligatorio.                                                                |
| `actualizado_en`             | `timestamptz`  | Obligatorio.                                                                |
| `desactivado_en`             | `timestamptz`  | Opcional.                                                                   |
| `desactivado_por_usuario_id` | `uuid`         | Opcional; referencia a `usuarios(id)`.                                      |

**Restricciones e índices:**

- Clave primaria sobre `id`.
- Clave foránea `id → auth.users(id)` con eliminación restringida; las cuentas se desactivan, no se borran.
- Clave foránea `empresa_id → empresas(id)` con eliminación restringida.
- Único global sobre `nombre_usuario_normalizado`.
- Índice único parcial para un solo propietario por `empresa_id`.
- Índice compuesto por `empresa_id, estado` para resolver el usuario activo de una empresa y futuras políticas RLS.
- `CHECK` para que una cuenta inactiva tenga `desactivado_en`; la relación con quien la desactivó se valida también en servidor para asegurar que sea de la misma empresa.

## 3. `recursos`

| Campo    | Tipo propuesto | Regla                                   |
| -------- | -------------- | --------------------------------------- |
| `id`     | `smallint`     | Clave primaria.                         |
| `codigo` | `varchar(50)`  | Obligatorio y único; ejemplo: `agenda`. |
| `nombre` | `varchar(100)` | Obligatorio; etiqueta visible.          |
| `activo` | `boolean`      | Obligatorio; por defecto `true`.        |

**Restricciones e índices:** clave primaria sobre `id` y único sobre `codigo`.

**Carga inicial controlada:** los recursos se insertarán explícitamente en la migración cuando sea aprobada; no podrán ser creados desde la interfaz en esta versión.

## 4. `permisos`

| Campo           | Tipo propuesto | Regla                                                                                     |
| --------------- | -------------- | ----------------------------------------------------------------------------------------- |
| `id`            | `smallint`     | Clave primaria.                                                                           |
| `recurso_id`    | `smallint`     | Obligatorio; referencia a `recursos(id)`.                                                 |
| `codigo_accion` | `varchar(50)`  | Obligatorio; ejemplo: `visualizar`, `crear`, `editar`, `eliminar`, `validar_comprobante`. |
| `nombre`        | `varchar(120)` | Obligatorio; etiqueta visible.                                                            |
| `activo`        | `boolean`      | Obligatorio; por defecto `true`.                                                          |

**Restricciones e índices:**

- Clave primaria sobre `id`.
- Clave foránea a `recursos` con eliminación restringida.
- Único sobre `recurso_id, codigo_accion`.
- Índice por `recurso_id` para administrar permisos por módulo.

## 5. `permisos_usuario`

| Campo                     | Tipo propuesto | Regla                                     |
| ------------------------- | -------------- | ----------------------------------------- |
| `usuario_id`              | `uuid`         | Obligatorio; referencia a `usuarios(id)`. |
| `permiso_id`              | `smallint`     | Obligatorio; referencia a `permisos(id)`. |
| `asignado_en`             | `timestamptz`  | Obligatorio.                              |
| `asignado_por_usuario_id` | `uuid`         | Obligatorio; referencia a `usuarios(id)`. |

**Restricciones e índices:**

- Clave primaria compuesta sobre `usuario_id, permiso_id`; evita duplicados.
- Claves foráneas con eliminación restringida.
- Índice por `permiso_id` para auditoría y revisión de usuarios autorizados.
- El servicio valida que quien asigna y quien recibe pertenezcan a la misma empresa; no se almacena `empresa_id` para evitar datos duplicados e inconsistentes.

## 6. `auditorias_acceso`

| Campo                   | Tipo propuesto | Regla                                                    |
| ----------------------- | -------------- | -------------------------------------------------------- |
| `id`                    | `uuid`         | Clave primaria.                                          |
| `empresa_id`            | `uuid`         | Obligatorio; referencia a `empresas(id)`.                |
| `actor_usuario_id`      | `uuid`         | Opcional; usuario interno que realizó la acción.         |
| `actor_tipo`            | `varchar(24)`  | Obligatorio; `usuario_interno` o `soporte`.              |
| `actor_referencia`      | `varchar(120)` | Opcional; referencia no sensible para soporte externo.   |
| `usuario_afectado_id`   | `uuid`         | Opcional; usuario al que afectó la acción.               |
| `codigo_evento`         | `varchar(80)`  | Obligatorio; ejemplo: `usuario_desactivado`.             |
| `detalles_no_sensibles` | `jsonb`        | Opcional; solo datos mínimos permitidos, nunca secretos. |
| `creado_en`             | `timestamptz`  | Obligatorio.                                             |

**Restricciones e índices:**

- Clave primaria sobre `id` y claves foráneas a empresa y usuarios con eliminación restringida.
- `CHECK` que obliga `actor_usuario_id` cuando `actor_tipo` es `usuario_interno`; el procedimiento de soporte se registra como `soporte`.
- Índices por `empresa_id, creado_en DESC`, `usuario_afectado_id, creado_en DESC` y `codigo_evento, creado_en DESC`.
- No se concederán operaciones de actualización o eliminación a la aplicación; se insertan registros de auditoría, no se reescriben.

## Relaciones

```text
auth.users (Supabase)
        │ 1:1
        ▼
usuarios ── N:1 ── empresas
   │ 1:N                  │ 1:N
   ▼                      ▼
permisos_usuario       auditorias_acceso
   │ N:1
   ▼
permisos ── N:1 ── recursos
```

## Políticas RLS que se propondrán después

Cada tabla expuesta tendrá `RLS ENABLED`, grants mínimos y una política por operación necesaria. La evaluación debe comprobar:

1. `auth.uid()` existe.
2. Existe un `usuarios` activo cuyo `id` coincide con `auth.uid()`.
3. La empresa del usuario coincide con la fila consultada o modificada.
4. El usuario es propietario o tiene el permiso exacto requerido.

No se usará una función, trigger, RPC, vista ni dato de JWT para resolver permisos. Las consultas de RLS usarán relaciones explícitas e índices que las soporten.

## Migración prevista, aún no escrita

La primera migración propuesta contendrá únicamente estas seis tablas, sus restricciones, índices, grants, RLS y datos iniciales de `recursos` y `permisos`. No incluirá agenda, pacientes, profesionales, servicios, archivos ni pagos.
