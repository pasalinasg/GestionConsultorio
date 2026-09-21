"use server";
import { revalidatePath } from "next/cache";
import { obtenerContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import {
  crearProfesional,
  editarProfesional,
  cambiarEstadoProfesional,
  eliminarProfesional,
  ErrorProfesionales,
} from "./servicio-profesionales";
export type EstadoProfesional = { exito?: string; error?: string };
const datos = (f: FormData) =>
  [String(f.get("nombre") ?? ""), String(f.get("descripcion") ?? "")] as const;
export async function crearProfesionalAccion(
  _: EstadoProfesional,
  f: FormData,
) {
  try {
    await crearProfesional(
      ...datos(f),
      await obtenerContextoAutorizado(await crearClienteSupabaseServidor()),
    );
    revalidatePath("/profesionales");
    return { exito: "Profesional creado correctamente." };
  } catch (e) {
    return {
      error:
        e instanceof ErrorProfesionales && e.codigo === "no_autorizado"
          ? "No tienes acceso a la actividad: Crear profesionales."
          : "No fue posible crear el profesional.",
    };
  }
}
export async function editarProfesionalAccion(
  _: EstadoProfesional,
  f: FormData,
) {
  try {
    await editarProfesional(
      String(f.get("id")),
      ...datos(f),
      String(f.get("usuarioId") ?? ""),
      await obtenerContextoAutorizado(await crearClienteSupabaseServidor()),
    );
    revalidatePath("/profesionales");
    return { exito: "Profesional actualizado." };
  } catch (e) {
    return {
      error:
        e instanceof ErrorProfesionales && e.codigo === "no_autorizado"
          ? "No tienes acceso a la actividad: Editar profesionales."
          : "No fue posible editar el profesional.",
    };
  }
}
export async function cambiarEstadoProfesionalAccion(
  _: EstadoProfesional,
  f: FormData,
) {
  try {
    await cambiarEstadoProfesional(
      String(f.get("id")),
      String(f.get("estado")) as "activo" | "inactivo",
      await obtenerContextoAutorizado(await crearClienteSupabaseServidor()),
    );
    revalidatePath("/profesionales");
    return { exito: "Estado actualizado." };
  } catch (e) {
    return {
      error:
        e instanceof ErrorProfesionales && e.codigo === "no_autorizado"
          ? "No tienes acceso a la actividad: Editar profesionales."
          : "No fue posible cambiar el estado.",
    };
  }
}
export async function eliminarProfesionalAccion(
  _: EstadoProfesional,
  f: FormData,
) {
  try {
    await eliminarProfesional(
      String(f.get("id")),
      await obtenerContextoAutorizado(await crearClienteSupabaseServidor()),
    );
    revalidatePath("/profesionales");
    return { exito: "Profesional eliminado." };
  } catch (e) {
    return {
      error:
        e instanceof ErrorProfesionales && e.codigo === "no_autorizado"
          ? "No tienes acceso a la actividad: Eliminar profesionales."
          : "No fue posible eliminar el profesional.",
    };
  }
}
