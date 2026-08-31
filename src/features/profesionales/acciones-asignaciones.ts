"use server";
import { revalidatePath } from "next/cache";
import { obtenerContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { parsearImporte } from "@/lib/formato-presentacion";
import {
  crearAsignacion,
  editarAsignacion,
  eliminarAsignacion,
  crearDisponibilidad,
  editarDisponibilidad,
  eliminarDisponibilidad,
  crearFranjaServicio,
  editarFranjaServicio,
  eliminarFranjaServicio,
  ErrorAsignaciones,
} from "./servicio-asignaciones";
export type EstadoAsignacion = { exito?: string; error?: string };
const contexto = async () =>
  obtenerContextoAutorizado(await crearClienteSupabaseServidor());
const fallo = (e: unknown, a: string, g: string) =>
  e instanceof ErrorAsignaciones && e.codigo === "no_autorizado"
    ? `No tienes acceso a la actividad: ${a}.`
    : g;
export async function crearAsignacionAccion(_: EstadoAsignacion, f: FormData) {
  try {
    await crearAsignacion(
      String(f.get("profesionalId")),
      String(f.get("servicioId")),
      parsearImporte(String(f.get("precio"))),
      await contexto(),
    );
    revalidatePath("/profesionales");
    return { exito: "Servicio asignado correctamente." };
  } catch (e) {
    return {
      error: fallo(
        e,
        "Crear profesionales",
        "No fue posible asignar el servicio.",
      ),
    };
  }
}
export async function editarAsignacionAccion(_: EstadoAsignacion, f: FormData) {
  try {
    await editarAsignacion(
      String(f.get("id")),
      parsearImporte(String(f.get("precio"))),
      String(f.get("estado")) as "activo" | "inactivo",
      await contexto(),
    );
    revalidatePath("/profesionales");
    return { exito: "Asignación actualizada correctamente." };
  } catch (e) {
    return {
      error: fallo(
        e,
        "Editar profesionales",
        "No fue posible editar la asignación.",
      ),
    };
  }
}
export async function eliminarAsignacionAccion(
  _: EstadoAsignacion,
  f: FormData,
) {
  try {
    await eliminarAsignacion(String(f.get("id")), await contexto());
    revalidatePath("/profesionales");
    return { exito: "Asignación eliminada correctamente." };
  } catch (e) {
    return {
      error: fallo(
        e,
        "Eliminar profesionales",
        "No fue posible eliminar la asignación.",
      ),
    };
  }
}
export async function crearDisponibilidadAccion(
  _: EstadoAsignacion,
  f: FormData,
) {
  try {
    const ctx = await contexto();
    const dias = f.getAll("dias").map(String);
    if (!dias.length) return { error: "Selecciona al menos un día." };
    for (const dia of dias)
      await crearDisponibilidad(
        String(f.get("profesionalId")),
        Number(dia),
        String(f.get("inicio")),
        String(f.get("fin")),
        ctx,
      );
    revalidatePath("/profesionales");
    return { exito: "Disponibilidad agregada correctamente." };
  } catch (e) {
    return {
      error: fallo(
        e,
        "Crear profesionales",
        "No fue posible agregar la disponibilidad.",
      ),
    };
  }
}
export async function editarDisponibilidadAccion(
  _: EstadoAsignacion,
  f: FormData,
) {
  try {
    await editarDisponibilidad(
      String(f.get("id")),
      Number(f.get("dia")),
      String(f.get("inicio")),
      String(f.get("fin")),
      String(f.get("estado")) as "activo" | "inactivo",
      await contexto(),
    );
    revalidatePath("/profesionales");
    return { exito: "Disponibilidad actualizada correctamente." };
  } catch (e) {
    return {
      error: fallo(
        e,
        "Editar profesionales",
        "No fue posible editar la disponibilidad.",
      ),
    };
  }
}
export async function eliminarDisponibilidadAccion(
  _: EstadoAsignacion,
  f: FormData,
) {
  try {
    await eliminarDisponibilidad(String(f.get("id")), await contexto());
    revalidatePath("/profesionales");
    return { exito: "Franja eliminada correctamente." };
  } catch (e) {
    return {
      error: fallo(
        e,
        "Editar profesionales",
        "No fue posible eliminar la franja.",
      ),
    };
  }
}
export async function crearFranjaServicioAccion(
  _: EstadoAsignacion,
  f: FormData,
) {
  try {
    const ctx = await contexto();
    const dias = f.getAll("dias").map(String);
    if (!dias.length) return { error: "Selecciona al menos un día." };
    for (const dia of dias)
      await crearFranjaServicio(
        String(f.get("asignacionId")),
        Number(dia),
        String(f.get("inicio")),
        String(f.get("fin")),
        ctx,
      );
    revalidatePath("/profesionales");
    return { exito: "Franja del servicio agregada correctamente." };
  } catch (e) {
    return {
      error: fallo(
        e,
        "Editar profesionales",
        "No fue posible agregar la franja.",
      ),
    };
  }
}
export async function editarFranjaServicioAccion(
  _: EstadoAsignacion,
  f: FormData,
) {
  try {
    await editarFranjaServicio(
      String(f.get("id")),
      Number(f.get("dia")),
      String(f.get("inicio")),
      String(f.get("fin")),
      String(f.get("estado")) as "activo" | "inactivo",
      await contexto(),
    );
    revalidatePath("/profesionales");
    return { exito: "Franja actualizada correctamente." };
  } catch (e) {
    return {
      error: fallo(
        e,
        "Editar profesionales",
        "No fue posible editar la franja.",
      ),
    };
  }
}
export async function eliminarFranjaServicioAccion(
  _: EstadoAsignacion,
  f: FormData,
) {
  try {
    await eliminarFranjaServicio(String(f.get("id")), await contexto());
    revalidatePath("/profesionales");
    return { exito: "Franja eliminada correctamente." };
  } catch (e) {
    return {
      error: fallo(
        e,
        "Editar profesionales",
        "No fue posible eliminar la franja.",
      ),
    };
  }
}
