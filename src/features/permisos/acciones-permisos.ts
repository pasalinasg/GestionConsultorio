"use server";

import { revalidatePath } from "next/cache";
import { obtenerContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { reemplazarPermisosUsuario, ErrorPermisos } from "./servicio-permisos";

export async function reemplazarPermisosAccion(
  _estado: unknown,
  formulario: FormData,
) {
  try {
    const contexto = await obtenerContextoAutorizado(
      await crearClienteSupabaseServidor(),
    );
    await reemplazarPermisosUsuario(
      String(formulario.get("usuarioId") ?? ""),
      formulario.getAll("permisos").map(Number),
      contexto,
    );
    revalidatePath("/usuarios");
    return { exito: "Permisos actualizados." };
  } catch (error) {
    return {
      error:
        error instanceof ErrorPermisos && error.codigo === "no_autorizado"
          ? "No tienes acceso a la actividad: Editar usuarios."
          : process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : error instanceof ErrorPermisos
              ? error.message
              : "No fue posible modificar los permisos.",
    };
  }
}
