import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import type { ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import type { EstadoTurno, TurnoListado } from "./tipos-agenda";
export class ErrorAgenda extends Error { constructor(readonly codigo: "no_autorizado" | "invalido" | "existente" | "operacion") { super("No fue posible completar la operación de agenda."); } }
const puede = (c: ContextoAutorizado, a: string) => c.esPropietario || c.permisos.has(`agenda.${a}`);
export async function listarTurnos(c: ContextoAutorizado, desde?: string, hasta?: string): Promise<TurnoListado[]> {
  if (!puede(c, "visualizar")) throw new ErrorAgenda("no_autorizado"); const db = crearClienteSupabaseAdministrativo();
  const q = db.from("agenda_turnos").select("id,profesional_id,profesional_servicio_id,inicio,fin,modalidad,estado,origen,precio_gs,paciente(nombre_apellido),profesionales(nombre_completo),profesionales_servicios(servicios(nombre))").eq("empresa_id", c.empresaId).order("inicio");
  if (desde) q.gte("inicio", desde); if (hasta) q.lt("inicio", hasta); const { data, error } = await q; if (error) throw new ErrorAgenda("operacion");
  return (data ?? []).map((r: Record<string, unknown>) => { const p = Array.isArray(r.paciente) ? r.paciente[0] : r.paciente; const prof = Array.isArray(r.profesionales) ? r.profesionales[0] : r.profesionales; const ps = Array.isArray(r.profesionales_servicios) ? r.profesionales_servicios[0] : r.profesionales_servicios; const s = Array.isArray((ps as Record<string, unknown> | null)?.servicios) ? ((ps as Record<string, unknown>).servicios as Array<Record<string, unknown>>)[0] : (ps as Record<string, unknown> | null)?.servicios; return { id: String(r.id), paciente: String((p as Record<string, unknown> | null)?.nombre_apellido ?? ""), profesional: String((prof as Record<string, unknown> | null)?.nombre_completo ?? ""), profesionalId: String(r.profesional_id), servicio: String((s as Record<string, unknown> | null)?.nombre ?? ""), profesionalServicioId: String(r.profesional_servicio_id), inicio: String(r.inicio), fin: String(r.fin), modalidad: r.modalidad as "presencial" | "online", estado: r.estado as EstadoTurno, origen: r.origen as "interno" | "publico", precioGs: Number(r.precio_gs) }; });
}
export async function crearTurno(entrada: { pacienteDocumento: string; nombreApellido?: string; telefono?: string; sexo?: string; profesionalServicioId: string; inicio: string; fin: string; modalidad: string }, c: ContextoAutorizado) {
  if (!puede(c, "crear")) throw new ErrorAgenda("no_autorizado"); const db = crearClienteSupabaseAdministrativo();
  let pacienteId: number | string | null = (await db.from("paciente").select("paciente_id").eq("empresa_id", c.empresaId).eq("documento", entrada.pacienteDocumento.trim()).maybeSingle()).data?.paciente_id ?? null;
  if (!pacienteId && entrada.nombreApellido && entrada.telefono && entrada.sexo) {
    const nuevo = await db.from("paciente").insert({ empresa_id: c.empresaId, nombre_apellido: entrada.nombreApellido.trim(), documento: entrada.pacienteDocumento.trim(), telefono: entrada.telefono.trim(), sexo: entrada.sexo.trim().toLowerCase(), estado: "prospecto" }).select("paciente_id").single();
    if (nuevo.error) throw new ErrorAgenda("operacion");
    pacienteId = nuevo.data.paciente_id;
  }
  if (!pacienteId) throw new ErrorAgenda("invalido");
  const asignacion = await db.from("profesionales_servicios").select("id,precio,profesional_id,servicios(modalidad)").eq("id", entrada.profesionalServicioId).eq("empresa_id", c.empresaId).eq("estado", "activo").maybeSingle(); if (!asignacion.data) throw new ErrorAgenda("invalido");
  const modalidad = String(entrada.modalidad); if (!["presencial", "online"].includes(modalidad) || new Date(entrada.inicio) >= new Date(entrada.fin)) throw new ErrorAgenda("invalido");
  const conflicto = await db.from("agenda_turnos").select("id").eq("empresa_id", c.empresaId).eq("profesional_id", asignacion.data.profesional_id).in("estado", ["pendiente", "confirmada", "atendida"]).lt("inicio", entrada.fin).gt("fin", entrada.inicio).maybeSingle(); if (conflicto.data) throw new ErrorAgenda("existente");
  const { error } = await db.from("agenda_turnos").insert({ id: crypto.randomUUID(), empresa_id: c.empresaId, paciente_id: pacienteId, profesional_id: asignacion.data.profesional_id, profesional_servicio_id: entrada.profesionalServicioId, inicio: entrada.inicio, fin: entrada.fin, modalidad, estado: "pendiente", origen: "interno", precio_gs: Number(asignacion.data.precio), creado_por: c.usuarioId }); if (error) throw new ErrorAgenda("operacion");
}

export async function cambiarEstadoTurno(id: string, estado: EstadoTurno, c: ContextoAutorizado) {
  if (!puede(c, "editar")) throw new ErrorAgenda("no_autorizado");
  if (!["pendiente", "confirmada", "rechazada", "vencida", "cancelada", "atendida", "no_asistio"].includes(estado)) throw new ErrorAgenda("invalido");
  const { error } = await crearClienteSupabaseAdministrativo().from("agenda_turnos").update({ estado, actualizado_en: new Date().toISOString() }).eq("id", id).eq("empresa_id", c.empresaId);
  if (error) throw new ErrorAgenda("operacion");
}
