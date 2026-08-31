import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import type { ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";

export type UsuarioListado = {
  id: string;
  nombreUsuario: string;
  estado: "activo" | "inactivo";
  esPropietario: boolean;
  creadoEn: string;
  permisos: number[];
};

export type PermisoDisponible = {
  id: number;
  nombre: string;
  accion: string;
  recurso: string;
  recursoNombre: string;
};

export async function listarUsuariosEmpresa(contexto: ContextoAutorizado) {
  const cliente = crearClienteSupabaseAdministrativo();
  const { data, error } = await cliente
    .from("usuarios")
    .select("id, nombre_usuario, estado, es_propietario, creado_en")
    .eq("empresa_id", contexto.empresaId)
    .order("nombre_usuario", { ascending: true });
  if (error) throw new Error("No fue posible cargar los usuarios.");
  const usuarios = ((data ?? []) as Array<Record<string, unknown>>).map(
    (usuario) => ({
      id: String(usuario.id),
      nombreUsuario: String(usuario.nombre_usuario),
      estado: usuario.estado as "activo" | "inactivo",
      esPropietario: Boolean(usuario.es_propietario),
      creadoEn: String(usuario.creado_en),
      permisos: [] as number[],
    }),
  ) satisfies UsuarioListado[];
  const ids = usuarios.map((usuario) => usuario.id);
  if (ids.length) {
    const asignaciones = await cliente
      .from("permisos_usuario")
      .select("usuario_id, permiso_id")
      .in("usuario_id", ids);
    if (asignaciones.error)
      throw new Error("No fue posible cargar los permisos.");
    for (const asignacion of (asignaciones.data ?? []) as Array<
      Record<string, unknown>
    >) {
      const usuario = usuarios.find(
        (item) => item.id === String(asignacion.usuario_id),
      );
      usuario?.permisos.push(Number(asignacion.permiso_id));
    }
  }
  return usuarios;
}

export async function listarPermisosDisponibles() {
  const cliente = crearClienteSupabaseAdministrativo();
  const { data, error } = await cliente
    .from("permisos")
    .select("id, nombre, codigo_accion, recurso:recursos(codigo, nombre)")
    .eq("activo", true)
    .order("id", { ascending: true });
  if (error) throw new Error("No fue posible cargar los permisos.");
  return ((data ?? []) as Array<Record<string, unknown>>).map((permiso) => {
    const recurso = Array.isArray(permiso.recurso)
      ? permiso.recurso[0]
      : permiso.recurso;
    const recursoObjeto = (recurso ?? {}) as Record<string, unknown>;
    return {
      id: Number(permiso.id),
      nombre: String(permiso.nombre),
      accion: String(permiso.codigo_accion),
      recurso: String(recursoObjeto.codigo ?? ""),
      recursoNombre: String(recursoObjeto.nombre ?? ""),
    } satisfies PermisoDisponible;
  });
  // Solo exponemos recursos que ya existen en la aplicación.
  // Los demás permisos permanecen en el catálogo para habilitarse al construir
  // sus módulos correspondientes.
}
