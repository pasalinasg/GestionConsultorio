# Investigación — seguridad de datos y acceso

## Decisión: autenticación administrada con acceso visible por nombre de usuario

El usuario inicia sesión con nombre de usuario y contraseña. Supabase Auth mantiene las contraseñas con hashing seguro, pero admite contraseña asociada a correo o teléfono, no a un nombre de usuario nativo. La aplicación generará y manejará internamente una identidad técnica no visible a partir del nombre de usuario global; las pantallas nunca mostrarán ni solicitarán ese identificador técnico.

**Razón:** conserva la experiencia solicitada de usuario y contraseña sin implementar almacenamiento o verificación propia de contraseñas.

**Alternativas consideradas:** correo electrónico como acceso visible; se descarta porque el producto requiere nombre de usuario. Autenticación propia; se descarta por el riesgo de gestionar credenciales.

**Referencia:** [Supabase Password-based Auth](https://supabase.com/docs/guides/auth/passwords), [Supabase Password Security](https://supabase.com/docs/guides/auth/password-security).

## Decisión: altas y cambios de acceso solo desde el servidor

La creación de empresa, usuarios, restablecimiento de contraseña y desactivación se ejecutarán en servicios de servidor autorizados. La clave `service_role` no se expondrá al navegador. Al crear una empresa, el proceso crea la identidad de autenticación, la empresa, la relación de propiedad y los permisos totales; ante un fallo posterior se realizará una compensación para no dejar accesos incompletos.

**Razón:** las operaciones administrativas de Supabase Auth se deben invocar solo del lado servidor.

**Alternativas consideradas:** creación directa desde el cliente; se descarta porque expondría una credencial administrativa. Trigger sobre `auth.users`; se descarta por la regla del proyecto de no introducir triggers ni funciones sin aprobación explícita.

**Referencia:** [Supabase Admin createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser), [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data).

## Decisión: aislamiento por empresa y permisos mediante RLS explícito

Cada dato operativo llevará una referencia de empresa. Las políticas RLS comprobarán que el usuario autenticado tenga una relación activa con la misma empresa y el permiso necesario. Los permisos se almacenarán como datos de dominio; no se incluirán en JWT ni en metadatos modificables por el usuario.

**Razón:** RLS aporta una segunda barrera aunque un cliente intente acceder directamente a la API de datos. Los permisos por acción pueden cambiar sin esperar la renovación de un token.

**Alternativas consideradas:** confiar solo en validación de servidor; se descarta por falta de defensa en profundidad. Claims/RBAC basados en JWT; se descarta inicialmente porque los claims pueden quedar desactualizados y el patrón oficial suele requerir hooks y funciones, que no son necesarios en esta etapa.

**Referencia:** [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase RBAC with custom claims](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac).

## Decisión: desactivación reversible con bloqueo efectivo de acceso

Desactivar una cuenta marcará la relación de usuario como inactiva y revocará sus sesiones de actualización. Todas las operaciones de aplicación validarán la cuenta activa; las políticas RLS también exigirán actividad. Se configurará una duración corta de access token cuando se cree el proyecto de Supabase, para reducir la ventana de un JWT ya emitido.

**Razón:** conserva la trazabilidad del usuario y evita que una cuenta desactivada continúe accediendo por una sesión ya existente.

**Alternativas consideradas:** eliminar la cuenta de autenticación; se descarta porque dificulta conservar historial y reactivar al usuario. Solo bloquear nuevos inicios de sesión; se descarta porque no corta accesos ya existentes.

**Referencia:** [Supabase User Management — Removing account access](https://supabase.com/docs/guides/auth/managing-user-data), [Supabase User Sessions](https://supabase.com/docs/guides/auth/sessions).
