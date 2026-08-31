# Inventario inicial de Supabase existente

**Fuente:** captura compartida el 2026-08-30.  
**Estado:** observado visualmente; pendiente de verificación al conectar el proyecto.  
**Regla:** este documento no autoriza cambios sobre las tablas existentes.

## Tabla `Paciente`

| Campo observado        | Tipo observado | Notas                                                                                 |
| ---------------------- | -------------- | ------------------------------------------------------------------------------------- |
| `paciente_id`          | `int8`         | Clave primaria aparente.                                                              |
| `created_at`           | `timestamptz`  | Obligatorio aparente.                                                                 |
| `nombre_apellido`      | `text`         |                                                                                       |
| `documento`            | `text`         | Tiene un indicador adicional en la captura; se verificará si posee índice o unicidad. |
| `fecha_nacimiento`     | `date`         |                                                                                       |
| `telefono`             | `text`         |                                                                                       |
| `estado_civil`         | `text`         |                                                                                       |
| `hijos`                | `int8`         |                                                                                       |
| `ocupacion`            | `text`         |                                                                                       |
| `estudio`              | `text`         |                                                                                       |
| `diagnostico_salud`    | `text`         | Dato sensible.                                                                        |
| `alergia_intolerancia` | `text`         | Dato sensible.                                                                        |
| `estado`               | `text`         |                                                                                       |
| `sexo`                 | `text`         |                                                                                       |

## Tabla `Consultas`

| Campo observado | Tipo observado | Notas                                                |
| --------------- | -------------- | ---------------------------------------------------- |
| `consulta_id`   | `int8`         | Clave primaria aparente.                             |
| `created_at`    | `timestamptz`  | Obligatorio aparente.                                |
| `paciente_id`   | `int8`         | Relación visual aparente con `Paciente.paciente_id`. |
| `fecha`         | `date`         |                                                      |

## Tabla `servicio`

| Campo observado     | Tipo observado | Notas                    |
| ------------------- | -------------- | ------------------------ |
| `id`                | `int8`         | Clave primaria aparente. |
| `created_at`        | `timestamptz`  | Obligatorio aparente.    |
| `descripcion`       | `text`         |                          |
| `cantidad_consulta` | `int8`         |                          |
| `precio`            | `numeric`      |                          |

## Observaciones para la futura integración

- La captura no muestra una relación entre `Consultas` y `servicio`; se validará al inspeccionar las claves foráneas reales.
- Las tablas parecen pertenecer a un esquema previo de pacientes, consultas y servicios; aún no contienen el límite por empresa ni los permisos definidos para el nuevo producto.
- `diagnostico_salud` y `alergia_intolerancia` requieren políticas de acceso especialmente estrictas antes de exponerlos a la aplicación.
- Se conservarán y analizarán antes de proponer cualquier migración, renombre o adaptación.
