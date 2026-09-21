# Plan: Nuevo turno como vista

**Decision**: ruta dedicada `/agenda/nuevo`, conservando `AplicacionShell` y `agenda.crear`.

**Reason**: los cinco pasos requieren espacio y una URL propia permite volver con el navegador.

**Constitution check**: no hay migracion ni cambio RLS; se reutiliza la accion autorizada existente.
