"use client";
import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  formatearImporte,
  formatearModalidad,
} from "@/lib/formato-presentacion";
import type { EstadoProfesional } from "./acciones-profesionales";
import {
  crearProfesionalAccion,
  editarProfesionalAccion,
  cambiarEstadoProfesionalAccion,
  eliminarProfesionalAccion,
} from "./acciones-profesionales";
import {
  crearAsignacionAccion,
  editarAsignacionAccion,
  eliminarAsignacionAccion,
  crearDisponibilidadAccion,
  eliminarDisponibilidadAccion,
  crearFranjaServicioAccion,
  eliminarFranjaServicioAccion,
  type EstadoAsignacion,
} from "./acciones-asignaciones";
type S = {
  id: string;
  nombre: string;
  modalidad: string;
  duracionMinutos: number;
};
type F = { id: string; dia: number; inicio: string; fin: string };
type A = {
  id: string;
  servicioId: string;
  servicioNombre: string;
  modalidad: string;
  precio: number;
  estado: "activo" | "inactivo";
  franjas: F[];
};
type P = {
  id: string;
  nombre_completo: string;
  descripcion: string | null;
  estado: "activo" | "inactivo";
  asignaciones: A[];
  disponibilidad: F[];
};
const dias = [
  "",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
export function ListaProfesionales({
  profesionales,
  servicios,
}: {
  profesionales: P[];
  servicios: S[];
}) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("todos");
  const [m, setM] = useState<P | null | "crear">(null);
  const [a, crear] = useActionState(
    crearProfesionalAccion,
    {} as EstadoProfesional,
  );
  const [b, editar] = useActionState(
    editarProfesionalAccion,
    {} as EstadoProfesional,
  );
  const [c, estado] = useActionState(
    cambiarEstadoProfesionalAccion,
    {} as EstadoProfesional,
  );
  const [d, eliminar] = useActionState(
    eliminarProfesionalAccion,
    {} as EstadoProfesional,
  );
  const [aa, asignar] = useActionState(
    crearAsignacionAccion,
    {} as EstadoAsignacion,
  );
  const [ab, editarAsig] = useActionState(
    editarAsignacionAccion,
    {} as EstadoAsignacion,
  );
  const [ac, eliminarAsig] = useActionState(
    eliminarAsignacionAccion,
    {} as EstadoAsignacion,
  );
  const [ad, crearDisp] = useActionState(
    crearDisponibilidadAccion,
    {} as EstadoAsignacion,
  );
  const [ae, eliminarDisp] = useActionState(
    eliminarDisponibilidadAccion,
    {} as EstadoAsignacion,
  );
  const [af, crearFranja] = useActionState(
    crearFranjaServicioAccion,
    {} as EstadoAsignacion,
  );
  const [ag, eliminarFranja] = useActionState(
    eliminarFranjaServicioAccion,
    {} as EstadoAsignacion,
  );
  const lista = useMemo(
    () =>
      profesionales.filter(
        (p) =>
          p.nombre_completo.toLowerCase().includes(q.toLowerCase()) &&
          (f === "todos" || p.estado === f),
      ),
    [profesionales, q, f],
  );
  const x = m && m !== "crear" ? m : null;
  const mensajes = [a, b, c, d, aa, ab, ac, ad, ae, af, ag]
    .map((v) => v.error || v.exito)
    .filter(Boolean);
  const msg = mensajes.at(-1);
  useEffect(() => {
    if ((a.exito || b.exito) && m) {
      const timer = window.setTimeout(() => setM(null), 250);
      return () => window.clearTimeout(timer);
    }
  }, [a.exito, b.exito, m]);
  return (
    <div className="grid gap-5">
      {msg ? (
        <p
          role="alert"
          className={`fixed right-5 top-5 z-[70] w-[min(90vw,28rem)] rounded-3xl border px-5 py-4 text-sm shadow-xl ${mensajes.some((_, i) => [a, b, c, d, aa, ab, ac, ad, ae, af, ag][i].error) ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {msg}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          {lista.length} de {profesionales.length} profesionales
        </p>
        <button
          onClick={() => setM("crear")}
          className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Crear profesional
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar profesional..."
          className="h-11 rounded-xl border px-4"
        />
        <select
          value={f}
          onChange={(e) => setF(e.target.value)}
          className="h-11 rounded-xl border px-4"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
        <div className="hidden grid-cols-[1fr_130px] gap-4 border-b border-[var(--line)] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#71816a] sm:grid">
          <span>Profesional</span>
          <span>Estado</span>
        </div>
        {lista.map((p) => (
          <Link
            key={p.id}
            href={`/profesionales/${p.id}`}
            className="grid w-full gap-2 border-b border-[var(--line)] px-5 py-4 text-left last:border-0 hover:bg-[var(--cream)] sm:grid-cols-[1fr_130px] sm:items-center"
          >
            <span>
              <strong>{p.nombre_completo}</strong>
              <small className="block text-xs text-[var(--muted)]">
                {p.descripcion || "Profesional"}
              </small>
            </span>
            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${p.estado === "activo" ? "bg-[var(--sage)]/55 text-[var(--forest)]" : "bg-slate-100 text-slate-500"}`}
            >
              {p.estado}
            </span>
          </Link>
        ))}
      </div>
      {m === "crear" ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/35 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setM(null)}
        >
          <section className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-[var(--paper)] shadow-2xl">
            <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <h2 className="font-[Fraunces] text-2xl">
                  {x ? "Editar profesional" : "Crear profesional"}
                </h2>
                <button
                  type="button"
                  onClick={() => setM(null)}
                  className="rounded-full border px-3 py-1 text-lg"
                >
                  ×
                </button>
              </div>
              <form action={x ? editar : crear} className="mt-6 grid gap-4">
                <input type="hidden" name="id" value={x?.id || ""} />
                <input
                  name="nombre"
                  required
                  defaultValue={x?.nombre_completo || ""}
                  placeholder="Nombre completo"
                  className="h-11 rounded-xl border px-3"
                />
                <textarea
                  name="descripcion"
                  defaultValue={x?.descripcion || ""}
                  placeholder="Descripción o especialidad"
                  className="rounded-xl border p-3"
                />
                <button className="h-11 rounded-full bg-[var(--forest)] text-white">
                  {x ? "Guardar cambios" : "Crear profesional"}
                </button>
                {x ? (
                  <>
                    <input
                      type="hidden"
                      name="estado"
                      value={x.estado === "activo" ? "inactivo" : "activo"}
                    />
                    <button
                      formAction={estado}
                      className="h-10 rounded-full border"
                    >
                      {x.estado === "activo" ? "Inactivar" : "Activar"}
                    </button>
                    <button
                      formAction={eliminar}
                      className="h-10 rounded-full border text-rose-700"
                    >
                      Eliminar profesional
                    </button>
                  </>
                ) : null}
              </form>
              {x ? (
                <div className="mt-8 grid gap-6 border-t pt-6">
                  <h3 className="text-lg font-semibold">
                    Servicios y disponibilidad
                  </h3>
                  <form
                    action={asignar}
                    className="grid gap-2 rounded-2xl bg-[var(--cream)] p-4 sm:grid-cols-[1fr_120px_auto]"
                  >
                    <input type="hidden" name="profesionalId" value={x.id} />
                    <select
                      name="servicioId"
                      required
                      className="h-10 rounded-xl border px-2"
                    >
                      <option value="">Selecciona servicio</option>
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} · {formatearModalidad(s.modalidad)}
                        </option>
                      ))}
                    </select>
                    <input
                      name="precio"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      placeholder="Precio"
                      className="h-10 rounded-xl border px-2"
                    />
                    <button className="rounded-full bg-[var(--forest)] px-4 text-white">
                      Asignar
                    </button>
                  </form>
                  {x.asignaciones.map((a) => (
                    <div key={a.id} className="rounded-2xl border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <b>{a.servicioNombre}</b>
                        <span>
                          {formatearModalidad(a.modalidad)} ·{" "}
                          {formatearImporte(a.precio)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {a.franjas.map((fr) => (
                          <div
                            key={fr.id}
                            className="inline-flex items-center rounded-full bg-[var(--sage)]/40 px-2 py-1 text-xs"
                          >
                            {dias[fr.dia]} {fr.inicio}-{fr.fin}{" "}
                            <form action={eliminarFranja} className="inline">
                              <input type="hidden" name="id" value={fr.id} />
                              <button className="ml-1">×</button>
                            </form>
                          </div>
                        ))}
                      </div>
                      <form
                        action={crearFranja}
                        className="mt-3 flex flex-wrap gap-2"
                      >
                        <input type="hidden" name="asignacionId" value={a.id} />
                        <select
                          name="dia"
                          className="h-9 rounded-lg border px-2"
                        >
                          {dias.slice(1).map((z, i) => (
                            <option key={z} value={i + 1}>
                              {z}
                            </option>
                          ))}
                        </select>
                        <input
                          name="inicio"
                          type="time"
                          required
                          className="h-9 rounded-lg border px-2"
                        />
                        <input
                          name="fin"
                          type="time"
                          required
                          className="h-9 rounded-lg border px-2"
                        />
                        <button className="rounded-full border px-3">
                          + Franja
                        </button>
                      </form>
                      <form action={editarAsig} className="mt-2 flex gap-2">
                        <input type="hidden" name="id" value={a.id} />
                        <input
                          name="precio"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={a.precio}
                          className="h-9 w-28 rounded-lg border px-2"
                        />
                        <input
                          type="hidden"
                          name="estado"
                          value={a.estado === "activo" ? "inactivo" : "activo"}
                        />
                        <button className="rounded-full border px-3">
                          {a.estado === "activo" ? "Inactivar" : "Activar"}
                        </button>
                        <button
                          formAction={eliminarAsig}
                          className="rounded-full border px-3 text-rose-700"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  ))}
                  <div className="rounded-2xl border p-4">
                    <b>Disponibilidad del profesional</b>
                    <div className="my-2 flex flex-wrap gap-2">
                      {x.disponibilidad.map((fr) => (
                        <div
                          key={fr.id}
                          className="inline-flex items-center rounded-full bg-[var(--sage)]/40 px-2 py-1 text-xs"
                        >
                          {dias[fr.dia]} {fr.inicio}-{fr.fin}
                          <form action={eliminarDisp} className="inline">
                            <input type="hidden" name="id" value={fr.id} />
                            <button className="ml-1">×</button>
                          </form>
                        </div>
                      ))}
                    </div>
                    <form action={crearDisp} className="flex flex-wrap gap-2">
                      <input type="hidden" name="profesionalId" value={x.id} />
                      <select name="dia" className="h-9 rounded-lg border px-2">
                        {dias.slice(1).map((z, i) => (
                          <option key={z} value={i + 1}>
                            {z}
                          </option>
                        ))}
                      </select>
                      <input
                        name="inicio"
                        type="time"
                        required
                        className="h-9 rounded-lg border px-2"
                      />
                      <input
                        name="fin"
                        type="time"
                        required
                        className="h-9 rounded-lg border px-2"
                      />
                      <button className="rounded-full border px-3">
                        + Franja
                      </button>
                    </form>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
