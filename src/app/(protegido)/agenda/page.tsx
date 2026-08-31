import { redirect } from "next/navigation";
import { AplicacionShell } from "@/features/navegacion/aplicacion-shell";
import {
  obtenerContextoAutorizado,
  tienePermiso,
} from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import { listarTurnos } from "@/features/agenda/servicio-agenda";
import { AgendaInterna } from "@/features/agenda/agenda-interna";
export default async function AgendaPage() {
  const c = await obtenerContextoAutorizado(
    await crearClienteSupabaseServidor(),
  );
  if (!tienePermiso(c, "agenda", "visualizar")) redirect("/inicio");
  const turnos = await listarTurnos(c);
  const { data: pacientesData } = await crearClienteSupabaseAdministrativo()
    .from("paciente")
    .select("paciente_id,nombre_apellido,documento,telefono,sexo,estado")
    .eq("empresa_id", c.empresaId)
    .order("nombre_apellido");
  const pacientes = (pacientesData ?? []).map((p: Record<string, unknown>) => ({ id: String(p.paciente_id), nombreApellido: String(p.nombre_apellido ?? ""), documento: String(p.documento ?? ""), telefono: String(p.telefono ?? ""), sexo: String(p.sexo ?? ""), estado: String(p.estado ?? "prospecto") }));
  const { data } = await crearClienteSupabaseAdministrativo()
    .from("profesionales_servicios")
    .select(
      "id,precio,profesionales(id,nombre_completo,descripcion),servicios(nombre,descripcion,modalidad,duracion_minutos)",
    )
    .eq("empresa_id", c.empresaId)
    .eq("estado", "activo");
  const opciones = (data ?? []).map((x: Record<string, unknown>) => {
    const p = Array.isArray(x.profesionales)
      ? x.profesionales[0]
      : x.profesionales;
    const s = Array.isArray(x.servicios) ? x.servicios[0] : x.servicios;
    return {
      id: String(x.id),
      profesionalId: String((p as Record<string, unknown> | null)?.id ?? ""),
      descripcionProfesional: (p as Record<string, unknown> | null)?.descripcion ? String((p as Record<string, unknown>).descripcion) : null,
      profesional: String(
        (p as Record<string, unknown> | null)?.nombre_completo ?? "",
      ),
      servicio: String((s as Record<string, unknown> | null)?.nombre ?? ""),
      modalidad: String((s as Record<string, unknown> | null)?.modalidad ?? ""),
      descripcion: (s as Record<string, unknown> | null)?.descripcion ? String((s as Record<string, unknown>).descripcion) : null,
      duracion: Number((s as Record<string, unknown> | null)?.duracion_minutos ?? 30),
      precio: Number(x.precio),
    };
  });
  const { data: franjasData } = await crearClienteSupabaseAdministrativo().from("profesionales_servicios_franjas").select("profesional_servicio_id,dia_semana,hora_inicio,hora_fin").eq("empresa_id", c.empresaId).eq("estado", "activo");
  const franjas = (franjasData ?? []).map((f: Record<string, unknown>) => ({ asignacionId: String(f.profesional_servicio_id), dia: Number(f.dia_semana), inicio: String(f.hora_inicio).slice(0, 5), fin: String(f.hora_fin).slice(0, 5) }));
  return (
    <AplicacionShell>
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
            <AgendaInterna turnos={turnos} opciones={opciones} pacientes={pacientes} franjas={franjas} />
          </div>
        </section>
      </main>
    </AplicacionShell>
  );
}
