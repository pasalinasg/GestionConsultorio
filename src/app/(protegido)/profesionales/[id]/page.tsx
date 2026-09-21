import { notFound, redirect } from "next/navigation";
import { AplicacionShell } from "@/features/navegacion/aplicacion-shell";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
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
  const profesionales = await listarProfesionales(contexto);
  const profesionalBase = profesionales.find(
    (p) => p.id === id,
  );
  if (!profesionalBase) notFound();
  const [servicios, asignaciones, disponibilidad, usuariosResultado] = await Promise.all([
    listarServicios(contexto),
    listarAsignaciones(id, contexto),
    listarDisponibilidad(id, contexto),
    crearClienteSupabaseAdministrativo().from("usuarios").select("id,nombre_usuario").eq("empresa_id", contexto.empresaId).eq("estado", "activo").order("nombre_usuario"),
  ]);
  const usuarios = (usuariosResultado.data ?? []).map((usuario: Record<string, unknown>) => ({ id: String(usuario.id), nombreUsuario: String(usuario.nombre_usuario) })).filter((usuario) => !profesionales.some((profesional) => profesional.usuario_id === usuario.id && profesional.id !== id));
  return (
    <AplicacionShell seccionActiva="profesionales">
      <main className="min-h-full bg-[var(--cream)] px-5 py-10 sm:px-8">
        <section className="mx-auto max-w-6xl">
          <DetalleProfesional
            profesional={{ ...profesionalBase, asignaciones, disponibilidad }}
            servicios={servicios.filter((s) => s.estado === "activo")}
            usuarios={usuarios}
          />
        </section>
      </main>
    </AplicacionShell>
  );
}
