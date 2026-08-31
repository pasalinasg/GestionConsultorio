# Configuración manual de Supabase Auth

Este documento no modifica la configuración remota. El propietario debe aplicar estos ajustes desde el dashboard de Supabase cuando el entorno esté listo.

## Antes de habilitar el alta

1. Mantener `SUPABASE_SERVICE_ROLE_KEY` únicamente en las variables de entorno del servidor. Nunca usar el prefijo `NEXT_PUBLIC_`.
2. Configurar el mínimo de contraseña de Auth en 6 caracteres o más.
3. Mantener las sesiones con duración corta para usuarios administrativos y revisar el tiempo de inactividad disponible en el plan de Supabase.
4. No habilitar registro público directo de Auth: el alta de empresa debe pasar solamente por la acción de servidor de la aplicación.
5. Restringir las URLs de redirección a los dominios reales del sistema antes de exponer inicio de sesión.

## Identidad interna

La aplicación usa una dirección técnica derivada del nombre de usuario solo en el servidor para satisfacer el requisito de email de Supabase Auth. No se presenta en interfaz, respuestas, auditorías ni registros de aplicación. La confirmación de correo se realiza administrativamente durante el alta, porque no existe un correo del propietario en el alcance inicial.

## Verificación posterior

- Confirmar que la clave administrativa no aparece en los artefactos de navegador ni en `NEXT_PUBLIC_*`.
- Crear una empresa de prueba únicamente en un entorno local o de pruebas.
- Comprobar que una segunda empresa activa es rechazada.
- Comprobar que el nombre de usuario y la contraseña nunca aparecen en registros de servidor ni respuestas de error.
