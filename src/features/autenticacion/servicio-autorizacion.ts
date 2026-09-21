import type { SupabaseClient } from "@supabase/supabase-js";
import { ErrorAutorizacion } from "@/lib/errores-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";

export type AccionRecurso =
  "visualizar" | "crear" | "editar" | "eliminar" | "validar_comprobante";

export type ContextoAutorizado = {
  usuarioId: string;
  empresaId: string;
  esPropietario: boolean;
  permisos: ReadonlySet<string>;
};

type UsuarioInterno = {
  id: string;
  empresa_id: string;
  estado: "activo" | "inactivo";
  es_propietario: boolean;
};

type AsignacionPermiso = {
  permiso_id: number;
};

type Permiso = {
  codigo_accion: string;
  recurso: { codigo: string } | Array<{ codigo: string }> | null;
};

export type ClienteAutorizacion = Pick<SupabaseClient, "auth" | "from">;

export function crearCodigoPermiso(recurso: string, accion: AccionRecurso) {
  return `${recurso}.${accion}`;
}

function nombreActividad(recurso: string, accion: AccionRecurso) {
  const acciones: Record<AccionRecurso, string> = {
    visualizar: "Visualizar",
    crear: "Crear",
    editar: "Editar",
    eliminar: "Eliminar",
    validar_comprobante: "Validar comprobantes",
  };
  const recursos: Record<string, string> = {
    empresa: "empresa",
    usuarios: "usuarios",
    agenda: "agenda",
    mi_agenda: "mi agenda",
    profesionales: "profesionales",
    servicios: "servicios",
    pacientes: "pacientes",
  };
  return `${acciones[accion]} ${recursos[recurso] ?? recurso}`;
}

export function tienePermiso(
  contexto: Pick<ContextoAutorizado, "esPropietario" | "permisos">,
  recurso: string,
  accion: AccionRecurso,
) {
  return (
    contexto.esPropietario ||
    contexto.permisos.has(crearCodigoPermiso(recurso, accion))
  );
}

export async function obtenerContextoAutorizado(
  cliente?: ClienteAutorizacion,
): Promise<ContextoAutorizado> {
  const clienteResuelto =
    cliente ??
    ((await crearClienteSupabaseServidor()) as unknown as ClienteAutorizacion);
  const { data: datosAutenticacion, error: errorAutenticacion } =
    await clienteResuelto.auth.getUser();
  const usuarioAutenticado = datosAutenticacion.user;

  if (errorAutenticacion || !usuarioAutenticado) {
    throw new ErrorAutorizacion("sesion_requerida");
  }

  const { data: datosUsuario, error: errorUsuario } = await clienteResuelto
    .from("usuarios")
    .select("id, empresa_id, estado, es_propietario")
    .eq("id", usuarioAutenticado.id)
    .maybeSingle();
  const usuario = datosUsuario as UsuarioInterno | null;

  if (errorUsuario || !usuario) {
    throw new ErrorAutorizacion("usuario_no_encontrado");
  }

  if (usuario.estado !== "activo") {
    throw new ErrorAutorizacion("usuario_inactivo");
  }

  const { data: asignaciones, error: errorAsignaciones } = await clienteResuelto
    .from("permisos_usuario")
    .select("permiso_id")
    .eq("usuario_id", usuario.id);

  if (errorAsignaciones) {
    throw new ErrorAutorizacion("permiso_denegado");
  }

  const identificadoresPermiso = (
    (asignaciones ?? []) as AsignacionPermiso[]
  ).map((asignacion) => asignacion.permiso_id);
  const permisos = new Set<string>();

  if (identificadoresPermiso.length > 0) {
    const { data: datosPermisos, error: errorPermisos } = await clienteResuelto
      .from("permisos")
      .select("codigo_accion, recurso:recursos(codigo)")
      .in("id", identificadoresPermiso);

    if (errorPermisos) {
      throw new ErrorAutorizacion("permiso_denegado");
    }

    for (const permiso of (datosPermisos as unknown as Permiso[] | null) ??
      []) {
      const recurso = Array.isArray(permiso.recurso)
        ? permiso.recurso[0]
        : permiso.recurso;

      if (recurso) {
        permisos.add(`${recurso.codigo}.${permiso.codigo_accion}`);
      }
    }
  }

  return {
    usuarioId: usuario.id,
    empresaId: usuario.empresa_id,
    esPropietario: usuario.es_propietario,
    permisos,
  };
}

export async function requerirAutorizacion(
  recurso: string,
  accion: AccionRecurso,
  cliente?: ClienteAutorizacion,
) {
  const contexto = await obtenerContextoAutorizado(cliente);

  if (!tienePermiso(contexto, recurso, accion)) {
    throw new ErrorAutorizacion(
      "permiso_denegado",
      nombreActividad(recurso, accion),
    );
  }

  return contexto;
}
