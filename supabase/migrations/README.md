# Migraciones de Supabase

Cada archivo SQL de esta carpeta representa un cambio de esquema explícito y versionado.

## Regla obligatoria

No aplicar ninguna migración a Supabase remoto sin aprobación explícita del propietario del proyecto para ese archivo concreto.

Antes de aplicar una migración se debe revisar:

1. Tablas, campos, relaciones y restricciones afectadas.
2. Políticas RLS, grants e impacto sobre datos existentes.
3. Pasos de verificación y reversión manual.
4. Ausencia de funciones, triggers, RPCs, vistas materializadas y jobs no aprobados.

Las migraciones deben ser pequeñas, legibles y tener un único propósito.
