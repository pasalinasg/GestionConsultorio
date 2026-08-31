# Requisitos minimos de cada recurso

Todo recurso nuevo debe incluir desde su primera pantalla:

- Listado dentro de la card estandar del sistema.
- Busqueda y filtros relevantes.
- Estados de carga y estado vacio consistentes.
- Creacion exclusivamente mediante modal.
- Modal con boton visible para cerrar, bordes redondeados y scroll interno.
- Edicion mediante modal.
- Cierre automatico del modal solo despues de un guardado exitoso.
- Si hay error, el modal permanece abierto para corregirlo.
- Banners independientes para confirmaciones y errores, sin mensajes incrustados en formularios.
- Permisos del recurso: `visualizar`, `crear`, `editar` y `eliminar` cuando correspondan.
- Aislamiento de datos por empresa y validacion server-side.
