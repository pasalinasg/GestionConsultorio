import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import { type ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { validarPermisos } from "@/features/usuarios/validacion-usuarios";

export type ClientePermisos = {
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
            es_propietario: boolean;
          } | null;
          error: unknown;
        }>;
      };
    };
    delete: () => {
      eq: (columna: string, valor: string) => Promise<{ error: unknown }>;
    };
    insert: (filas: unknown) => Promise<{ error: unknown }>;
  };
};

export class ErrorPermisos extends Error {
  constructor(
    readonly codigo:
      "no_autorizado" | "usuario_no_encontrado" | "operacion_invalida",
    detalle?: string,
  ) {
    super(
      process.env.NODE_ENV === "development" && detalle
        ? `No fue posible modificar los permisos: ${detalle}`
        : "No fue posible modificar los permisos.",
    );
  }
}

export async function reemplazarPermisosUsuario(
  usuarioId: string,
  permisos: number[],
  contexto: ContextoAutorizado,
  cliente: ClientePermisos = crearClienteSupabaseAdministrativo() as unknown as ClientePermisos,
) {
  if (!contexto.esPropietario || !validarPermisos(permisos))
    throw new ErrorPermisos("no_autorizado");
  const { data: usuario, error } = await cliente
    .from("usuarios")
    .select("id, empresa_id, es_propietario")
    .eq("id", usuarioId)
    .maybeSingle();
  if (
    error ||
    !usuario ||
    usuario.empresa_id !== contexto.empresaId ||
    usuario.es_propietario
  )
    throw new ErrorPermisos("usuario_no_encontrado");
  const borrado = await cliente
    .from("permisos_usuario")
    .delete()
    .eq("usuario_id", usuarioId);
  if (borrado.error)
    throw new ErrorPermisos(
      "operacion_invalida",
      JSON.stringify(borrado.error),
    );
  if (permisos.length === 0) return;
  const resultado = await cliente.from("permisos_usuario").insert(
    permisos.map((permisoId) => ({
      usuario_id: usuarioId,
      permiso_id: permisoId,
      asignado_en: new Date().toISOString(),
      asignado_por_usuario_id: contexto.usuarioId,
    })),
  );
  if (resultado.error)
    throw new ErrorPermisos(
      "operacion_invalida",
      JSON.stringify(resultado.error),
    );
}
