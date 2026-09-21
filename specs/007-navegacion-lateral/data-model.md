# Data model

No se crean ni modifican entidades. La navegacion consume `ContextoAutorizado` existente:

- `esPropietario`: habilita todos los recursos.
- `permisos`: conjunto de codigos `<recurso>.visualizar` para usuarios internos.

Los datos permanecen en servidor; la visibilidad no sustituye la autorizacion de rutas.
