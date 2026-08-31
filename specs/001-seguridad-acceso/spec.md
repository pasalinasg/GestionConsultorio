# Especificación: seguridad de datos y acceso

**Funcionalidad:** 001-seguridad-acceso  
**Estado:** Lista para planificación  
**Referencia:** `docs/PRD.md`

## Objetivo

Proteger los datos de cada empresa y controlar el acceso de sus usuarios internos mediante credenciales propias, permisos explícitos y desactivación inmediata. Esta funcionalidad establece la base de seguridad para agenda, pacientes, profesionales, servicios y módulos futuros.

## Escenarios de usuario

### Propietario crea un usuario interno

El propietario crea una cuenta para una persona de su empresa con un nombre de usuario único globalmente y una contraseña. Le asigna permisos por recurso y acción. La persona puede iniciar sesión y utilizar únicamente las acciones autorizadas.

### Usuario accede a información de su empresa

Un usuario que tiene permiso de visualización de agenda puede consultar todas las citas de su propia empresa. No puede ver, inferir, crear, editar ni modificar información de otra empresa.

### Propietario desactiva a un usuario

El propietario desactiva una cuenta cuando ya no debe tener acceso. El usuario pierde acceso inmediatamente, pero se conserva el historial de acciones y registros relacionados.

### Propietario restablece una contraseña

Si un usuario olvida su contraseña, el propietario le asigna una nueva. No existe recuperación automática por correo electrónico ni WhatsApp en la primera versión.

## Requisitos funcionales

- El sistema DEBE permitir crear una empresa con un propietario que tenga acceso total.
- Durante la etapa inicial, el sistema DEBE rechazar de forma segura el alta de una empresa si ya existe una empresa activa. Esta restricción es temporal; el modelo de aislamiento conserva la empresa como límite de datos para una futura expansión multiempresa.
- El sistema DEBE permitir que el propietario cree usuarios internos para su propia empresa.
- Cada usuario DEBE pertenecer inicialmente a una sola empresa.
- El nombre de usuario DEBE ser único globalmente y ser el identificador visible de acceso.
- Las contraseñas DEBEN ser gestionadas por un proveedor de autenticación seguro; la aplicación no debe almacenarlas en texto plano ni exponerlas.
- El propietario DEBE poder asignar permisos por recurso y acción como mínimo para visualizar, crear, editar y eliminar, además de acciones especiales.
- La acción de validar comprobantes DEBE poder concederse independientemente dentro del recurso de agenda.
- El propietario DEBE poder activar, desactivar y restablecer la contraseña de sus usuarios internos.
- Los usuarios internos NO DEBEN poder cambiar su propia contraseña; cualquier cambio queda exclusivamente en manos del propietario de su empresa.
- Si el propietario olvida su propia contraseña, su recuperación se realizará mediante un procedimiento manual externo de soporte con verificación de identidad. No existirá recuperación automática ni una cuenta administrativa oculta dentro de la aplicación.
- Una cuenta desactivada DEBE perder acceso de inmediato y no podrá iniciar nuevas sesiones ni continuar usando una sesión previamente válida.
- Las operaciones sobre datos DEBEN validar en el servidor: usuario autenticado, cuenta activa, pertenencia a empresa y permiso requerido.
- La visualización de agenda autorizada DEBE permitir ver todas las citas de la empresa, sin restricción adicional por profesional.
- El sistema DEBE conservar una trazabilidad suficiente de creación, actualización, desactivación y acciones administrativas relevantes.

## Límites de alcance

- No se admiten usuarios en múltiples empresas.
- No se admite el alta de una segunda empresa mientras esté activa la restricción inicial de empresa única.
- No habrá invitaciones por correo, acceso social, recuperación automática de contraseña ni verificación por WhatsApp.
- No se implementan todavía permisos por profesional ni acceso a información clínica detallada.
- No se crearán tablas, políticas, funciones, triggers, RPCs ni cambios remotos hasta que el diseño y cada migración SQL sean aprobados explícitamente.

## Criterios de éxito

- El propietario puede crear, autorizar, desactivar y restablecer el acceso de un usuario sin intervención técnica.
- Un usuario autorizado puede operar únicamente dentro de su empresa y sus acciones permitidas.
- Una solicitud sin sesión válida, con cuenta desactivada, de otra empresa o sin permiso es rechazada de forma segura.
- Ninguna contraseña ni dato sensible se expone en registros, respuestas de error o el cliente.
