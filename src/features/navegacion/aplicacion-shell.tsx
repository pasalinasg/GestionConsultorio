import Link from "next/link";
import { obtenerContextoAutorizado, tienePermiso } from "@/features/autenticacion/servicio-autorizacion";
import { cerrarSesionAccion } from "@/features/autenticacion/acciones-sesion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";

type SeccionNavegacion = "inicio" | "agenda" | "mi_agenda" | "pacientes" | "profesionales" | "servicios" | "usuarios";
type GrupoNavegacion = "panorama" | "gestion" | "organizacion";
type IconoNavegacion = SeccionNavegacion;
type EntradaNavegacion = {
  id: SeccionNavegacion;
  href: string;
  etiqueta: string;
  grupo: GrupoNavegacion;
  recurso: Exclude<SeccionNavegacion, "inicio"> | null;
  icono: IconoNavegacion;
};

const grupos: Array<{ id: GrupoNavegacion; etiqueta: string }> = [
  { id: "panorama", etiqueta: "Panorama" },
  { id: "gestion", etiqueta: "Gestión" },
  { id: "organizacion", etiqueta: "Organización" },
];
const entradas: EntradaNavegacion[] = [
  { id: "inicio", href: "/inicio", etiqueta: "Dashboard", grupo: "panorama", recurso: null, icono: "inicio" },
  { id: "agenda", href: "/agenda", etiqueta: "Agenda", grupo: "gestion", recurso: "agenda", icono: "agenda" },
  { id: "mi_agenda", href: "/mi-agenda", etiqueta: "Mi agenda", grupo: "gestion", recurso: "mi_agenda", icono: "mi_agenda" },
  { id: "pacientes", href: "/pacientes", etiqueta: "Pacientes", grupo: "gestion", recurso: "pacientes", icono: "pacientes" },
  { id: "servicios", href: "/servicios", etiqueta: "Servicios", grupo: "organizacion", recurso: "servicios", icono: "servicios" },
  { id: "profesionales", href: "/profesionales", etiqueta: "Profesionales", grupo: "organizacion", recurso: "profesionales", icono: "profesionales" },
  { id: "usuarios", href: "/usuarios", etiqueta: "Usuarios y permisos", grupo: "organizacion", recurso: "usuarios", icono: "usuarios" },
];

function Icono({ nombre }: { nombre: IconoNavegacion }) {
  const comun = "h-5 w-5 shrink-0";
  if (nombre === "inicio") return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={comun}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
  if (nombre === "agenda") return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={comun}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 17h6" /></svg>;
  if (nombre === "mi_agenda") return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={comun}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M12 14v4M10 16h4" /></svg>;
  if (nombre === "pacientes") return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={comun}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21c.8-4 3.5-6 7.5-6s6.7 2 7.5 6" /></svg>;
  if (nombre === "profesionales") return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={comun}><circle cx="12" cy="7" r="3" /><path d="M7 21v-4a5 5 0 0 1 10 0v4M9 12l-1 3 4 2 4-2-1-3" /></svg>;
  if (nombre === "servicios") return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={comun}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3h6v3H9zM9 11h6M9 15h6" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={comun}><path d="M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-3Z" /><circle cx="12" cy="10" r="2.2" /><path d="M8.5 16c.7-2 1.9-3 3.5-3s2.8 1 3.5 3" /></svg>;
}

function EnlaceNavegacion({ entrada, activa, movil = false }: { entrada: EntradaNavegacion; activa: boolean; movil?: boolean }) {
  const estado = activa ? "bg-[#dceee7] text-[var(--forest)]" : "text-[var(--muted)] transition hover:bg-[var(--cream)] hover:text-[var(--ink)]";
  return <Link href={entrada.href} aria-current={activa ? "page" : undefined} className={movil ? `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 ${estado}` : `flex items-center gap-3 rounded-2xl px-4 py-3 ${estado}`}><Icono nombre={entrada.icono} /><span>{entrada.etiqueta}</span></Link>;
}

export async function AplicacionShell({ children, seccionActiva = "inicio" }: { children: React.ReactNode; seccionActiva?: SeccionNavegacion }) {
  const cliente = await crearClienteSupabaseServidor();
  const contexto = await obtenerContextoAutorizado(cliente);
  const { data: usuario } = await cliente.from("usuarios").select("nombre_usuario").eq("id", contexto.usuarioId).maybeSingle();
  const nombreUsuario = (usuario as { nombre_usuario?: string } | null)?.nombre_usuario ?? "Usuario";
  const entradasVisibles = entradas.filter((entrada) => !entrada.recurso || tienePermiso(contexto, entrada.recurso, "visualizar"));

  return <main className="h-screen overflow-hidden bg-[var(--cream)] text-[var(--ink)]">
    <div className="grid h-full w-full lg:grid-cols-[250px_1fr]">
      <aside className="hidden h-full overflow-y-auto border-r border-[var(--line)] bg-[var(--paper)] lg:flex lg:flex-col">
        <div className="p-6"><Link href="/inicio" className="font-[Fraunces] text-2xl font-semibold tracking-tight">consultorio<span className="text-[#e88768]">.</span></Link><p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#71816a]">Panel de gestión</p></div>
        <nav className="grid gap-1 px-3 text-sm font-semibold" aria-label="Navegación principal">
          {grupos.map((grupo) => {
            const opcionesGrupo = entradasVisibles.filter((entrada) => entrada.grupo === grupo.id);
            if (!opcionesGrupo.length) return null;
            return <div key={grupo.id} className="grid gap-1"><p className="px-3 pb-2 pt-6 text-xs font-medium uppercase tracking-[0.16em] text-[#8a9bb8]">{grupo.etiqueta}</p>{opcionesGrupo.map((entrada) => <EnlaceNavegacion key={entrada.id} entrada={entrada} activa={seccionActiva === entrada.id} />)}</div>;
          })}
        </nav>
        <div className="mt-auto border-t border-[var(--line)]"><div className="flex items-center gap-2 p-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--forest)] text-lg font-semibold text-white">{nombreUsuario.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{nombreUsuario}</p><p className="text-xs text-[var(--muted)]">{contexto.esPropietario ? "Propietario" : "Usuario interno"}</p></div><form action={cerrarSesionAccion}><button type="submit" className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--forest)] hover:bg-[var(--cream)] hover:text-[var(--ink)]">Salir</button></form></div></div>
      </aside>
      <section className="h-full overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)] px-5 py-4 lg:hidden"><Link href="/inicio" className="font-[Fraunces] text-2xl font-semibold tracking-tight">consultorio<span className="text-[#e88768]">.</span></Link><form action={cerrarSesionAccion}><button type="submit" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--muted)]">Salir</button></form></div>
        <nav className="flex gap-2 overflow-x-auto border-b border-[var(--line)] bg-[var(--paper)] px-5 py-3 text-sm font-semibold lg:hidden" aria-label="Navegación principal">{entradasVisibles.map((entrada) => <EnlaceNavegacion key={entrada.id} entrada={entrada} activa={seccionActiva === entrada.id} movil />)}</nav>
        {children}
      </section>
    </div>
  </main>;
}
