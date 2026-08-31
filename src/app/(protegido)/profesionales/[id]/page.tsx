import { notFound, redirect } from "next/navigation";
import { AplicacionShell } from "@/features/navegacion/aplicacion-shell";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import {
  obtenerContextoAutorizado,
  tienePermiso,
} from "@/features/autenticacion/servicio-autorizacion";
import { listarProfesionales } from "@/features/profesionales/servicio-profesionales";
import { listarServicios } from "@/features/servicios/servicio-servicios";
import {
  listarAsignaciones,
  listarDisponibilidad,
} from "@/features/profesionales/servicio-asignaciones";
import { DetalleProfesional } from "@/features/profesionales/detalle-profesional";
export default async function DetalleProfesionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const contexto = await obtenerContextoAutorizado(
    await crearClienteSupabaseServidor(),
  );
  if (!tienePermiso(contexto, "profesionales", "visualizar"))
    redirect("/inicio");
  const { id } = await params;
  const profesionalBase = (await listarProfesionales(contexto)).find(
    (p) => p.id === id,
  );
  if (!profesionalBase) notFound();
  const [servicios, asignaciones, disponibilidad] = await Promise.all([
    listarServicios(contexto),
    listarAsignaciones(id, contexto),
    listarDisponibilidad(id, contexto),
  ]);
  return (
    <AplicacionShell seccionActiva="profesionales">
      <main className="min-h-full bg-[var(--cream)] px-5 py-10 sm:px-8">
        <section className="mx-auto max-w-6xl">
          <DetalleProfesional
            profesional={{ ...profesionalBase, asignaciones, disponibilidad }}
            servicios={servicios.filter((s) => s.estado === "activo")}
          />
        </section>
      </main>
    </AplicacionShell>
  );
}
