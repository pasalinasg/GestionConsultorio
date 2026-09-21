import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import type { ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
export class ErrorProfesionales extends Error {
  constructor(readonly codigo: "no_autorizado" | "operacion" | "invalido") {
    super("No fue posible completar la operacion de profesionales.");
  }
}

export async function listarProfesionales(contexto: ContextoAutorizado) {
  const cliente = crearClienteSupabaseAdministrativo();
  const { data, error } = await cliente
    .from("profesionales")
    .select("id, nombre_completo, descripcion, estado, usuario_id")
    .eq("empresa_id", contexto.empresaId)
    .order("nombre_completo");
  if (error) throw new Error("No fue posible cargar los profesionales.");
  return (data ?? []) as Array<{
    id: string;
    nombre_completo: string;
    descripcion: string | null;
    estado: "activo" | "inactivo";
    usuario_id: string | null;
  }>;
}

export async function obtenerProfesionalDelUsuario(contexto: ContextoAutorizado) {
  const { data, error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales")
    .select("id, nombre_completo")
    .eq("empresa_id", contexto.empresaId)
    .eq("usuario_id", contexto.usuarioId)
    .eq("estado", "activo")
    .maybeSingle();
  if (error) throw new ErrorProfesionales("operacion");
  return data as { id: string; nombre_completo: string } | null;
}
function autorizado(c: ContextoAutorizado, a: "crear" | "editar" | "eliminar") {
  return c.esPropietario || c.permisos.has(`profesionales.${a}`);
}
export async function crearProfesional(
  nombre: string,
  descripcion: string,
  contexto: ContextoAutorizado,
) {
  if (!autorizado(contexto, "crear"))
    throw new ErrorProfesionales("no_autorizado");
  if (nombre.trim().length < 2) throw new ErrorProfesionales("invalido");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales")
    .insert({
      id: crypto.randomUUID(),
      empresa_id: contexto.empresaId,
      nombre_completo: nombre.trim(),
      descripcion: descripcion.trim() || null,
      estado: "activo",
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    });
  if (error) throw new ErrorProfesionales("operacion");
}
export async function editarProfesional(
  id: string,
  nombre: string,
  descripcion: string,
  usuarioId: string,
  contexto: ContextoAutorizado,
) {
  if (!autorizado(contexto, "editar"))
    throw new ErrorProfesionales("no_autorizado");
  const cliente = crearClienteSupabaseAdministrativo();
  const usuarioAsignado = usuarioId.trim() || null;
  if (usuarioAsignado) {
    const { data: usuario, error: errorUsuario } = await cliente.from("usuarios")
      .select("id")
      .eq("id", usuarioAsignado)
      .eq("empresa_id", contexto.empresaId)
      .eq("estado", "activo")
      .maybeSingle();
    if (errorUsuario || !usuario) throw new ErrorProfesionales("invalido");
  }
  const { error } = await cliente
    .from("profesionales")
    .update({
      nombre_completo: nombre.trim(),
      descripcion: descripcion.trim() || null,
      usuario_id: usuarioAsignado,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);
  if (error) throw new ErrorProfesionales("operacion");
}
export async function cambiarEstadoProfesional(
  id: string,
  estado: "activo" | "inactivo",
  contexto: ContextoAutorizado,
) {
  if (!autorizado(contexto, "editar"))
    throw new ErrorProfesionales("no_autorizado");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales")
    .update({ estado, actualizado_en: new Date().toISOString() })
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);
  if (error) throw new ErrorProfesionales("operacion");
}
export async function eliminarProfesional(
  id: string,
  contexto: ContextoAutorizado,
) {
  if (!autorizado(contexto, "eliminar"))
    throw new ErrorProfesionales("no_autorizado");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales")
    .delete()
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);
  if (error) throw new ErrorProfesionales("operacion");
}
