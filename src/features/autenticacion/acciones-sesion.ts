"use server";

import { redirect } from "next/navigation";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";

export async function cerrarSesionAccion() {
  const cliente = await crearClienteSupabaseServidor();
  await cliente.auth.signOut();
  redirect("/iniciar-sesion");
}
