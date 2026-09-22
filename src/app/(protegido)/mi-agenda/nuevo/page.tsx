import { redirect } from "next/navigation";
import { AplicacionShell } from "@/features/navegacion/aplicacion-shell";
import {
  obtenerContextoAutorizado,
  tienePermiso,
} from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import { listarMisTurnos } from "@/features/agenda/servicio-agenda";
import { fechaHoraActualParaguay } from "@/features/agenda/tiempo-paraguay";
import { obtenerProfesionalDelUsuario } from "@/features/profesionales/servicio-profesionales";
import { NuevoTurno } from "@/features/agenda/nuevo-turno";

export default async function NuevoTurnoMiAgendaPage() {
  const contexto = await obtenerContextoAutorizado(
    await crearClienteSupabaseServidor(),
  );
  if (!tienePermiso(contexto, "mi_agenda", "visualizar")) redirect("/inicio");
  const profesional = await obtenerProfesionalDelUsuario(contexto);
  if (!profesional) redirect("/mi-agenda");
  const admin = crearClienteSupabaseAdministrativo();
  const [turnos, pacientesResultado, opcionesResultado, franjasResultado] =
    await Promise.all([
      listarMisTurnos(contexto),
      admin
        .from("paciente")
        .select("paciente_id,nombre_apellido,documento,telefono,sexo,estado")
        .eq("empresa_id", contexto.empresaId)
        .order("nombre_apellido"),
      admin
        .from("profesionales_servicios")
        .select(
          "id,precio,profesional_id,profesionales(id,nombre_completo,descripcion),servicios(nombre,descripcion,modalidad,duracion_minutos,presentacion,orden_publico)",
        )
        .eq("empresa_id", contexto.empresaId)
        .eq("profesional_id", profesional.id)
        .eq("estado", "activo"),
      admin
        .from("profesionales_servicios_franjas")
        .select("profesional_servicio_id,dia_semana,hora_inicio,hora_fin")
        .eq("empresa_id", contexto.empresaId)
        .eq("estado", "activo"),
    ]);
  const pacientes = (pacientesResultado.data ?? []).map(
    (paciente: Record<string, unknown>) => ({
      id: String(paciente.paciente_id),
      nombreApellido: String(paciente.nombre_apellido ?? ""),
      documento: String(paciente.documento ?? ""),
      telefono: String(paciente.telefono ?? ""),
      sexo: String(paciente.sexo ?? ""),
      estado: String(paciente.estado ?? "prospecto"),
    }),
  );
  const opciones = (opcionesResultado.data ?? []).map(
    (asignacion: Record<string, unknown>) => {
      const profesionalDato = Array.isArray(asignacion.profesionales)
        ? asignacion.profesionales[0]
        : asignacion.profesionales;
      const servicio = Array.isArray(asignacion.servicios)
        ? asignacion.servicios[0]
        : asignacion.servicios;
      const profesionalObjeto = profesionalDato as Record<
        string,
        unknown
      > | null;
      const servicioObjeto = servicio as Record<string, unknown> | null;
      return {
        id: String(asignacion.id),
        profesionalId: profesional.id,
        profesional: String(
          profesionalObjeto?.nombre_completo ?? profesional.nombre_completo,
        ),
        descripcionProfesional: profesionalObjeto?.descripcion
          ? String(profesionalObjeto.descripcion)
          : null,
        servicio: String(servicioObjeto?.nombre ?? ""),
        modalidad: String(servicioObjeto?.modalidad ?? ""),
        descripcion: servicioObjeto?.descripcion
          ? String(servicioObjeto.descripcion)
          : null,
        duracion: Number(servicioObjeto?.duracion_minutos ?? 30),
        precio: Number(asignacion.precio),
        presentacion: String(servicioObjeto?.presentacion ?? "normal") as
          "normal" | "destacado" | "promocion",
        ordenPublico: Number(servicioObjeto?.orden_publico ?? 0),
      };
    },
  );
  const idsAsignaciones = new Set(opciones.map((opcion) => opcion.id));
  const franjas = (franjasResultado.data ?? [])
    .filter((franja: Record<string, unknown>) =>
      idsAsignaciones.has(String(franja.profesional_servicio_id)),
    )
    .map((franja: Record<string, unknown>) => ({
      asignacionId: String(franja.profesional_servicio_id),
      dia: Number(franja.dia_semana),
      inicio: String(franja.hora_inicio).slice(0, 5),
      fin: String(franja.hora_fin).slice(0, 5),
    }));
  return (
    <AplicacionShell seccionActiva="mi_agenda">
      <main className="min-h-full bg-[var(--cream)] px-5 py-10 sm:px-8">
        <NuevoTurno
          turnos={turnos}
          opciones={opciones}
          pacientes={pacientes}
          franjas={franjas}
          ahoraInicial={fechaHoraActualParaguay()}
          profesionalInicial={profesional.nombre_completo}
          volverHref="/mi-agenda"
          agendaPropia
        />
      </main>
    </AplicacionShell>
  );
}
