import { ListaUsuarios } from "@/features/usuarios/lista-usuarios";
import { AplicacionShell } from "@/features/navegacion/aplicacion-shell";
import { obtenerContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { crearClienteSupabaseServidor } from "@/lib/supabase/server";
import {
  listarPermisosDisponibles,
  listarUsuariosEmpresa,
} from "@/features/usuarios/servicio-listado-usuarios";
import { tienePermiso } from "@/features/autenticacion/servicio-autorizacion";
import { redirect } from "next/navigation";

export default async function UsuariosPage() {
  const cliente = await crearClienteSupabaseServidor();
  const contexto = await obtenerContextoAutorizado(cliente);
  if (!tienePermiso(contexto, "usuarios", "visualizar")) {
    redirect("/inicio");
  }
  const [usuarios, permisos] = await Promise.all([
    listarUsuariosEmpresa(contexto),
    listarPermisosDisponibles(),
  ]);
  return (
    <AplicacionShell seccionActiva="usuarios">
      <main className="min-h-full bg-[var(--cream)] px-5 py-10 sm:px-8">
        <section className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">
            Administración
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Usuarios y permisos
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            El propietario administra accesos de su empresa. Cada usuario recibe
            únicamente las acciones seleccionadas.
          </p>
          <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-sm">
            <ListaUsuarios usuarios={usuarios} permisos={permisos} />
          </div>
        </section>
      </main>
    </AplicacionShell>
  );
}
