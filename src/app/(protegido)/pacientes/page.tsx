import { redirect } from "next/navigation";
import { AplicacionShell } from "@/features/navegacion/aplicacion-shell";
import { obtenerContextoAutorizado, tienePermiso } from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import { listarPacientes } from "@/features/pacientes/servicio-pacientes";
import { ListaPacientes } from "@/features/pacientes/lista-pacientes";
export default async function PacientesPage() { const contexto = await obtenerContextoAutorizado(await crearClienteSupabaseServidor()); if (!tienePermiso(contexto, "pacientes", "visualizar")) redirect("/inicio"); const pacientes = await listarPacientes(contexto); return <AplicacionShell seccionActiva="pacientes"><main className="min-h-full bg-[var(--cream)] px-5 py-10 sm:px-8"><section className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">Gestión</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Pacientes</h1><p className="mt-2 max-w-2xl text-slate-600">Consulta y administra los pacientes de tu empresa.</p><div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-sm"><ListaPacientes pacientes={pacientes} /></div></section></main></AplicacionShell>; }
