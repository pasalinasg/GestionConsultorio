import { FormularioAltaEmpresa } from "@/features/empresas/formulario-alta-empresa";

export default function CrearEmpresaPage() {
  return (
    <main className="min-h-screen bg-[var(--cream)] px-5 py-10 sm:px-8 sm:py-16">
      <section className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper)] shadow-xl shadow-[#23352d]/10 md:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-[var(--forest)] p-8 text-white sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--sage)]">
            Gestión de consultorio
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">
            Tu espacio clínico, bajo control.
          </h1>
          <p className="mt-5 max-w-sm leading-7 text-white/80">
            Crea la empresa inicial y su cuenta propietaria. Desde ella
            administrarás usuarios y permisos.
          </p>
          <div className="mt-12 border-l-2 border-[var(--peach)] pl-4 text-sm leading-6 text-white/75">
            Solo se permite una empresa activa durante esta primera etapa de la
            plataforma.
          </div>
        </div>
        <div className="p-8 sm:p-12">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Crear empresa
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Completa los datos mínimos para empezar.
          </p>
          <div className="mt-8">
            <FormularioAltaEmpresa />
          </div>
        </div>
      </section>
    </main>
  );
}
