# Guía de validación — seguridad y acceso

## Prerrequisitos futuros

- Aplicación web configurada con autenticación administrada por Supabase.
- Proyecto Supabase local para pruebas y migraciones aún no aplicadas remotamente.
- Usuario administrativo de prueba y al menos dos empresas de prueba.

## Escenarios de validación

### Crear empresa

1. Abrir el flujo público de creación de empresa.
2. Ingresar nombre de empresa, nombre de usuario globalmente disponible y contraseña válida.
3. Confirmar que se crea la empresa y se inicia la sesión del propietario.
4. Confirmar que el propietario puede administrar usuarios y permisos de su empresa.
5. Intentar crear una segunda empresa y confirmar que se rechaza sin crear identidad ni datos parciales.

### Aislamiento entre empresas

1. Crear dos empresas con propietarios distintos.
2. Crear una cita o dato de agenda en la primera empresa.
3. Iniciar sesión como propietario o usuario de la segunda empresa.
4. Intentar consultar o manipular el identificador del dato de la primera empresa.
5. Confirmar que la operación es denegada y no revela datos.

### Permiso de agenda

1. Crear un usuario activo con solo `agenda.visualizar`.
2. Confirmar que puede leer toda la agenda de su empresa.
3. Confirmar que no puede crear, editar, cancelar ni validar comprobantes.

### Desactivación y restablecimiento

1. Crear un usuario, iniciar sesión y conservar una sesión activa.
2. Desactivarlo como propietario.
3. Confirmar que pierde acceso al siguiente intento de operación y no puede iniciar sesión nuevamente.
4. Reactivarlo y restablecerle la contraseña como propietario.
5. Confirmar que solo la contraseña nueva permite iniciar sesión.
6. Confirmar que un usuario interno no puede acceder a ningún flujo para cambiar su propia contraseña.
7. Verificar documentalmente que la recuperación de contraseña del propietario se realiza fuera de la aplicación y deja un registro administrativo sin secretos.

## Pruebas requeridas antes de implementación

- Pruebas de autorización permitida y denegada por cada operación RLS expuesta.
- Pruebas de servicio para creación compensada de empresa y usuario.
- Pruebas de integración de desactivación, sesión activa y restablecimiento de contraseña.
- Pruebas que garanticen ausencia de secretos y credenciales en respuestas y registros.
