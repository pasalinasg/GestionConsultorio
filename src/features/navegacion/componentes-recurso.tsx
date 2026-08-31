"use client";

export function MensajeAccion({
  exito,
  error,
}: {
  exito?: string;
  error?: string;
}) {
  if (!exito && !error) return null;
  return (
    <p
      className={`rounded-xl p-3 text-sm ${error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}
      role="status"
    >
      {error ?? exito}
    </p>
  );
}

export function ModalRecurso({
  titulo,
  cerrar,
  children,
}: {
  titulo: string;
  cerrar: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/35 p-4"
      onMouseDown={(evento) =>
        evento.target === evento.currentTarget && cerrar()
      }
    >
      <section
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[var(--paper)] p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <h2 className="font-[Fraunces] text-2xl font-semibold">{titulo}</h2>
          <button
            type="button"
            onClick={cerrar}
            className="rounded-full border border-[var(--ink)] px-3 py-1 text-lg"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}

export function ContenedorListado({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
      {children}
    </div>
  );
}

export function EstadoVacio({ children }: { children: React.ReactNode }) {
  return (
    <p className="p-8 text-center text-sm text-[var(--muted)]">{children}</p>
  );
}
