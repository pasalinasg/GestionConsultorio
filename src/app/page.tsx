import Link from "next/link";

export default function Inicio() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#71816a]">
          Gestión de consultorio
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
          Una agenda clínica que empieza con control.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--muted)]">
          La base de seguridad y aislamiento por empresa está preparada para
          construir los módulos clínicos.
        </p>
        <Link
          className="mt-8 inline-flex rounded-full bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--ink)] focus:outline-none focus:ring-4 focus:ring-[var(--sage)]"
          href="/crear-empresa"
        >
          Crear empresa
        </Link>
        <Link
          className="ml-3 text-sm font-semibold text-[var(--forest)] hover:text-[var(--ink)]"
          href="/iniciar-sesion"
        >
          Iniciar sesión
        </Link>
      </section>
    </main>
  );
}
