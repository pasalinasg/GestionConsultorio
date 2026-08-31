import { createBrowserClient } from "@supabase/ssr";
import { obtenerConfiguracionSupabasePublica } from "./env";

export function crearClienteSupabaseNavegador() {
  const { url, clavePublicable } = obtenerConfiguracionSupabasePublica();

  return createBrowserClient(url, clavePublicable);
}
