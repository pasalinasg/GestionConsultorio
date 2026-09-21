import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import type { ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { obtenerProfesionalDelUsuario } from "@/features/profesionales/servicio-profesionales";
import type { EstadoTurno, TurnoListado } from "./tipos-agenda";
import { esFechaHoraPasadaParaguay } from "./tiempo-paraguay";

export class ErrorAgenda extends Error {
  constructor(
    readonly codigo: "no_autorizado" | "invalido" | "existente" | "operacion",
  ) {
    super("No fue posible completar la operación de agenda.");
  }
}

const puede = (c: ContextoAutorizado, accion: string) =>
  c.esPropietario || c.permisos.has(`agenda.${accion}`);
const puedeMiAgenda = (
  c: ContextoAutorizado,
  accion: "visualizar" | "editar",
) => c.esPropietario || c.permisos.has(`mi_agenda.${accion}`);

function mapearTurnos(data: Record<string, unknown>[]): TurnoListado[] {
  return data.map((registro) => {
    const paciente = Array.isArray(registro.paciente)
      ? registro.paciente[0]
      : registro.paciente;
    const profesional = Array.isArray(registro.profesionales)
      ? registro.profesionales[0]
      : registro.profesionales;
    const asignacion = Array.isArray(registro.profesionales_servicios)
      ? registro.profesionales_servicios[0]
      : registro.profesionales_servicios;
    const servicioAnidado = (asignacion as Record<string, unknown> | null)
      ?.servicios;
    const servicio = Array.isArray(servicioAnidado)
      ? servicioAnidado[0]
      : servicioAnidado;
    return {
      id: String(registro.id),
      paciente: String(
        (paciente as Record<string, unknown> | null)?.nombre_apellido ?? "",
      ),
      profesional: String(
        (profesional as Record<string, unknown> | null)?.nombre_completo ?? "",
      ),
      profesionalId: String(registro.profesional_id),
      servicio: String(
        (servicio as Record<string, unknown> | null)?.nombre ?? "",
      ),
      profesionalServicioId: String(registro.profesional_servicio_id),
      inicio: String(registro.inicio),
      fin: String(registro.fin),
      modalidad: registro.modalidad as "presencial" | "online",
      estado: registro.estado as EstadoTurno,
      origen: registro.origen as "interno" | "publico",
      precioGs: Number(registro.precio_gs),
    };
  });
}

async function consultarTurnos(
  empresaId: string,
  profesionalId?: string,
  desde?: string,
  hasta?: string,
) {
  const consulta = crearClienteSupabaseAdministrativo()
    .from("agenda_turnos")
    .select(
      "id,profesional_id,profesional_servicio_id,inicio,fin,modalidad,estado,origen,precio_gs,paciente(nombre_apellido),profesionales(nombre_completo),profesionales_servicios(servicios(nombre))",
    )
    .eq("empresa_id", empresaId)
    .order("inicio");
  if (profesionalId) consulta.eq("profesional_id", profesionalId);
  if (desde) consulta.gte("inicio", desde);
  if (hasta) consulta.lt("inicio", hasta);
  const { data, error } = await consulta;
  if (error) throw new ErrorAgenda("operacion");
  return mapearTurnos((data ?? []) as Record<string, unknown>[]);
}

export async function listarTurnos(
  c: ContextoAutorizado,
  desde?: string,
  hasta?: string,
) {
  if (!puede(c, "visualizar")) throw new ErrorAgenda("no_autorizado");
  return consultarTurnos(c.empresaId, undefined, desde, hasta);
}

async function profesionalPropio(c: ContextoAutorizado) {
  const profesional = await obtenerProfesionalDelUsuario(c);
  if (!profesional) throw new ErrorAgenda("no_autorizado");
  return profesional;
}

export async function listarMisTurnos(
  c: ContextoAutorizado,
  desde?: string,
  hasta?: string,
) {
  if (!puedeMiAgenda(c, "visualizar")) throw new ErrorAgenda("no_autorizado");
  const profesional = await profesionalPropio(c);
  return consultarTurnos(c.empresaId, profesional.id, desde, hasta);
}

export async function crearTurno(
  entrada: {
    pacienteDocumento: string;
    nombreApellido?: string;
    telefono?: string;
    sexo?: string;
    profesionalServicioId: string;
    inicio: string;
    fin: string;
    modalidad: string;
  },
  c: ContextoAutorizado,
) {
  const puedeCrearAgenda = puede(c, "crear");
  if (!puedeCrearAgenda && !puedeMiAgenda(c, "visualizar"))
    throw new ErrorAgenda("no_autorizado");
  const profesionalRestringida = puedeCrearAgenda
    ? null
    : await profesionalPropio(c);
  if (esFechaHoraPasadaParaguay(entrada.inicio))
    throw new ErrorAgenda("invalido");
  const db = crearClienteSupabaseAdministrativo();
  let pacienteId: number | string | null =
    (
      await db
        .from("paciente")
        .select("paciente_id")
        .eq("empresa_id", c.empresaId)
        .eq("documento", entrada.pacienteDocumento.trim())
        .maybeSingle()
    ).data?.paciente_id ?? null;
  if (
    !pacienteId &&
    entrada.nombreApellido &&
    entrada.telefono &&
    entrada.sexo
  ) {
    const nuevo = await db
      .from("paciente")
      .insert({
        empresa_id: c.empresaId,
        nombre_apellido: entrada.nombreApellido.trim(),
        documento: entrada.pacienteDocumento.trim(),
        telefono: entrada.telefono.trim(),
        sexo: entrada.sexo.trim().toLowerCase(),
        estado: "prospecto",
      })
      .select("paciente_id")
      .single();
    if (nuevo.error) throw new ErrorAgenda("operacion");
    pacienteId = nuevo.data.paciente_id;
  }
  if (!pacienteId) throw new ErrorAgenda("invalido");
  const asignacion = await db
    .from("profesionales_servicios")
    .select("id,precio,profesional_id,servicios(modalidad)")
    .eq("id", entrada.profesionalServicioId)
    .eq("empresa_id", c.empresaId)
    .eq("estado", "activo")
    .maybeSingle();
  if (!asignacion.data) throw new ErrorAgenda("invalido");
  if (
    profesionalRestringida &&
    asignacion.data.profesional_id !== profesionalRestringida.id
  )
    throw new ErrorAgenda("no_autorizado");
  const modalidad = String(entrada.modalidad);
  if (
    !["presencial", "online"].includes(modalidad) ||
    entrada.inicio >= entrada.fin
  )
    throw new ErrorAgenda("invalido");
  const conflicto = await db
    .from("agenda_turnos")
    .select("id")
    .eq("empresa_id", c.empresaId)
    .eq("profesional_id", asignacion.data.profesional_id)
    .in("estado", ["pendiente", "confirmada", "atendida"])
    .lt("inicio", entrada.fin)
    .gt("fin", entrada.inicio)
    .maybeSingle();
  if (conflicto.data) throw new ErrorAgenda("existente");
  const { error } = await db
    .from("agenda_turnos")
    .insert({
      id: crypto.randomUUID(),
      empresa_id: c.empresaId,
      paciente_id: pacienteId,
      profesional_id: asignacion.data.profesional_id,
      profesional_servicio_id: entrada.profesionalServicioId,
      inicio: entrada.inicio,
      fin: entrada.fin,
      modalidad,
      estado: "pendiente",
      origen: "interno",
      precio_gs: Number(asignacion.data.precio),
      creado_por: c.usuarioId,
    });
  if (error) throw new ErrorAgenda("operacion");
}

const estados = [
  "pendiente",
  "confirmada",
  "rechazada",
  "vencida",
  "cancelada",
  "atendida",
  "no_asistio",
];

export async function cambiarEstadoTurno(
  id: string,
  estado: EstadoTurno,
  c: ContextoAutorizado,
) {
  if (!puede(c, "editar")) throw new ErrorAgenda("no_autorizado");
  if (!estados.includes(estado)) throw new ErrorAgenda("invalido");
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("agenda_turnos")
    .update({ estado, actualizado_en: new Date().toISOString() })
    .eq("id", id)
    .eq("empresa_id", c.empresaId);
  if (error) throw new ErrorAgenda("operacion");
}

export async function cambiarEstadoMiTurno(
  id: string,
  estado: EstadoTurno,
  c: ContextoAutorizado,
) {
  if (!puedeMiAgenda(c, "editar")) throw new ErrorAgenda("no_autorizado");
  if (!estados.includes(estado)) throw new ErrorAgenda("invalido");
  const profesional = await profesionalPropio(c);
  const { error } = await crearClienteSupabaseAdministrativo()
    .from("agenda_turnos")
    .update({ estado, actualizado_en: new Date().toISOString() })
    .eq("id", id)
    .eq("empresa_id", c.empresaId)
    .eq("profesional_id", profesional.id);
  if (error) throw new ErrorAgenda("operacion");
}
