import Link from "next/link";
import { AplicacionShell } from "@/features/navegacion/aplicacion-shell";
import {
  obtenerContextoAutorizado,
  tienePermiso,
} from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { listarTurnos } from "@/features/agenda/servicio-agenda";
import { fechaActualParaguay } from "@/features/agenda/tiempo-paraguay";
import { obtenerProfesionalDelUsuario } from "@/features/profesionales/servicio-profesionales";

function fechaHora(valor: string) {
  const [fecha, hora] = valor.slice(0, 16).split("T");
  return fecha && hora
    ? `${fecha.split("-").reverse().join("/")}, ${hora}`
    : valor;
}

export const dynamic = "force-dynamic";

export default async function InicioAplicacionPage() {
  const contexto = await obtenerContextoAutorizado(
    await crearClienteSupabaseServidor(),
  );
  const puedeVerAgenda = tienePermiso(contexto, "agenda", "visualizar");
  const profesionalPropio = await obtenerProfesionalDelUsuario(contexto);
  const destinoAgenda = profesionalPropio ? "/mi-agenda" : "/agenda";
  const hoy = fechaActualParaguay();
  const turnos = puedeVerAgenda ? await listarTurnos(contexto) : [];
  const turnosHoy = turnos.filter((turno) => turno.inicio.slice(0, 10) === hoy);
  const confirmadosHoy = turnosHoy.filter(
    (turno) => turno.estado === "confirmada",
  );
  const pendientes = turnos.filter(
    (turno) => turno.estado === "pendiente" && turno.inicio.slice(0, 10) >= hoy,
  );
  const cancelacionesMes = turnos.filter(
    (turno) =>
      turno.estado === "cancelada" &&
      turno.inicio.slice(0, 7) === hoy.slice(0, 7),
  );
  const proximos = turnos
    .filter(
      (turno) =>
        turno.inicio >= `${hoy}T00:00` &&
        ["pendiente", "confirmada"].includes(turno.estado),
    )
    .slice(0, 5);
  const indicadores = [
    {
      etiqueta: "Turnos de hoy",
      valor: puedeVerAgenda ? String(turnosHoy.length) : "—",
      detalle: puedeVerAgenda ? "Citas programadas hoy" : "Sin acceso a Agenda",
      tono: "bg-[var(--sage)]/45",
    },
    {
      etiqueta: "Confirmados hoy",
      valor: puedeVerAgenda ? String(confirmadosHoy.length) : "—",
      detalle: "Citas confirmadas",
      tono: "bg-[var(--peach)]/55",
    },
    {
      etiqueta: "Pendientes",
      valor: puedeVerAgenda ? String(pendientes.length) : "—",
      detalle: "Reservas por confirmar",
      tono: "bg-[#e8dfc8]",
    },
    {
      etiqueta: "Cancelaciones",
      valor: puedeVerAgenda ? String(cancelacionesMes.length) : "—",
      detalle: "Durante el mes actual",
      tono: "bg-[#e8d8d0]",
    },
  ];

  return (
    <AplicacionShell seccionActiva="inicio">
      <main className="min-h-full bg-[var(--cream)] px-5 py-10 sm:px-8 lg:px-12">
        <section className="mx-auto max-w-7xl">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#71816a]">
                Panorama del consultorio
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Buen día<span className="text-[#e88768]">.</span>
              </h1>
              <p className="mt-3 text-[var(--muted)]">
                Una lectura rápida de la actividad de tu consultorio.
              </p>
            </div>
            <div className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-sm text-[var(--muted)]">
              {hoy.split("-").reverse().join("/")}
            </div>
          </header>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {indicadores.map((indicador) => (
              <article
                key={indicador.etiqueta}
                className={`rounded-3xl p-5 ${indicador.tono}`}
              >
                <p className="text-sm font-semibold text-[var(--muted)]">
                  {indicador.etiqueta}
                </p>
                <p className="mt-7 font-[Fraunces] text-4xl font-semibold">
                  {indicador.valor}
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {indicador.detalle}
                </p>
              </article>
            ))}
          </div>
          <section className="mt-8 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#71816a]">
                  Próximas citas
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Actividad de la agenda
                </h2>
              </div>
              {puedeVerAgenda ? (
          <Link
            href={destinoAgenda}
                  className="text-sm font-semibold text-[var(--forest)]"
                >
                  Ver agenda →
                </Link>
              ) : null}
            </div>
            {puedeVerAgenda && proximos.length ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)]">
                {proximos.map((turno) => (
                  <div
                    key={turno.id}
                    className="grid gap-1 border-b border-[var(--line)] px-4 py-4 last:border-0 sm:grid-cols-[155px_1fr_1fr] sm:items-center"
                  >
                    <span className="text-sm text-[var(--muted)]">
                      {fechaHora(turno.inicio)}
                    </span>
                    <span>
                      <strong>{turno.paciente}</strong>
                      <small className="block text-xs text-[var(--muted)]">
                        {turno.servicio}
                      </small>
                    </span>
                    <span className="text-sm">{turno.profesional}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid min-h-52 place-items-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--cream)]/60 p-8 text-center">
                <div>
                  <p className="font-[Fraunces] text-xl">
                    {puedeVerAgenda
                      ? "No hay próximas citas"
                      : "Agenda sin acceso"}
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                    {puedeVerAgenda
                      ? "Las nuevas reservas aparecerán aquí automáticamente."
                      : "Solicita permiso para visualizar Agenda si necesitas este resumen."}
                  </p>
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    </AplicacionShell>
  );
}
