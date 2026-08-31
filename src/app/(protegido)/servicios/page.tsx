import { redirect } from "next/navigation";
import {
  obtenerContextoAutorizado,
  tienePermiso,
} from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { AplicacionShell } from "@/features/navegacion/aplicacion-shell";
import { listarServicios } from "@/features/servicios/servicio-servicios";
import { ListaServicios } from "@/features/servicios/lista-servicios";
export default async function ServiciosPage() {
  const c = await crearClienteSupabaseServidor();
  const contexto = await obtenerContextoAutorizado(c);
  if (!tienePermiso(contexto, "servicios", "visualizar")) redirect("/inicio");
  const servicios = await listarServicios(contexto);
  return (
    <AplicacionShell seccionActiva="servicios">
      <main className="min-h-full bg-[var(--cream)] px-5 py-10 sm:px-8">
        <section className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">
            GestiÃ³n
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Servicios
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Administra los servicios ofrecidos por tu empresa.
          </p>
          <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-sm">
            <ListaServicios servicios={servicios} />
          </div>
        </section>
      </main>
    </AplicacionShell>
  );
}
