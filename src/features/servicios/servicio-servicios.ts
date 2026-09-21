import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import type { ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { validarServicio } from "./validacion-servicios";
import type { ServicioListado } from "./tipos-servicios";
export class ErrorServicios extends Error {
  constructor(
    readonly codigo:
      | "no_autorizado"
      | "invalido"
      | "existente"
      | "no_encontrado"
      | "operacion",
  ) {
    super("No fue posible completar la operacion de servicios.");
  }
}
export async function listarServicios(contexto: ContextoAutorizado) {
  const c = crearClienteSupabaseAdministrativo();
  const { data, error } = await c
    .from("servicios")
    .select(
      "id,nombre,descripcion,modalidad,duracion_minutos,presentacion,orden_publico,estado",
    )
    .eq("empresa_id", contexto.empresaId)
    .order("orden_publico")
    .order("nombre");
  if (error) throw new ErrorServicios("operacion");
  return ((data ?? []) as Array<Record<string, unknown>>).map(
    (item) =>
      ({
        id: String(item.id),
        nombre: String(item.nombre),
        descripcion: item.descripcion ? String(item.descripcion) : null,
        modalidad: item.modalidad as ServicioListado["modalidad"],
        duracionMinutos: Number(item.duracion_minutos),
        presentacion: item.presentacion as ServicioListado["presentacion"],
        ordenPublico: Number(item.orden_publico),
        estado: item.estado as ServicioListado["estado"],
      }) satisfies ServicioListado,
  );
}
export async function crearServicio(
  entrada: Parameters<typeof validarServicio>[0],
  contexto: ContextoAutorizado,
) {
  if (!contexto.esPropietario && !contexto.permisos.has("servicios.crear"))
    throw new ErrorServicios("no_autorizado");
  const v = validarServicio(entrada);
  if (!v.valido) throw new ErrorServicios("invalido");
  const c = crearClienteSupabaseAdministrativo();
  const { error } = await c.from("servicios").insert({
    id: crypto.randomUUID(),
    empresa_id: contexto.empresaId,
    nombre: v.datos.nombre,
    descripcion: v.datos.descripcion,
    modalidad: v.datos.modalidad,
    duracion_minutos: v.datos.duracion,
    presentacion: v.datos.presentacion,
    orden_publico: v.datos.ordenPublico,
    estado: "activo",
    creado_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  });
  if (error) throw new ErrorServicios("existente");
}
export async function editarServicio(
  id: string,
  entrada: Parameters<typeof validarServicio>[0],
  contexto: ContextoAutorizado,
) {
  if (!contexto.esPropietario && !contexto.permisos.has("servicios.editar"))
    throw new ErrorServicios("no_autorizado");
  const v = validarServicio(entrada);
  if (!v.valido) throw new ErrorServicios("invalido");
  const c = crearClienteSupabaseAdministrativo();
  const { error } = await c
    .from("servicios")
    .update({
      nombre: v.datos.nombre,
      descripcion: v.datos.descripcion,
      modalidad: v.datos.modalidad,
      duracion_minutos: v.datos.duracion,
      presentacion: v.datos.presentacion,
      orden_publico: v.datos.ordenPublico,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);
  if (error) throw new ErrorServicios("operacion");
}
export async function eliminarServicio(
  id: string,
  contexto: ContextoAutorizado,
) {
  if (!contexto.esPropietario && !contexto.permisos.has("servicios.eliminar"))
    throw new ErrorServicios("no_autorizado");
  const c = crearClienteSupabaseAdministrativo();
  const { error } = await c
    .from("servicios")
    .delete()
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);
  if (error) throw new ErrorServicios("operacion");
}

export async function cambiarEstadoServicio(
  id: string,
  estado: "activo" | "inactivo",
  contexto: ContextoAutorizado,
) {
  if (!contexto.esPropietario && !contexto.permisos.has("servicios.editar"))
    throw new ErrorServicios("no_autorizado");
  const c = crearClienteSupabaseAdministrativo();
  const { error } = await c
    .from("servicios")
    .update({ estado, actualizado_en: new Date().toISOString() })
    .eq("id", id)
    .eq("empresa_id", contexto.empresaId);
  if (error) throw new ErrorServicios("operacion");
}
