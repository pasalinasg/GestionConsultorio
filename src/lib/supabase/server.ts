import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { obtenerConfiguracionSupabasePublica } from "./env";

export async function crearClienteSupabaseServidor() {
  const almacenCookies = await cookies();
  const { url, clavePublicable } = obtenerConfiguracionSupabasePublica();

  return createServerClient(url, clavePublicable, {
    cookies: {
      getAll() {
        return almacenCookies.getAll();
      },
      setAll(cookiesParaGuardar) {
        try {
          cookiesParaGuardar.forEach(({ name, value, options }) => {
            almacenCookies.set(name, value, options);
          });
        } catch {
          // En Server Components no se pueden modificar cookies. Middleware o
          // Server Actions se ocuparán de refrescar sesiones cuando corresponda.
        }
      },
    },
  });
}
