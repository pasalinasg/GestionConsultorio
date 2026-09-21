# Modelo de datos

| Entidad | Campo | Regla |
|---|---|---|
| `profesionales` | `usuario_id uuid nullable` | FK a `usuarios(id)`; único cuando no es nulo. |
| `recursos` | `mi_agenda` | Recurso visible solo por permiso explícito. |
| `permisos` | visualizar, editar | Lectura propia y actualización de estado propio. |

Datos sensibles: la relación usuario–profesional no se expone en el cliente salvo a administración autorizada. Los turnos siguen sujetos a empresa y profesional en el servidor.
