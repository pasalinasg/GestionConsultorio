# Research: Navegacion lateral

## Decision: Configuracion unica del menu en el shell

**Rationale**: Escritorio y movil tienen los mismos recursos y reglas; una lista tipada evita inconsistencias y enlaces olvidados.

**Alternatives considered**: Mantener dos listas manuales. Se descarta porque ya produjo opciones deshabilitadas y accesos desalineados.

## Decision: Filtrar por permiso de visualizar en servidor

**Rationale**: El shell ya obtiene `ContextoAutorizado`; no expone permisos ni necesita una consulta adicional. La autorizacion de ruta sigue siendo la frontera de seguridad real.

**Alternatives considered**: Filtrar solo en cliente. Se descarta porque produciria parpadeos y no es control de acceso.

## Decision: Iconos SVG inline sin dependencia nueva

**Rationale**: Son ligeros, accesibles mediante etiqueta visible y no aumentan dependencias.

**Alternatives considered**: Agregar biblioteca de iconos. Se descarta para este ajuste puntual.
