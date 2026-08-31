# Infraestructura compartida

Aquí se ubicarán adaptadores compartidos, incluyendo los clientes de Supabase. Las claves administrativas no se expondrán al navegador.

Los clientes de navegador y servidor están en `supabase/`. Ambos usan solo las variables públicas de Supabase; una futura operación administrativa deberá crear un cliente separado del lado servidor y leer la clave de servicio únicamente desde `.env.local`.

Los errores de autorización se centralizan en `errores-autorizacion.ts` para evitar revelar información sobre empresas, usuarios o permisos inexistentes.
