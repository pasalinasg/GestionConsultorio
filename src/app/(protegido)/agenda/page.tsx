import { redirect } from "next/navigation";
import { AplicacionShell } from "@/features/navegacion/aplicacion-shell";
import {
  obtenerContextoAutorizado,
  tienePermiso,
} from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { listarTurnos } from "@/features/agenda/servicio-agenda";
import { AgendaInterna } from "@/features/agenda/agenda-interna";
import { fechaActualParaguay } from "@/features/agenda/tiempo-paraguay";
export default async function AgendaPage() {
  const c = await obtenerContextoAutorizado(
    await crearClienteSupabaseServidor(),
  );
  if (!tienePermiso(c, "agenda", "visualizar")) redirect("/inicio");
  const turnos = await listarTurnos(c);
  return (
    <AplicacionShell seccionActiva="agenda">
      <main className="min-h-full bg-[var(--cream)] px-5 py-10 sm:px-8">
        <section className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">
            Gestión
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Agenda</h1>
          <p className="mt-2 text-slate-600">
            Consulta y administra los turnos de tu empresa.
          </p>
          <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-sm">
            <AgendaInterna
              turnos={turnos}
              hoy={fechaActualParaguay()}
              puedeCrear={tienePermiso(c, "agenda", "crear")}
              puedeEditar={tienePermiso(c, "agenda", "editar")}
            />
          </div>
        </section>
      </main>
    </AplicacionShell>
  );
}
