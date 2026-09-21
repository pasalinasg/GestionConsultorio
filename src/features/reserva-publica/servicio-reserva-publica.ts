import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import { esFechaHoraPasadaParaguay } from "@/features/agenda/tiempo-paraguay";

export class ErrorReservaPublica extends Error {
  constructor(readonly codigo: "invalida" | "no_disponible" | "operacion") {
    super("No fue posible completar la reserva.");
  }
}

type ServicioPublico = {
  id: string;
  nombre: string;
  descripcion: string | null;
  modalidad: "presencial" | "online";
  duracion: number;
  precio: number;
};
type FranjaPublica = {
  asignacionId: string;
  dia: number;
  inicio: string;
  fin: string;
};
type Ocupacion = { inicio: string; fin: string; estado: string };

function sumarMinutos(fechaHora: string, minutos: number) {
  const fecha = new Date(fechaHora);
  fecha.setMinutes(fecha.getMinutes() + minutos);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}T${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`;
}

function normalizarDocumento(valor: string) {
  return valor.replace(/\D/g, "");
}
function normalizarTelefono(valor: string) {
  return valor.replace(/[^\d+]/g, "");
}
function minutosHora(valor: string) {
  return Number(valor.slice(0, 2)) * 60 + Number(valor.slice(3, 5));
}

export async function buscarPacienteReservaPublica(
  documentoEntrada: string,
  profesionalId: string,
) {
  const documento = normalizarDocumento(documentoEntrada);
  if (documento.length < 5) throw new ErrorReservaPublica("invalida");
  const db = crearClienteSupabaseAdministrativo();
  const { data: profesional, error: errorProfesional } = await db
    .from("profesionales")
    .select("empresa_id")
    .eq("id", profesionalId)
    .eq("estado", "activo")
    .maybeSingle();
  if (errorProfesional || !profesional)
    throw new ErrorReservaPublica("operacion");
  const { data, error } = await db
    .from("paciente")
    .select("nombre_apellido")
    .eq("empresa_id", profesional.empresa_id)
    .eq("documento", documento)
    .maybeSingle();
  if (error) throw new ErrorReservaPublica("operacion");
  return data ? { nombre: String(data.nombre_apellido) } : null;
}

export async function obtenerDatosReservaPublica(profesionalId: string) {
  const db = crearClienteSupabaseAdministrativo();
  const { data: profesional, error: errorProfesional } = await db
    .from("profesionales")
    .select("id,empresa_id,nombre_completo,descripcion")
    .eq("id", profesionalId)
    .eq("estado", "activo")
    .maybeSingle();
  if (errorProfesional) throw new ErrorReservaPublica("operacion");
  if (!profesional) return null;
  const [asignacionesResultado, ocupacionesResultado] = await Promise.all([
    db
      .from("profesionales_servicios")
      .select(
        "id,precio,servicios(nombre,descripcion,modalidad,duracion_minutos,estado),profesionales_servicios_franjas(id,profesional_servicio_id,dia_semana,hora_inicio,hora_fin,estado)",
      )
      .eq("empresa_id", profesional.empresa_id)
      .eq("profesional_id", profesional.id)
      .eq("estado", "activo"),
    db
      .from("agenda_turnos")
      .select("inicio,fin,estado")
      .eq("empresa_id", profesional.empresa_id)
      .eq("profesional_id", profesional.id)
      .in("estado", ["pendiente", "confirmada", "atendida"])
      .gte("inicio", new Date().toISOString().slice(0, 10)),
  ]);
  if (asignacionesResultado.error || ocupacionesResultado.error)
    throw new ErrorReservaPublica("operacion");
  const servicios: ServicioPublico[] = [];
  const franjas: FranjaPublica[] = [];
  for (const asignacion of (asignacionesResultado.data ?? []) as Array<
    Record<string, unknown>
  >) {
    const servicioAnidado = Array.isArray(asignacion.servicios)
      ? asignacion.servicios[0]
      : asignacion.servicios;
    const servicio = servicioAnidado as Record<string, unknown> | null;
    if (!servicio || servicio.estado !== "activo") continue;
    servicios.push({
      id: String(asignacion.id),
      nombre: String(servicio.nombre),
      descripcion: servicio.descripcion ? String(servicio.descripcion) : null,
      modalidad: String(servicio.modalidad) as "presencial" | "online",
      duracion: Number(servicio.duracion_minutos),
      precio: Number(asignacion.precio),
    });
    const franjasAnidadas = Array.isArray(
      asignacion.profesionales_servicios_franjas,
    )
      ? asignacion.profesionales_servicios_franjas
      : [];
    for (const franja of franjasAnidadas as Array<Record<string, unknown>>)
      if (franja.estado === "activo")
        franjas.push({
          asignacionId: String(asignacion.id),
          dia: Number(franja.dia_semana),
          inicio: String(franja.hora_inicio).slice(0, 5),
          fin: String(franja.hora_fin).slice(0, 5),
        });
  }
  return {
    profesional: {
      id: String(profesional.id),
      nombre: String(profesional.nombre_completo),
      descripcion: profesional.descripcion
        ? String(profesional.descripcion)
        : null,
    },
    servicios,
    franjas,
    ocupaciones: (ocupacionesResultado.data ?? []) as Ocupacion[],
  };
}

export async function crearReservaPublica(entrada: {
  profesionalId: string;
  asignacionId: string;
  documento: string;
  nombre: string;
  telefono: string;
  sexo: string;
  inicio: string;
}) {
  const documento = normalizarDocumento(entrada.documento);
  const telefono = normalizarTelefono(entrada.telefono);
  if (documento.length < 5 || esFechaHoraPasadaParaguay(entrada.inicio))
    throw new ErrorReservaPublica("invalida");
  const db = crearClienteSupabaseAdministrativo();
  const { data: profesional, error: errorProfesional } = await db
    .from("profesionales")
    .select("id,empresa_id")
    .eq("id", entrada.profesionalId)
    .eq("estado", "activo")
    .maybeSingle();
  if (errorProfesional) throw new ErrorReservaPublica("operacion");
  if (!profesional) throw new ErrorReservaPublica("no_disponible");
  const { data: asignacion, error: errorAsignacion } = await db
    .from("profesionales_servicios")
    .select(
      "id,precio,profesional_id,servicios(modalidad,duracion_minutos,estado),profesionales_servicios_franjas(dia_semana,hora_inicio,hora_fin,estado)",
    )
    .eq("id", entrada.asignacionId)
    .eq("empresa_id", profesional.empresa_id)
    .eq("profesional_id", profesional.id)
    .eq("estado", "activo")
    .maybeSingle();
  if (errorAsignacion) throw new ErrorReservaPublica("operacion");
  const servicioAnidado = Array.isArray(asignacion?.servicios)
    ? asignacion?.servicios[0]
    : asignacion?.servicios;
  const servicio = servicioAnidado as Record<string, unknown> | null;
  if (!asignacion || !servicio || servicio.estado !== "activo")
    throw new ErrorReservaPublica("no_disponible");
  const fin = sumarMinutos(entrada.inicio, Number(servicio.duracion_minutos));
  const fechaEntrada = new Date(`${entrada.inicio}:00`);
  const dia = fechaEntrada.getDay() || 7;
  const horaInicio = minutosHora(entrada.inicio.slice(11, 16));
  const horaFin =
    minutosHora(fin.slice(11, 16)) +
    (fin.slice(0, 10) !== entrada.inicio.slice(0, 10) ? 24 * 60 : 0);
  const franjaValida = (
    Array.isArray(asignacion.profesionales_servicios_franjas)
      ? asignacion.profesionales_servicios_franjas
      : []
  ).some(
    (franja: Record<string, unknown>) =>
      franja.estado === "activo" &&
      Number(franja.dia_semana) === dia &&
      horaInicio >= minutosHora(String(franja.hora_inicio)) &&
      horaFin <= minutosHora(String(franja.hora_fin)) &&
      (horaInicio - minutosHora(String(franja.hora_inicio))) %
        Number(servicio.duracion_minutos) ===
        0,
  );
  if (!franjaValida) throw new ErrorReservaPublica("no_disponible");
  const { data: conflicto, error: errorConflicto } = await db
    .from("agenda_turnos")
    .select("id")
    .eq("empresa_id", profesional.empresa_id)
    .eq("profesional_id", profesional.id)
    .in("estado", ["pendiente", "confirmada", "atendida"])
    .lt("inicio", fin)
    .gt("fin", entrada.inicio)
    .maybeSingle();
  if (errorConflicto) throw new ErrorReservaPublica("operacion");
  if (conflicto) throw new ErrorReservaPublica("no_disponible");
  const pacienteExistente = await db
    .from("paciente")
    .select("paciente_id")
    .eq("empresa_id", profesional.empresa_id)
    .eq("documento", documento)
    .maybeSingle();
  if (pacienteExistente.error) throw new ErrorReservaPublica("operacion");
  let pacienteId = pacienteExistente.data?.paciente_id ?? null;
  if (!pacienteId) {
    if (
      entrada.nombre.trim().length < 2 ||
      telefono.replace(/\D/g, "").length < 7 ||
      !["femenino", "masculino", "otro"].includes(entrada.sexo)
    )
      throw new ErrorReservaPublica("invalida");
    const { data: paciente, error: errorPaciente } = await db
      .from("paciente")
      .insert({
        empresa_id: profesional.empresa_id,
        nombre_apellido: entrada.nombre.trim(),
        documento,
        telefono,
        sexo: entrada.sexo,
        estado: "prospecto",
      })
      .select("paciente_id")
      .single();
    if (errorPaciente || !paciente) throw new ErrorReservaPublica("operacion");
    pacienteId = paciente.paciente_id;
  }
  const { error } = await db
    .from("agenda_turnos")
    .insert({
      id: crypto.randomUUID(),
      empresa_id: profesional.empresa_id,
      paciente_id: pacienteId,
      profesional_id: profesional.id,
      profesional_servicio_id: asignacion.id,
      inicio: entrada.inicio,
      fin,
      modalidad: String(servicio.modalidad),
      estado: "pendiente",
      origen: "publico",
      precio_gs: Number(asignacion.precio),
      creado_por: null,
    });
  if (error) throw new ErrorReservaPublica("operacion");
}
