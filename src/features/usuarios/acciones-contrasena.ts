"use server";

import { revalidatePath } from "next/cache";
import { obtenerContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import {
  ErrorContrasenas,
  restablecerContrasenaUsuario,
} from "./servicio-contrasenas";

export async function restablecerContrasenaAccion(
  _estado: unknown,
  formulario: FormData,
) {
  try {
    const contexto = await obtenerContextoAutorizado(
      await crearClienteSupabaseServidor(),
    );
    await restablecerContrasenaUsuario(
      String(formulario.get("usuarioId") ?? ""),
      String(formulario.get("nuevaContrasena") ?? ""),
      contexto,
    );
    revalidatePath("/usuarios");
    return { exito: "Contraseña restablecida." };
  } catch (error) {
    return {
      error:
        error instanceof ErrorContrasenas && error.codigo === "no_autorizado"
          ? "No tienes acceso a la actividad: Editar usuarios."
          : error instanceof ErrorContrasenas
            ? error.message
            : "No fue posible restablecer la contraseña.",
    };
  }
}
