"use server";

import { revalidatePath } from "next/cache";
import { obtenerContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import {
  cambiarEstadoUsuario,
  ErrorEstadoUsuario,
} from "./servicio-estado-usuario";

export async function cambiarEstadoUsuarioAccion(
  _estado: unknown,
  formulario: FormData,
) {
  try {
    const contexto = await obtenerContextoAutorizado(
      await crearClienteSupabaseServidor(),
    );
    await cambiarEstadoUsuario(
      String(formulario.get("usuarioId") ?? ""),
      String(formulario.get("estado") ?? "inactivo") as "activo" | "inactivo",
      contexto,
    );
    revalidatePath("/usuarios");
    return { exito: "Estado actualizado." };
  } catch (error) {
    return {
      error:
        error instanceof ErrorEstadoUsuario && error.codigo === "no_autorizado"
          ? "No tienes acceso a la actividad: Editar usuarios."
          : error instanceof ErrorEstadoUsuario
            ? error.message
            : "No fue posible cambiar el estado.",
    };
  }
}
