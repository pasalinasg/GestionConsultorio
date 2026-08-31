import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import type { ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
export type Franja = {
  id: string;
  dia: number;
  inicio: string;
  fin: string;
  estado?: "activo" | "inactivo";
};
export type AsignacionServicio = {
  id: string;
  servicioId: string;
  servicioNombre: string;
  modalidad: string;
  precio: number;
  estado: "activo" | "inactivo";
  franjas: Franja[];
};
export type Disponibilidad = Franja & {
  profesionalId: string;
  estado: "activo" | "inactivo";
};
export class ErrorAsignaciones extends Error {
  constructor(readonly codigo: "no_autorizado" | "operacion" | "invalido") {
    super("No fue posible gestionar la disponibilidad del profesional.");
  }
}
const puede = (
  c: ContextoAutorizado,
  a: "visualizar" | "crear" | "editar" | "eliminar",
) => c.esPropietario || c.permisos.has(`profesionales.${a}`);
const valida = (d: number, i: string, f: string) =>
  Number.isInteger(d) &&
  d >= 1 &&
  d <= 7 &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(i) &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(f) &&
  i < f;
const minutos = (hora: string) => {
  const [h, m] = hora.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
};
const seSolapan = (ai: string, af: string, bi: string, bf: string) =>
  minutos(ai) < minutos(bf) && minutos(bi) < minutos(af);
export async function listarAsignaciones(
  pid: string,
  c: ContextoAutorizado,
): Promise<AsignacionServicio[]> {
  if (!puede(c, "visualizar")) throw new ErrorAsignaciones("no_autorizado");
  const db = crearClienteSupabaseAdministrativo();
  const { data, error } = await db
    .from("profesionales_servicios")
    .select("id,servicio_id,precio,estado,servicios(nombre,modalidad)")
    .eq("profesional_id", pid)
    .eq("empresa_id", c.empresaId)
    .order("creado_en");
  if (error) throw new ErrorAsignaciones("operacion");
  const ids = (data ?? []).map((r) => String(r.id));
  const { data: fs } = ids.length
    ? await db
        .from("profesionales_servicios_franjas")
        .select(
          "id,profesional_servicio_id,dia_semana,hora_inicio,hora_fin,estado",
        )
        .in("profesional_servicio_id", ids)
        .eq("empresa_id", c.empresaId)
    : { data: [] };
  return (data ?? []).map((r) => {
    const s = Array.isArray(r.servicios) ? r.servicios[0] : r.servicios;
    return {
      id: String(r.id),
      servicioId: String(r.servicio_id),
      servicioNombre: String(s?.nombre ?? "Servicio"),
      modalidad: String(s?.modalidad ?? ""),
      precio: Number(r.precio),
      estado: r.estado as "activo" | "inactivo",
      franjas: (fs ?? [])
        .filter((f) => String(f.profesional_servicio_id) === String(r.id))
        .map((f) => ({
          id: String(f.id),
          dia: Number(f.dia_semana),
          inicio: String(f.hora_inicio).slice(0, 5),
          fin: String(f.hora_fin).slice(0, 5),
          estado: f.estado as "activo" | "inactivo",
        })),
    };
  });
}
export async function crearAsignacion(
  pid: string,
  sid: string,
  precio: number,
  c: ContextoAutorizado,
) {
  if (!puede(c, "crear") || !Number.isFinite(precio) || precio < 0)
    throw new ErrorAsignaciones("no_autorizado");
  const db = crearClienteSupabaseAdministrativo();
  const { data: profesional } = await db
    .from("profesionales")
    .select("id")
    .eq("id", pid)
    .eq("empresa_id", c.empresaId)
    .maybeSingle();
  const { data: servicio } = await db
    .from("servicios")
    .select("id")
    .eq("id", sid)
    .eq("empresa_id", c.empresaId)
    .maybeSingle();
  if (!profesional || !servicio) throw new ErrorAsignaciones("invalido");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_servicios")
    .insert({
      id: crypto.randomUUID(),
      empresa_id: c.empresaId,
      profesional_id: pid,
      servicio_id: sid,
      precio,
      estado: "activo",
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    });
  if (error) throw new ErrorAsignaciones("operacion");
}
export async function editarAsignacion(
  id: string,
  precio: number,
  estado: "activo" | "inactivo",
  c: ContextoAutorizado,
) {
  if (!puede(c, "editar") || !Number.isFinite(precio) || precio < 0)
    throw new ErrorAsignaciones("no_autorizado");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_servicios")
    .update({ precio, estado, actualizado_en: new Date().toISOString() })
    .eq("id", id)
    .eq("empresa_id", c.empresaId);
  if (error) throw new ErrorAsignaciones("operacion");
}
export async function eliminarAsignacion(id: string, c: ContextoAutorizado) {
  if (!puede(c, "eliminar")) throw new ErrorAsignaciones("no_autorizado");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_servicios")
    .delete()
    .eq("id", id)
    .eq("empresa_id", c.empresaId);
  if (error) throw new ErrorAsignaciones("operacion");
}
export async function listarDisponibilidad(
  pid: string,
  c: ContextoAutorizado,
): Promise<Disponibilidad[]> {
  if (!puede(c, "visualizar")) throw new ErrorAsignaciones("no_autorizado");
  const { data, error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_disponibilidad")
    .select("id,profesional_id,dia_semana,hora_inicio,hora_fin,estado")
    .eq("profesional_id", pid)
    .eq("empresa_id", c.empresaId)
    .order("dia_semana")
    .order("hora_inicio");
  if (error) throw new ErrorAsignaciones("operacion");
  return (data ?? []).map((f) => ({
    id: String(f.id),
    profesionalId: String(f.profesional_id),
    dia: Number(f.dia_semana),
    inicio: String(f.hora_inicio).slice(0, 5),
    fin: String(f.hora_fin).slice(0, 5),
    estado: f.estado as "activo" | "inactivo",
  }));
}
export async function crearDisponibilidad(
  pid: string,
  d: number,
  i: string,
  f: string,
  c: ContextoAutorizado,
) {
  if (!puede(c, "crear")) throw new ErrorAsignaciones("no_autorizado");
  if (!valida(d, i, f)) throw new ErrorAsignaciones("invalido");
  const { data: profesional } = await crearClienteSupabaseAdministrativo()
    .from("profesionales")
    .select("id")
    .eq("id", pid)
    .eq("empresa_id", c.empresaId)
    .maybeSingle();
  if (!profesional) throw new ErrorAsignaciones("invalido");
  const { data: existentes } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_disponibilidad")
    .select("hora_inicio,hora_fin")
    .eq("profesional_id", pid)
    .eq("empresa_id", c.empresaId)
    .eq("dia_semana", d)
    .eq("estado", "activo");
  if (
    (existentes ?? []).some((x) =>
      seSolapan(i, f, String(x.hora_inicio), String(x.hora_fin)),
    )
  )
    throw new ErrorAsignaciones("invalido");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_disponibilidad")
    .insert({
      id: crypto.randomUUID(),
      empresa_id: c.empresaId,
      profesional_id: pid,
      dia_semana: d,
      hora_inicio: i,
      hora_fin: f,
      estado: "activo",
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    });
  if (error) throw new ErrorAsignaciones("operacion");
}
export async function eliminarDisponibilidad(
  id: string,
  c: ContextoAutorizado,
) {
  if (!puede(c, "editar")) throw new ErrorAsignaciones("no_autorizado");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_disponibilidad")
    .delete()
    .eq("id", id)
    .eq("empresa_id", c.empresaId);
  if (error) throw new ErrorAsignaciones("operacion");
}
export async function editarDisponibilidad(
  id: string,
  d: number,
  i: string,
  f: string,
  estado: "activo" | "inactivo",
  c: ContextoAutorizado,
) {
  if (!puede(c, "editar")) throw new ErrorAsignaciones("no_autorizado");
  if (!valida(d, i, f)) throw new ErrorAsignaciones("invalido");
  const { data: existentes } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_disponibilidad")
    .select("id,hora_inicio,hora_fin")
    .eq("empresa_id", c.empresaId)
    .eq("dia_semana", d)
    .eq("estado", "activo")
    .neq("id", id);
  if (
    (existentes ?? []).some((x) =>
      seSolapan(i, f, String(x.hora_inicio), String(x.hora_fin)),
    )
  )
    throw new ErrorAsignaciones("invalido");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_disponibilidad")
    .update({
      dia_semana: d,
      hora_inicio: i,
      hora_fin: f,
      estado,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("empresa_id", c.empresaId);
  if (error) throw new ErrorAsignaciones("operacion");
}
export async function crearFranjaServicio(
  aid: string,
  d: number,
  i: string,
  f: string,
  c: ContextoAutorizado,
) {
  if (!puede(c, "crear")) throw new ErrorAsignaciones("no_autorizado");
  if (!valida(d, i, f)) throw new ErrorAsignaciones("invalido");
  const { data: asignacion } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_servicios")
    .select("id")
    .eq("id", aid)
    .eq("empresa_id", c.empresaId)
    .maybeSingle();
  if (!asignacion) throw new ErrorAsignaciones("invalido");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_servicios_franjas")
    .insert({
      id: crypto.randomUUID(),
      empresa_id: c.empresaId,
      profesional_servicio_id: aid,
      dia_semana: d,
      hora_inicio: i,
      hora_fin: f,
      estado: "activo",
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    });
  if (error) throw new ErrorAsignaciones("operacion");
}
export async function eliminarFranjaServicio(
  id: string,
  c: ContextoAutorizado,
) {
  if (!puede(c, "editar")) throw new ErrorAsignaciones("no_autorizado");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_servicios_franjas")
    .delete()
    .eq("id", id)
    .eq("empresa_id", c.empresaId);
  if (error) throw new ErrorAsignaciones("operacion");
}
export async function editarFranjaServicio(
  id: string,
  d: number,
  i: string,
  f: string,
  estado: "activo" | "inactivo",
  c: ContextoAutorizado,
) {
  if (!puede(c, "editar")) throw new ErrorAsignaciones("no_autorizado");
  if (!valida(d, i, f)) throw new ErrorAsignaciones("invalido");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_servicios_franjas")
    .update({
      dia_semana: d,
      hora_inicio: i,
      hora_fin: f,
      estado,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("empresa_id", c.empresaId);
  if (error) throw new ErrorAsignaciones("operacion");
}
