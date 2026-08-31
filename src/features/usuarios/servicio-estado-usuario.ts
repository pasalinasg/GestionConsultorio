import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import { type ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { validarTransicionUsuario, type EstadoUsuario } from "./estado-usuario";

export type ClienteEstadoUsuario = {
  auth?: {
    admin?: {
      signOut?: (usuarioId: string) => Promise<{ error: unknown }>;
    };
  };
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
            estado: EstadoUsuario;
            es_propietario: boolean;
          } | null;
          error: unknown;
        }>;
      };
    };
    update: (fila: unknown) => {
      eq: (columna: string, valor: string) => Promise<{ error: unknown }>;
    };
    insert: (fila: unknown) => Promise<{ error: unknown }>;
  };
};

export class ErrorEstadoUsuario extends Error {
  constructor(
    readonly codigo:
      "no_autorizado" | "usuario_no_encontrado" | "transicion_invalida",
  ) {
    super("No fue posible cambiar el estado del usuario.");
  }
}

export async function cambiarEstadoUsuario(
  usuarioId: string,
  siguiente: EstadoUsuario,
  contexto: ContextoAutorizado,
  cliente: ClienteEstadoUsuario = crearClienteSupabaseAdministrativo() as unknown as ClienteEstadoUsuario,
) {
  if (!contexto.esPropietario) throw new ErrorEstadoUsuario("no_autorizado");
  const resultado = await cliente
    .from("usuarios")
    .select("id, empresa_id, estado, es_propietario")
    .eq("id", usuarioId)
    .maybeSingle();
  const usuario = resultado.data;
  if (
    resultado.error ||
    !usuario ||
    usuario.empresa_id !== contexto.empresaId ||
    usuario.es_propietario
  )
    throw new ErrorEstadoUsuario("usuario_no_encontrado");
  if (!validarTransicionUsuario(usuario.estado, siguiente))
    throw new ErrorEstadoUsuario("transicion_invalida");
  const ahora = new Date().toISOString();
  const actualizacion = await cliente
    .from("usuarios")
    .update({
      estado: siguiente,
      actualizado_en: ahora,
      desactivado_en: siguiente === "inactivo" ? ahora : null,
      desactivado_por_usuario_id:
        siguiente === "inactivo" ? contexto.usuarioId : null,
    })
    .eq("id", usuarioId);
  if (actualizacion.error) throw new ErrorEstadoUsuario("transicion_invalida");
  if (siguiente === "inactivo" && cliente.auth?.admin?.signOut) {
    const revocacion = await cliente.auth.admin.signOut(usuarioId);
    if (revocacion.error) throw new ErrorEstadoUsuario("transicion_invalida");
  }
  const auditoria = await cliente.from("auditorias_acceso").insert({
    id: crypto.randomUUID(),
    empresa_id: contexto.empresaId,
    actor_usuario_id: contexto.usuarioId,
    actor_tipo: "usuario_interno",
    usuario_afectado_id: usuarioId,
    codigo_evento:
      siguiente === "inactivo" ? "usuario.desactivado" : "usuario.activado",
    creado_en: ahora,
    detalles_no_sensibles: null,
  });
  if (auditoria.error) throw new ErrorEstadoUsuario("transicion_invalida");
}
