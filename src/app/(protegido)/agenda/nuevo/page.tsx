import { redirect } from "next/navigation";
import { AplicacionShell } from "@/features/navegacion/aplicacion-shell";
import {
  obtenerContextoAutorizado,
  tienePermiso,
} from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import { listarTurnos } from "@/features/agenda/servicio-agenda";
import { NuevoTurno } from "@/features/agenda/nuevo-turno";
import { fechaHoraActualParaguay } from "@/features/agenda/tiempo-paraguay";

export default async function NuevoTurnoPage() {
  const contexto = await obtenerContextoAutorizado(
    await crearClienteSupabaseServidor(),
  );
  if (!tienePermiso(contexto, "agenda", "crear")) redirect("/agenda");
  const admin = crearClienteSupabaseAdministrativo();
  const [turnos, pacientesResultado, opcionesResultado, franjasResultado] =
    await Promise.all([
      listarTurnos(contexto),
      admin
        .from("paciente")
        .select("paciente_id,nombre_apellido,documento,telefono,sexo,estado")
        .eq("empresa_id", contexto.empresaId)
        .order("nombre_apellido"),
      admin
        .from("profesionales_servicios")
        .select(
          "id,precio,profesionales(id,nombre_completo,descripcion),servicios(nombre,descripcion,modalidad,duracion_minutos,presentacion,orden_publico)",
        )
        .eq("empresa_id", contexto.empresaId)
        .eq("estado", "activo"),
      admin
        .from("profesionales_servicios_franjas")
        .select("profesional_servicio_id,dia_semana,hora_inicio,hora_fin")
        .eq("empresa_id", contexto.empresaId)
        .eq("estado", "activo"),
    ]);
  const pacientes = (pacientesResultado.data ?? []).map(
    (p: Record<string, unknown>) => ({
      id: String(p.paciente_id),
      nombreApellido: String(p.nombre_apellido ?? ""),
      documento: String(p.documento ?? ""),
      telefono: String(p.telefono ?? ""),
      sexo: String(p.sexo ?? ""),
      estado: String(p.estado ?? "prospecto"),
    }),
  );
  const opciones = (opcionesResultado.data ?? []).map(
    (x: Record<string, unknown>) => {
      const profesional = Array.isArray(x.profesionales)
        ? x.profesionales[0]
        : x.profesionales;
      const servicio = Array.isArray(x.servicios)
        ? x.servicios[0]
        : x.servicios;
      const p = profesional as Record<string, unknown> | null;
      const s = servicio as Record<string, unknown> | null;
      return {
        id: String(x.id),
        profesionalId: String(p?.id ?? ""),
        profesional: String(p?.nombre_completo ?? ""),
        descripcionProfesional: p?.descripcion ? String(p.descripcion) : null,
        servicio: String(s?.nombre ?? ""),
        modalidad: String(s?.modalidad ?? ""),
        descripcion: s?.descripcion ? String(s.descripcion) : null,
        duracion: Number(s?.duracion_minutos ?? 30),
        precio: Number(x.precio),
        presentacion: String(s?.presentacion ?? "normal") as
          "normal" | "destacado" | "promocion",
        ordenPublico: Number(s?.orden_publico ?? 0),
      };
    },
  );
  const franjas = (franjasResultado.data ?? []).map(
    (f: Record<string, unknown>) => ({
      asignacionId: String(f.profesional_servicio_id),
      dia: Number(f.dia_semana),
      inicio: String(f.hora_inicio).slice(0, 5),
      fin: String(f.hora_fin).slice(0, 5),
    }),
  );
  return (
    <AplicacionShell seccionActiva="agenda">
      <main className="min-h-full bg-[var(--cream)] px-5 py-10 sm:px-8">
        <NuevoTurno
          turnos={turnos}
          opciones={opciones}
          pacientes={pacientes}
          franjas={franjas}
          ahoraInicial={fechaHoraActualParaguay()}
        />
      </main>
    </AplicacionShell>
  );
}
