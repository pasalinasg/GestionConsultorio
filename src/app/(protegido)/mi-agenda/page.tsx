import { redirect } from "next/navigation";
import Link from "next/link";
import { AplicacionShell } from "@/features/navegacion/aplicacion-shell";
import { obtenerContextoAutorizado, tienePermiso } from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { AgendaInterna } from "@/features/agenda/agenda-interna";
import { listarMisTurnos } from "@/features/agenda/servicio-agenda";
import { obtenerProfesionalDelUsuario } from "@/features/profesionales/servicio-profesionales";
import { fechaActualParaguay } from "@/features/agenda/tiempo-paraguay";

export default async function MiAgendaPage() {
  const contexto = await obtenerContextoAutorizado(await crearClienteSupabaseServidor());
  if (!tienePermiso(contexto, "mi_agenda", "visualizar")) redirect("/inicio");
  const profesional = await obtenerProfesionalDelUsuario(contexto);
  if (!profesional) return <AplicacionShell seccionActiva="mi_agenda"><main className="min-h-full bg-[var(--cream)] px-5 py-10 sm:px-8"><section className="mx-auto max-w-3xl rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">Mi agenda</p><h1 className="mt-3 font-[Fraunces] text-3xl">Vincula tu usuario a una profesional</h1><p className="mt-3 text-[var(--muted)]">Para ver una agenda personal, edita la profesional correspondiente y selecciona tu usuario en “Usuario asociado”.</p><Link href="/profesionales" className="mt-6 inline-flex rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white">Ir a Profesionales</Link></section></main></AplicacionShell>;
  const turnos = await listarMisTurnos(contexto);
  return <AplicacionShell seccionActiva="mi_agenda"><main className="min-h-full bg-[var(--cream)] px-5 py-10 sm:px-8"><section className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">Gestión</p><h1 className="mt-3 text-3xl font-semibold">Mi agenda</h1><p className="mt-2 text-[var(--muted)]">Consulta y actualiza los turnos asignados a {profesional.nombre_completo}.</p><div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-sm"><AgendaInterna turnos={turnos} hoy={fechaActualParaguay()} propia puedeCrear nuevoHref="/mi-agenda/nuevo" puedeEditar={tienePermiso(contexto, "mi_agenda", "editar")} /></div></section></main></AplicacionShell>;
}
