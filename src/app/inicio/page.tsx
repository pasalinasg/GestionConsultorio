import Link from "next/link";
import { obtenerContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { cerrarSesionAccion } from "@/features/autenticacion/acciones-sesion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";

const indicadores = [
  {
    etiqueta: "Turnos de hoy",
    valor: "—",
    detalle: "Todavía no hay agenda cargada",
    tono: "bg-[var(--sage)]/45",
  },
  {
    etiqueta: "Confirmados",
    valor: "—",
    detalle: "Se mostrará al registrar turnos",
    tono: "bg-[var(--peach)]/55",
  },
  {
    etiqueta: "Pendientes de pago",
    valor: "—",
    detalle: "Comprobantes por revisar",
    tono: "bg-[#e8dfc8]",
  },
  {
    etiqueta: "Cancelaciones",
    valor: "—",
    detalle: "Resumen del período seleccionado",
    tono: "bg-[#e8d8d0]",
  },
];

export const dynamic = "force-dynamic";

export default async function InicioAplicacionPage() {
  const cliente = await crearClienteSupabaseServidor();
  const contexto = await obtenerContextoAutorizado(cliente);
  const { data: usuario } = await cliente
    .from("usuarios")
    .select("nombre_usuario")
    .eq("id", contexto.usuarioId)
    .maybeSingle();
  const nombreUsuario =
    (usuario as { nombre_usuario?: string } | null)?.nombre_usuario ??
    "Usuario";
  const inicialUsuario = nombreUsuario.slice(0, 1).toUpperCase();

  return (
    <main className="h-screen overflow-hidden bg-[var(--cream)] text-[var(--ink)]">
      <div className="grid h-full w-full lg:grid-cols-[250px_1fr]">
        <aside className="hidden h-full overflow-y-auto border-r border-[var(--line)] bg-[var(--paper)] lg:flex lg:flex-col">
          <div className="p-6">
            <Link
              href="/inicio"
              className="font-[Fraunces] text-2xl font-semibold tracking-tight"
            >
              consultorio<span className="text-[#e88768]">.</span>
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#71816a]">
              Panel de gestión
            </p>
          </div>
          <nav className="grid gap-1 px-3 text-sm font-semibold">
            <p className="px-3 pb-2 pt-3 text-xs font-medium uppercase tracking-[0.16em] text-[#8a9bb8]">
              Panorama
            </p>
            <Link
              href="/inicio"
              className="flex items-center gap-3 rounded-2xl bg-[#dceee7] px-4 py-3 text-[var(--forest)]"
            >
              <span className="text-lg">⊞</span>Dashboard
            </Link>
            <p className="px-3 pb-2 pt-6 text-xs font-medium uppercase tracking-[0.16em] text-[#8a9bb8]">
              Gestión
            </p>
            <span className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[var(--muted)]/55">
              <span className="text-lg">▣</span>Pacientes
            </span>
            <span className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[var(--muted)]/55">
              <span className="text-lg">⌁</span>Agenda
            </span>
            <span className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[var(--muted)]/55">
              <span className="text-lg">✚</span>Profesionales
            </span>
            <p className="px-3 pb-2 pt-6 text-xs font-medium uppercase tracking-[0.16em] text-[#8a9bb8]">
              Organización
            </p>
            <Link
              href="/usuarios"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[var(--muted)] transition hover:bg-[var(--cream)]"
            >
              <span className="text-lg">♙</span>Usuarios y permisos
            </Link>
            <Link
              href="/servicios"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[var(--muted)] transition hover:bg-[var(--cream)]"
            >
              Servicios
            </Link>
          </nav>
          <div className="mt-auto border-t border-[var(--line)]">
            <div className="flex items-center gap-2 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--forest)] text-lg font-semibold text-white">
                {inicialUsuario}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{nombreUsuario}</p>
                <p className="text-xs text-[var(--muted)]">
                  {contexto.esPropietario ? "Propietario" : "Usuario interno"}
                </p>
              </div>
              <form action={cerrarSesionAccion}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--forest)] hover:bg-[var(--cream)] hover:text-[var(--ink)]"
                >
                  Salir
                </button>
              </form>
            </div>
            <div className="hidden">
              <button type="button" className="hidden">
                ◉&nbsp; Privacidad
              </button>
              <form action={cerrarSesionAccion}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 font-semibold text-[var(--muted)] transition hover:border-[var(--forest)] hover:bg-[var(--cream)] hover:text-[var(--ink)]"
                >
                  ↪&nbsp; Salir
                </button>
              </form>
            </div>
          </div>
        </aside>
        <section className="h-full overflow-y-auto p-5 sm:p-8 lg:p-12">
          <div className="mb-6 flex items-center justify-between border-b border-[var(--line)] pb-5 lg:hidden">
            <Link
              href="/inicio"
              className="font-[Fraunces] text-2xl font-semibold tracking-tight"
            >
              consultorio<span className="text-[#e88768]">.</span>
            </Link>
            <form action={cerrarSesionAccion}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--forest)] hover:text-[var(--ink)]"
              >
                <span aria-hidden="true">↪</span> Salir
              </button>
            </form>
          </div>
          <nav className="mb-8 flex gap-2 overflow-x-auto pb-1 text-sm font-semibold lg:hidden">
            <Link
              href="/inicio"
              className="shrink-0 rounded-full bg-[var(--forest)] px-4 py-2 text-white"
            >
              Inicio
            </Link>
            <span className="shrink-0 rounded-full border border-[var(--line)] px-4 py-2 text-[var(--muted)]/60">
              Agenda
            </span>
            <span className="shrink-0 rounded-full border border-[var(--line)] px-4 py-2 text-[var(--muted)]/60">
              Pacientes
            </span>
            <Link
              href="/usuarios"
              className="shrink-0 rounded-full border border-[var(--line)] px-4 py-2 text-[var(--muted)]"
            >
              Usuarios
            </Link>
          </nav>
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#71816a]">
                Panorama del consultorio
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Buen día<span className="text-[#e88768]">.</span>
              </h1>
              <p className="mt-3 text-[var(--muted)]">
                Aquí tendrás una lectura rápida de lo que está pasando.
              </p>
            </div>
            <div className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-sm text-[var(--muted)]">
              Este mes · sin datos
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
          <div className="mt-8 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#71816a]">
                    Seguimiento
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Actividad de la agenda
                  </h2>
                </div>
                <span className="rounded-full bg-[var(--cream)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  Próximamente
                </span>
              </div>
              <div className="mt-10 grid min-h-52 place-items-center rounded-2xl border border-dashed border-[var(--line)] bg-[var(--cream)]/60 p-8 text-center">
                <div>
                  <p className="font-[Fraunces] text-xl">
                    Tu actividad aparecerá aquí
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                    Cuando configuremos profesionales, servicios y turnos podrás
                    seguir confirmaciones, cancelaciones y pagos.
                  </p>
                </div>
              </div>
            </section>
            <section className="rounded-3xl bg-[var(--forest)] p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--sage)]">
                Siguiente paso
              </p>
              <h2 className="mt-3 font-[Fraunces] text-3xl leading-tight">
                Configura tu equipo.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Crea usuarios y define qué puede hacer cada persona dentro de la
                empresa.
              </p>
              <Link
                href="/usuarios"
                className="mt-8 inline-flex rounded-full bg-[var(--paper)] px-4 py-2.5 text-sm font-bold text-[var(--forest)] transition hover:bg-white"
              >
                Gestionar usuarios →
              </Link>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
