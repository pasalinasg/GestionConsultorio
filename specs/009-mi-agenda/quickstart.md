# Validación

1. Aplicar manualmente `supabase/migrations/008_profesionales_mi_agenda.sql` en Supabase.
2. Asociar una profesional a un usuario activo desde Editar profesional.
3. Asignar al usuario `Visualizar mi agenda` y `Editar estado de mis turnos`.
4. Iniciar sesión con ese usuario: debe aparecer Mi agenda, sin botón Nuevo turno y solo con sus citas.
5. Cambiar un estado propio: debe persistir. Intentar modificar una cita de otra profesional por acción manipulada: debe fallar.
6. Ejecutar `npm run typecheck`.
