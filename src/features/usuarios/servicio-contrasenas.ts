import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import { type ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";

export type ClienteContrasenas = {
  from: (tabla: string) => {
    select: (columnas: string) => {
      eq: (
        columna: string,
        valor: string,
      ) => {
        maybeSingle: () => Promise<{
          data: {
            id: string;
            empresa_id: string;
            nombre_usuario_normalizado: string;
            es_propietario: boolean;
          } | null;
          error: unknown;
        }>;
      };
    };
    insert: (fila: unknown) => Promise<{ error: unknown }>;
  };
  auth: {
    admin: {
      updateUserById: (
        id: string,
        datos: { password: string },
      ) => Promise<{ error: unknown }>;
    };
  };
};

export class ErrorContrasenas extends Error {
  constructor(
    readonly codigo:
      "no_autorizado" | "usuario_no_encontrado" | "operacion_invalida",
  ) {
    super("No fue posible restablecer la contraseña.");
  }
}

export async function restablecerContrasenaUsuario(
  usuarioId: string,
  nuevaContrasena: string,
  contexto: ContextoAutorizado,
  cliente: ClienteContrasenas = crearClienteSupabaseAdministrativo() as unknown as ClienteContrasenas,
) {
  if (!contexto.esPropietario || nuevaContrasena.length < 6)
    throw new ErrorContrasenas("no_autorizado");
  const resultado = await cliente
    .from("usuarios")
    .select("id, empresa_id, nombre_usuario_normalizado, es_propietario")
    .eq("id", usuarioId)
    .maybeSingle();
  const usuario = resultado.data;
  if (
    resultado.error ||
    !usuario ||
    usuario.empresa_id !== contexto.empresaId ||
    usuario.es_propietario
  )
    throw new ErrorContrasenas("usuario_no_encontrado");
  const actualizacion = await cliente.auth.admin.updateUserById(usuario.id, {
    password: nuevaContrasena,
  });
  if (actualizacion.error) throw new ErrorContrasenas("operacion_invalida");
  const auditoria = await cliente.from("auditorias_acceso").insert({
    id: crypto.randomUUID(),
    empresa_id: contexto.empresaId,
    actor_usuario_id: contexto.usuarioId,
    actor_tipo: "usuario_interno",
    usuario_afectado_id: usuarioId,
    codigo_evento: "usuario.contrasena_restablecida",
    creado_en: new Date().toISOString(),
    detalles_no_sensibles: null,
  });
  if (auditoria.error) throw new ErrorContrasenas("operacion_invalida");
}
