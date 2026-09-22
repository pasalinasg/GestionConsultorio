"use client";

import { useRef } from "react";

export type TarjetaServicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  modalidad: string;
  duracion: number;
  precio: number;
  presentacion?: "normal" | "destacado" | "promocion";
  ordenPublico?: number;
};

const etiquetaPresentacion = {
  normal: null,
  destacado: "Destacado",
  promocion: "Promoción",
} as const;

function detalles(descripcion: string | null) {
  if (!descripcion) return ["Atención profesional personalizada."];
  return descripcion
    .split(/\n|✓/)
    .map((detalle) => detalle.trim())
    .filter(Boolean);
}

const prioridadPresentacion = (
  presentacion: TarjetaServicio["presentacion"],
) => (presentacion === "promocion" ? 0 : presentacion === "destacado" ? 1 : 2);

export function TarjetasServicios({
  servicios,
  onSeleccionar,
  etiquetaAccion = "Seleccionar servicio",
}: {
  servicios: TarjetaServicio[];
  onSeleccionar: (id: string) => void;
  etiquetaAccion?: string;
}) {
  const serviciosOrdenados = [...servicios].sort(
    (a, b) =>
      prioridadPresentacion(a.presentacion) -
        prioridadPresentacion(b.presentacion) ||
      (a.ordenPublico ?? 0) - (b.ordenPublico ?? 0) ||
      a.nombre.localeCompare(b.nombre, "es"),
  );
  const carrusel = serviciosOrdenados.length > 3;
  const contenedor = useRef<HTMLDivElement>(null);
  const mover = (direccion: -1 | 1) =>
    contenedor.current?.scrollBy({
      left: direccion * Math.min(contenedor.current.clientWidth * 0.85, 920),
      behavior: "smooth",
    });

  return (
    <div className="relative min-w-0 max-w-full overflow-hidden">
      {carrusel ? (
        <div className="mb-3 flex justify-end gap-2">
          <button
            type="button"
            aria-label="Ver servicios anteriores"
            onClick={() => mover(-1)}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[var(--line)] text-[var(--forest)] transition hover:bg-[var(--cream)]"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Ver más servicios"
            onClick={() => mover(1)}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[var(--line)] text-[var(--forest)] transition hover:bg-[var(--cream)]"
          >
            →
          </button>
        </div>
      ) : null}
      <div
        ref={contenedor}
        className={
          carrusel
            ? "flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pr-2"
            : `grid gap-4 ${serviciosOrdenados.length === 1 ? "mx-auto max-w-md" : "sm:grid-cols-2"} ${serviciosOrdenados.length > 2 ? "xl:grid-cols-3" : ""}`
        }
      >
        {serviciosOrdenados.map((servicio) => {
          const presentacion = servicio.presentacion ?? "normal";
          const destacado = presentacion === "destacado";
          const promocion = presentacion === "promocion";
          return (
            <button
              type="button"
              key={servicio.id}
              onClick={() => onSeleccionar(servicio.id)}
              className={`flex min-h-[29rem] cursor-pointer flex-col items-start rounded-2xl border p-6 text-left transition hover:-translate-y-0.5 ${carrusel ? "w-[82vw] flex-none snap-start sm:w-[calc((100%-2rem)/3)]" : "w-full"} ${destacado ? "border-[var(--forest)] bg-[var(--forest)] text-white shadow-lg" : promocion ? "border-[#d87b5b] bg-[var(--peach)]/45 text-[var(--ink)] shadow-[0_12px_28px_rgba(216,123,91,0.16)]" : "border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--forest)]"}`}
            >
              <span
                className={`text-xs font-bold uppercase tracking-[0.15em] ${destacado ? "text-white/80" : "text-[var(--forest)]"}`}
              >
                {servicio.modalidad} · {servicio.duracion} min
              </span>
              {etiquetaPresentacion[presentacion] ? (
                <span
                  className={`mt-3 rounded-full px-3 py-1 text-xs font-bold ${destacado ? "bg-white/15 text-white" : promocion ? "bg-[#d87b5b] text-white" : "bg-[var(--paper)] text-[var(--forest)]"}`}
                >
                  {etiquetaPresentacion[presentacion]}
                </span>
              ) : null}
              <strong className="mt-5 font-[Fraunces] text-3xl leading-tight">
                {servicio.nombre}
              </strong>
              <strong className="mt-4 font-[Fraunces] text-3xl">
                Gs. {servicio.precio.toLocaleString("es-PY")}
              </strong>
              <ul
                className={`mt-7 grid gap-2 text-sm leading-6 ${destacado ? "text-white" : "text-[var(--muted)]"}`}
              >
                {detalles(servicio.descripcion).map((detalle, indice) => (
                  <li key={`${servicio.id}-${indice}`} className="flex gap-2">
                    <span aria-hidden="true">✓</span>
                    <span>{detalle}</span>
                  </li>
                ))}
              </ul>
              <span
                className={`mt-auto w-full rounded-full border px-4 py-3 text-center text-xs font-bold ${destacado ? "border-white bg-white text-[var(--forest)]" : promocion ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--forest)] text-[var(--forest)]"}`}
              >
                {etiquetaAccion}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
