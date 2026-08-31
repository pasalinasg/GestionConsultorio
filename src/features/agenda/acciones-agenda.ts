"use server";
import { revalidatePath } from "next/cache";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { obtenerContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { cambiarEstadoTurno, crearTurno, ErrorAgenda } from "./servicio-agenda";
import type { EstadoTurno } from "./tipos-agenda";
export type EstadoAgendaAccion = { exito?: string; error?: string };
const contexto = async () => obtenerContextoAutorizado(await crearClienteSupabaseServidor());
export async function crearTurnoAccion(_: EstadoAgendaAccion, f: FormData) { try { await crearTurno({ pacienteDocumento: String(f.get("pacienteDocumento") ?? ""), nombreApellido: String(f.get("nombreApellido") ?? ""), telefono: String(f.get("telefono") ?? ""), sexo: String(f.get("sexo") ?? ""), profesionalServicioId: String(f.get("profesionalServicioId") ?? ""), inicio: String(f.get("inicio") ?? ""), fin: String(f.get("fin") ?? ""), modalidad: String(f.get("modalidad") ?? "") }, await contexto()); revalidatePath("/agenda"); return { exito: "Turno reservado correctamente. La reserva es válida por 30 minutos; recibirás confirmación por WhatsApp." }; } catch (e) { return { error: e instanceof ErrorAgenda && e.codigo === "no_autorizado" ? "No tienes acceso a la actividad: Crear agenda." : e instanceof ErrorAgenda && e.codigo === "existente" ? "Ese horario ya no está disponible." : "No fue posible crear el turno. Revisa los datos." }; } }
export async function cambiarEstadoTurnoAccion(_: EstadoAgendaAccion, f: FormData) { try { await cambiarEstadoTurno(String(f.get("id") ?? ""), String(f.get("estado") ?? "") as EstadoTurno, await contexto()); revalidatePath("/agenda"); return { exito: "Estado del turno actualizado." }; } catch (e) { return { error: e instanceof ErrorAgenda && e.codigo === "no_autorizado" ? "No tienes acceso a la actividad: Editar agenda." : "No fue posible actualizar el turno." }; } }
