# Modelo de datos conceptual — seguridad y acceso

Este documento describe entidades para revisión. No es una migración SQL y no autoriza la creación de tablas.

## Empresa

- Identificador estable.
- Nombre visible.
- Fecha de creación y estado.
- Un propietario inicial.

**Relaciones:** tiene muchos usuarios, recursos configurables y datos operativos.

**Regla temporal de alta:** mientras esté vigente la etapa inicial, solo puede existir una empresa activa en toda la plataforma. La regla se validará en el servicio de creación y se reforzará mediante una restricción explícita en la migración que el usuario deberá aprobar.

## Usuario interno

- Identificador enlazado únicamente a la clave primaria de la identidad de autenticación administrada.
- Identificador visible: nombre de usuario, único globalmente y normalizado para comparación.
- Empresa a la que pertenece.
- Estado: activo o inactivo.
- Fechas de creación, actualización, desactivación y usuario que ejecutó la desactivación.

**Reglas:** pertenece a una sola empresa; el nombre de usuario no se reutiliza sin una política explícita; no contiene contraseña ni identificador técnico de autenticación expuesto al cliente.

## Propiedad de empresa

Representa que un usuario interno es el propietario de una empresa.

**Reglas:** cada empresa tiene un propietario inicial; el propietario recibe todos los permisos. Transferir propiedad queda fuera de alcance inicial.

## Recurso

Catálogo de recursos administrables, por ejemplo: agenda, profesionales, servicios, pacientes y configuración de empresa.

**Reglas:** el catálogo es controlado por la aplicación; no depende de etiquetas libres del usuario.

## Permiso

Representa una acción sobre un recurso: visualizar, crear, editar, eliminar o una acción especial, como validar comprobante.

**Reglas:** las acciones se definen explícitamente; eliminar no se asigna a citas porque las citas se administran por estado.

## Asignación de permiso

Vincula un usuario interno activo con un permiso de su empresa.

**Reglas:** no pueden existir asignaciones duplicadas; una asignación inactiva o de otra empresa no autoriza ninguna acción.

## Registro de auditoría administrativa

Conserva cambios relevantes de acceso: creación, restablecimiento de contraseña, activación, desactivación y modificaciones de permisos.

- Actor que realizó la acción.
- Empresa y usuario afectado.
- Tipo de acción, fecha y contexto mínimo necesario.

**Reglas:** no almacena contraseñas, tokens, comprobantes ni contenido clínico.

También debe poder registrar una recuperación manual de la contraseña del propietario, identificando al operador de soporte según el procedimiento externo, sin incluir detalles de la verificación de identidad ni secretos.

## Fronteras de acceso

1. Una solicitud anónima no puede acceder a datos privados.
2. Una solicitud autenticada solo puede operar sobre filas de su empresa y con relación de usuario activa.
3. Cada operación requiere permiso explícito; el propietario se resuelve como todos los permisos de su propia empresa.
4. Las operaciones administrativas se realizan solo por el servidor y vuelven a comprobar empresa, propiedad y estado activo.
