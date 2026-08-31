# Recuperación del propietario

La recuperación del propietario queda fuera de la interfaz pública inicial. No existe una cuenta maestra ni una ruta oculta.

1. El propietario contacta al soporte por un canal verificado.
2. Soporte valida la identidad y la titularidad de la empresa según el procedimiento operativo vigente.
3. Soporte restablece la contraseña mediante el panel administrativo protegido de Supabase o el procedimiento interno aprobado.
4. Se registra el evento con `actor_tipo = 'soporte'`, la empresa afectada, el usuario afectado y el código `propietario.contrasena_recuperada`.
5. No se registran la contraseña, tokens, documentos enviados ni detalles de la verificación.

Este documento no autoriza cambios en Supabase y no contiene secretos.
