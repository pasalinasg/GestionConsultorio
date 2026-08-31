import Link from "next/link";
import { obtenerContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { cerrarSesionAccion } from "@/features/autenticacion/acciones-sesion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";

export async function AplicacionShell({
  children,
  seccionActiva = "usuarios",
}: {
  children: React.ReactNode;
  seccionActiva?: "usuarios" | "servicios" | "profesionales" | "pacientes";
}) {
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
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[var(--muted)] transition hover:bg-[var(--cream)]"
            >
              ⊞&nbsp; Dashboard
            </Link>
            <p className="px-3 pb-2 pt-6 text-xs font-medium uppercase tracking-[0.16em] text-[#8a9bb8]">
              Gestión
            </p>
            <Link href="/pacientes" className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${seccionActiva === "pacientes" ? "bg-[#dceee7] text-[var(--forest)]" : "text-[var(--muted)] transition hover:bg-[var(--cream)]"}`}>
              ▣&nbsp; Pacientes
            </Link>
            <span className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[var(--muted)]/55">
              ⌁&nbsp; Agenda
            </span>
            <span className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[var(--muted)]/55">
              ✚&nbsp; Profesionales
            </span>
            <p className="px-3 pb-2 pt-6 text-xs font-medium uppercase tracking-[0.16em] text-[#8a9bb8]">
              Organización
            </p>
            <Link
              href="/usuarios"
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${seccionActiva === "usuarios" ? "bg-[#dceee7] text-[var(--forest)]" : "text-[var(--muted)] transition hover:bg-[var(--cream)]"}`}
            >
              ♙&nbsp; Usuarios y permisos
            </Link>
            <Link
              href="/servicios"
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${seccionActiva === "servicios" ? "bg-[#dceee7] text-[var(--forest)]" : "text-[var(--muted)] transition hover:bg-[var(--cream)]"}`}
            >
              Servicios
            </Link>
            <Link
              href="/profesionales"
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${seccionActiva === "profesionales" ? "bg-[#dceee7] text-[var(--forest)]" : "text-[var(--muted)] transition hover:bg-[var(--cream)]"}`}
            >
              Profesionales
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
          </div>
        </aside>
        <section className="h-full overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)] px-5 py-4 lg:hidden">
            <Link
              href="/inicio"
              className="font-[Fraunces] text-2xl font-semibold tracking-tight"
            >
              consultorio<span className="text-[#e88768]">.</span>
            </Link>
            <form action={cerrarSesionAccion}>
              <button
                type="submit"
                className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--muted)]"
              >
                Salir
              </button>
            </form>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-b border-[var(--line)] bg-[var(--paper)] px-5 py-3 text-sm font-semibold lg:hidden">
            <Link
              href="/inicio"
              className="shrink-0 rounded-full px-4 py-2 text-[var(--muted)]"
            >
              Inicio
            </Link>
            <span className="shrink-0 rounded-full px-4 py-2 text-[var(--muted)]/55">
              Agenda
            </span>
            <Link href="/pacientes" className={`shrink-0 rounded-full px-4 py-2 ${seccionActiva === "pacientes" ? "bg-[#dceee7] text-[var(--forest)]" : "text-[var(--muted)]"}`}>
              Pacientes
            </Link>
            <Link
              href="/usuarios"
              className="shrink-0 rounded-full bg-[#dceee7] px-4 py-2 text-[var(--forest)]"
            >
              Usuarios
            </Link>
          </nav>
          {children}
        </section>
      </div>
    </main>
  );
}
