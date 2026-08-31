import Link from "next/link";
import { FormularioInicioSesion } from "@/features/autenticacion/formulario-inicio-sesion";

export default async function IniciarSesionPage({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string }>;
}) {
  const parametros = await searchParams;
  return (
    <main className="min-h-screen bg-[var(--cream)] px-5 py-10 sm:px-8 sm:py-16">
      <section className="mx-auto max-w-md rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-8 shadow-xl shadow-[#23352d]/10 sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">
          Gestión de consultorio
        </p>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Accede con el usuario de tu empresa.
        </p>
        {parametros.empresa ? (
          <p className="mt-4 rounded-xl bg-[var(--sage)]/40 p-3 text-sm text-[var(--ink)]">
            La empresa {parametros.empresa} fue creada. Ahora inicia sesión.
          </p>
        ) : null}
        <div className="mt-8">
          <FormularioInicioSesion />
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link
            className="font-semibold text-[var(--forest)] hover:text-[var(--ink)]"
            href="/crear-empresa"
          >
            Crear empresa inicial
          </Link>
        </p>
      </section>
    </main>
  );
}
