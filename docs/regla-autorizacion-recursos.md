# Regla de autorizacion por recurso

Esta regla aplica a todos los modulos del sistema:

- Registrar un recurso nuevo requiere `crear`.
- Modificar cualquier dato, estado, permiso o contrasena requiere `editar`.
- Eliminar un recurso requiere `eliminar`.
- Consultar un recurso requiere `visualizar`.
- Las actividades especiales solo se agregan cuando el recurso las necesita.

En Usuarios y permisos, crear un usuario requiere `crear`; gestionar permisos,
cambiar la contrasena o activar/inactivar requiere `editar`.
