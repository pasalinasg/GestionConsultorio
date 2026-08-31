# Separación de paciente y ficha

La migración `005_pacientes_ficha.sql` normaliza el nombre de `Paciente` a `paciente`, conserva todos sus registros, agrega el aislamiento por `empresa_id` y crea `paciente_ficha` para los datos complementarios y clínicos.

Las columnas clínicas antiguas se conservan temporalmente en `paciente` para permitir una transición y reversión segura; la aplicación nueva utilizará `paciente_ficha`. La migración no se aplica automáticamente ni remueve columnas existentes.

La cédula se conserva en `documento`, el WhatsApp en `telefono`, el sexo en `sexo` y el estado existente se adapta en la aplicación a prospecto, activo o inactivo.
