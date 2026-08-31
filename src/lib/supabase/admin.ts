import "server-only";

import { createClient } from "@supabase/supabase-js";
import { obtenerConfiguracionSupabasePublica } from "./env";

function obtenerClaveAdministrativa() {
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!clave) {
    throw new Error("Falta la variable de entorno administrativa de Supabase.");
  }

  return clave;
}

/** Cliente exclusivo para servicios de servidor ya autorizados. */
export function crearClienteSupabaseAdministrativo() {
  const { url } = obtenerConfiguracionSupabasePublica();

  return createClient(url, obtenerClaveAdministrativa(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
