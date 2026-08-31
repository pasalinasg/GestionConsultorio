import { redirect } from "next/navigation";
import {
  obtenerContextoAutorizado,
  tienePermiso,
} from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { AplicacionShell } from "@/features/navegacion/aplicacion-shell";
import { listarProfesionales } from "@/features/profesionales/servicio-profesionales";
import { listarServicios } from "@/features/servicios/servicio-servicios";
import {
  listarAsignaciones,
  listarDisponibilidad,
} from "@/features/profesionales/servicio-asignaciones";
import { ListaProfesionales } from "@/features/profesionales/lista-profesionales";
export default async function ProfesionalesPage() {
  const contexto = await obtenerContextoAutorizado(
    await crearClienteSupabaseServidor(),
  );
  if (!tienePermiso(contexto, "profesionales", "visualizar"))
    redirect("/inicio");
  const profesionalesBase = await listarProfesionales(contexto);
  const servicios = await listarServicios(contexto);
  const profesionales = await Promise.all(
    profesionalesBase.map(async (p) => ({
      ...p,
      asignaciones: await listarAsignaciones(p.id, contexto),
      disponibilidad: await listarDisponibilidad(p.id, contexto),
    })),
  );
  return (
    <AplicacionShell seccionActiva="profesionales">
      <main className="min-h-full bg-[var(--cream)] px-5 py-10 sm:px-8">
        <section className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">
            GestiÃ³n
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Profesionales
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Administra los profesionales de tu empresa.
          </p>
          <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-sm">
            <ListaProfesionales
              profesionales={profesionales}
              servicios={servicios.filter((s) => s.estado === "activo")}
            />
          </div>
        </section>
      </main>
    </AplicacionShell>
  );
}
