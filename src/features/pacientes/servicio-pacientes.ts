import type { ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import type { EntradaPaciente, EstadoPaciente, PacienteListado } from "./tipos-pacientes";
import { validarPaciente } from "./validacion-pacientes";

export class ErrorPacientes extends Error {
  constructor(readonly codigo: "no_autorizado" | "invalido" | "existente" | "no_encontrado" | "operacion", readonly detalle?: string) {
    super(detalle ?? "No fue posible completar la operación de pacientes.");
  }
}

function puede(contexto: ContextoAutorizado, accion: string) {
  return contexto.esPropietario || contexto.permisos.has(`pacientes.${accion}`);
}

export async function listarPacientes(contexto: ContextoAutorizado): Promise<PacienteListado[]> {
  const { data, error } = await crearClienteSupabaseAdministrativo()
    .from("paciente")
    .select("paciente_id, nombre_apellido, documento, telefono, sexo, estado, created_at")
    .eq("empresa_id", contexto.empresaId)
    .order("nombre_apellido");
  if (error) throw new ErrorPacientes("operacion");
  return ((data ?? []) as Array<Record<string, unknown>>).map((item) => ({
    id: String(item.paciente_id),
    nombreApellido: String(item.nombre_apellido ?? ""),
    documento: String(item.documento ?? ""),
    telefono: String(item.telefono ?? ""),
    sexo: String(item.sexo ?? ""),
    estado: (String(item.estado ?? "prospecto").trim().toLowerCase() as EstadoPaciente),
    creadoEn: String(item.created_at ?? ""),
  }));
}

export async function crearPaciente(entrada: EntradaPaciente, contexto: ContextoAutorizado) {
  if (!puede(contexto, "crear")) throw new ErrorPacientes("no_autorizado");
  const validacion = validarPaciente(entrada);
  if (!validacion.valido) throw new ErrorPacientes("invalido", Object.values(validacion.errores).join(" "));
  const c = crearClienteSupabaseAdministrativo();
  const existente = await c.from("paciente").select("paciente_id, estado").eq("empresa_id", contexto.empresaId).eq("documento", validacion.datos.documento).maybeSingle();
  if (existente.error) throw new ErrorPacientes("operacion");
  if (existente.data) {
    if (String((existente.data as Record<string, unknown>).estado) === "inactivo") {
      const { error } = await c.from("paciente").update({ ...validacion.datos, estado: "activo" }).eq("paciente_id", (existente.data as Record<string, unknown>).paciente_id).eq("empresa_id", contexto.empresaId);
      if (error) throw new ErrorPacientes("operacion");
      return "reactivado" as const;
    }
    throw new ErrorPacientes("existente");
  }
  const { error } = await c.from("paciente").insert({ empresa_id: contexto.empresaId, nombre_apellido: validacion.datos.nombreApellido, documento: validacion.datos.documento, telefono: validacion.datos.telefono, sexo: validacion.datos.sexo, estado: "prospecto" });
  if (error) throw new ErrorPacientes("operacion");
  return "creado" as const;
}

export async function editarPaciente(id: string, entrada: EntradaPaciente, contexto: ContextoAutorizado) {
  if (!puede(contexto, "editar")) throw new ErrorPacientes("no_autorizado");
  const validacion = validarPaciente(entrada);
  if (!validacion.valido) throw new ErrorPacientes("invalido", Object.values(validacion.errores).join(" "));
  const c = crearClienteSupabaseAdministrativo();
  const { error } = await c.from("paciente").update({ nombre_apellido: validacion.datos.nombreApellido, documento: validacion.datos.documento, telefono: validacion.datos.telefono, sexo: validacion.datos.sexo }).eq("paciente_id", id).eq("empresa_id", contexto.empresaId);
  if (error) throw new ErrorPacientes(error.code === "23505" ? "existente" : "operacion");
}

export async function cambiarEstadoPaciente(id: string, estado: EstadoPaciente, contexto: ContextoAutorizado) {
  if (!puede(contexto, "editar")) throw new ErrorPacientes("no_autorizado");
  if (!["prospecto", "activo", "inactivo"].includes(estado)) throw new ErrorPacientes("invalido");
  const { error } = await crearClienteSupabaseAdministrativo().from("paciente").update({ estado }).eq("paciente_id", id).eq("empresa_id", contexto.empresaId);
  if (error) throw new ErrorPacientes("operacion");
}

export async function eliminarPaciente(id: string, contexto: ContextoAutorizado) {
  if (!puede(contexto, "eliminar")) throw new ErrorPacientes("no_autorizado");
  const { error } = await crearClienteSupabaseAdministrativo().from("paciente").delete().eq("paciente_id", id).eq("empresa_id", contexto.empresaId);
  if (error) throw new ErrorPacientes("operacion");
}
