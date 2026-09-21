# Contract: definicion de navegacion interna

Cada entrada interna debe definir:

| Campo | Regla |
|---|---|
| `id` | Seccion tecnica usada para estado activo. |
| `href` | Ruta protegida existente. |
| `etiqueta` | Texto visible en espanol. |
| `grupo` | `panorama`, `gestion` u `organizacion`. |
| `recurso` | Codigo de permisos o `null` para Inicio. |
| `icono` | SVG decorativo con texto visible adyacente. |

Una entrada con `recurso` se renderiza solo si `tienePermiso(contexto, recurso, "visualizar")` devuelve verdadero.
