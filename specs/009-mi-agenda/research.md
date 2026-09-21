# Investigación

## Decisión: columna opcional en profesionales

**Motivo:** la identidad profesional es una extensión opcional de una cuenta, no una entidad many-to-many. Un índice único parcial conserva profesionales sin usuario y evita vínculos duplicados.

**Alternativa:** tabla de vínculos. Se descarta por añadir historial y cardinalidad que el producto no requiere hoy.

## Decisión: recurso separado

**Motivo:** la secretaria necesita Agenda global; la profesional no debe heredar la capacidad de reservar ni consultar a otras profesionales.
