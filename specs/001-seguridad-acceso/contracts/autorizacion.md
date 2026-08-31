# Contrato de autorización

## Contexto requerido por toda operación privada

Cada operación debe contar con una sesión autenticada y resolver, desde el servidor:

- identidad autenticada;
- usuario interno vinculado;
- empresa del usuario;
- estado activo;
- permiso necesario para recurso y acción.

Una operación que no cumpla alguna condición devuelve un error genérico de autorización y no revela existencia de datos de otras empresas.

## Operaciones administrativas

| Operación              | Actor autorizado                               | Resultado esperado                                                                            |
| ---------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Crear empresa          | Persona no autenticada durante el alta inicial | Crea empresa y su propietario con permisos completos solo si no existe ya una empresa activa. |
| Crear usuario interno  | Propietario activo de la empresa               | Crea identidad y usuario de la misma empresa, con permisos elegidos.                          |
| Cambiar permisos       | Propietario activo de la empresa               | Reemplaza únicamente permisos de usuarios de su empresa.                                      |
| Desactivar usuario     | Propietario activo de la empresa               | Bloquea acceso y conserva historial.                                                          |
| Restablecer contraseña | Propietario activo de la empresa               | Asigna contraseña nueva sin revelar la anterior.                                              |

Los usuarios internos no disponen de una operación para cambiar su propia contraseña.

La recuperación de la contraseña del propietario queda fuera de la aplicación: soporte ejecutará un procedimiento manual con verificación de identidad y registrará la acción. No se expondrá una cuenta maestra ni una ruta pública de recuperación.

## Operaciones de datos de agenda

| Acción                  | Requisito                                                                       |
| ----------------------- | ------------------------------------------------------------------------------- |
| Visualizar agenda       | Usuario activo con `agenda.visualizar`; puede ver toda la agenda de su empresa. |
| Crear cita              | Usuario activo con `agenda.crear`; solo dentro de su empresa.                   |
| Editar o cambiar estado | Usuario activo con `agenda.editar`; solo dentro de su empresa.                  |
| Validar comprobante     | Usuario activo con `agenda.validar_comprobante`; solo dentro de su empresa.     |
| Eliminar cita           | No permitido; las citas cambian de estado.                                      |

## Garantías de seguridad

- Las interfaces solo mejoran la experiencia; nunca sustituyen la validación de servidor o RLS.
- Las respuestas no incluyen claves administrativas, contraseñas, hashes, tokens ni identificadores técnicos de autenticación.
- Los mensajes de inicio de sesión son deliberadamente genéricos para no confirmar la existencia de un usuario.
