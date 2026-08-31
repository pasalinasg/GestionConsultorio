"use server";

import { revalidatePath } from "next/cache";
import { obtenerContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { crearUsuarioInterno, ErrorUsuarios } from "./servicio-usuarios";

export type EstadoUsuarios = { exito?: string; error?: string };

export async function crearUsuarioAccion(
  _estado: EstadoUsuarios,
  formulario: FormData,
): Promise<EstadoUsuarios> {
  try {
    const clienteSesion = await crearClienteSupabaseServidor();
    const contexto = await obtenerContextoAutorizado(clienteSesion);
    await crearUsuarioInterno(
      {
        nombreUsuario: String(formulario.get("nombreUsuario") ?? ""),
        contrasena: String(formulario.get("contrasena") ?? ""),
        confirmacionContrasena: String(
          formulario.get("confirmacionContrasena") ?? "",
        ),
        permisos: formulario.getAll("permisos").map(Number),
      },
      contexto,
    );
    revalidatePath("/usuarios");
    return { exito: "Usuario creado correctamente." };
  } catch (error) {
    return {
      error:
        error instanceof ErrorUsuarios && error.codigo === "no_autorizado"
          ? "No tienes acceso a la actividad: Crear usuarios."
          : error instanceof ErrorUsuarios
            ? error.message
            : "No fue posible completar la operación.",
    };
  }
}
