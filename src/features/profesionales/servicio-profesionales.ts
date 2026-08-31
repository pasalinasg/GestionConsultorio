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
    .select("id, nombre_completo, descripcion, estado")
    .eq("empresa_id", contexto.empresaId)
    .order("nombre_completo");
  if (error) throw new Error("No fue posible cargar los profesionales.");
  return (data ?? []) as Array<{
    id: string;
    nombre_completo: string;
    descripcion: string | null;
    estado: "activo" | "inactivo";
  }>;
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
  contexto: ContextoAutorizado,
) {
  if (!autorizado(contexto, "editar"))
    throw new ErrorProfesionales("no_autorizado");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales")
    .update({
      nombre_completo: nombre.trim(),
      descripcion: descripcion.trim() || null,
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
