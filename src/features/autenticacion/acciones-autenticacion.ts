"use server";

import { redirect } from "next/navigation";
import { crearCorreoIdentidadTecnica } from "@/features/empresas/servicio-alta-empresa";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { normalizarNombreUsuario } from "@/features/empresas/validacion-alta-empresa";

export type EstadoInicioSesion = { error?: string };

export async function iniciarSesionAccion(
  _estado: EstadoInicioSesion,
  formulario: FormData,
): Promise<EstadoInicioSesion> {
  const usuario = normalizarNombreUsuario(
    String(formulario.get("nombreUsuario") ?? ""),
  );
  const contrasena = String(formulario.get("contrasena") ?? "");
  if (!usuario || !contrasena)
    return { error: "Usuario o contraseña incorrectos." };
  const cliente = await crearClienteSupabaseServidor();
  const resultado = await cliente.auth.signInWithPassword({
    email: crearCorreoIdentidadTecnica(usuario),
    password: contrasena,
  });
  if (resultado.error) return { error: "Usuario o contraseña incorrectos." };
  redirect("/inicio");
}
