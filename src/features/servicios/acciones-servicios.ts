"use server";
import { revalidatePath } from "next/cache";
import { obtenerContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import {
  cambiarEstadoServicio,
  crearServicio,
  editarServicio,
  eliminarServicio,
  ErrorServicios,
} from "./servicio-servicios";
export type EstadoServicioAccion = { exito?: string; error?: string };
function datos(f: FormData) {
  return {
    nombre: String(f.get("nombre") ?? ""),
    descripcion: String(f.get("descripcion") ?? ""),
    modalidad: String(f.get("modalidad") ?? ""),
    duracion: String(f.get("duracion") ?? ""),
  };
}
export async function crearServicioAccion(
  _: EstadoServicioAccion,
  f: FormData,
) {
  try {
    const c = await crearClienteSupabaseServidor();
    await crearServicio(datos(f), await obtenerContextoAutorizado(c));
    revalidatePath("/servicios");
    return { exito: "Servicio creado correctamente." };
  } catch (e) {
    return {
      error:
        e instanceof ErrorServicios && e.codigo === "no_autorizado"
          ? "No tienes acceso a la actividad: Crear servicios."
          : "No fue posible crear el servicio.",
    };
  }
}
export async function editarServicioAccion(
  _: EstadoServicioAccion,
  f: FormData,
) {
  try {
    const c = await crearClienteSupabaseServidor();
    await editarServicio(
      String(f.get("id") ?? ""),
      datos(f),
      await obtenerContextoAutorizado(c),
    );
    revalidatePath("/servicios");
    return { exito: "Servicio actualizado." };
  } catch (e) {
    return {
      error:
        e instanceof ErrorServicios && e.codigo === "no_autorizado"
          ? "No tienes acceso a la actividad: Editar servicios."
          : "No fue posible editar el servicio.",
    };
  }
}
export async function eliminarServicioAccion(
  _: EstadoServicioAccion,
  f: FormData,
) {
  try {
    const c = await crearClienteSupabaseServidor();
    await eliminarServicio(
      String(f.get("id") ?? ""),
      await obtenerContextoAutorizado(c),
    );
    revalidatePath("/servicios");
    return { exito: "Servicio eliminado." };
  } catch (e) {
    return {
      error:
        e instanceof ErrorServicios && e.codigo === "no_autorizado"
          ? "No tienes acceso a la actividad: Eliminar servicios."
          : "No fue posible eliminar el servicio.",
    };
  }
}

export async function cambiarEstadoServicioAccion(
  _: EstadoServicioAccion,
  f: FormData,
) {
  try {
    const c = await crearClienteSupabaseServidor();
    await cambiarEstadoServicio(
      String(f.get("id") ?? ""),
      String(f.get("estado") ?? "inactivo") as "activo" | "inactivo",
      await obtenerContextoAutorizado(c),
    );
    revalidatePath("/servicios");
    return { exito: "Estado del servicio actualizado." };
  } catch (e) {
    return {
      error:
        e instanceof ErrorServicios && e.codigo === "no_autorizado"
          ? "No tienes acceso a la actividad: Editar servicios."
          : "No fue posible cambiar el estado del servicio.",
    };
  }
}
