"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ServicioListado } from "./tipos-servicios";
import {
  crearServicioAccion,
  cambiarEstadoServicioAccion,
  editarServicioAccion,
  eliminarServicioAccion,
  type EstadoServicioAccion,
} from "./acciones-servicios";
import { formatearModalidad } from "@/lib/formato-presentacion";

export function ListaServicios({
  servicios,
}: {
  servicios: ServicioListado[];
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modal, setModal] = useState<ServicioListado | null | "crear">(null);
  const [mostrarBanner, setMostrarBanner] = useState(false);
  const [operacionEnCurso, setOperacionEnCurso] = useState(false);
  const [ultimaAccion, setUltimaAccion] = useState<
    "crear" | "editar" | "eliminar"
  >("crear");
  const [crearEstado, crear, pendienteCrear] = useActionState(
    crearServicioAccion,
    {} as EstadoServicioAccion,
  );
  const [editarEstado, editar, pendienteEditar] = useActionState(
    editarServicioAccion,
    {} as EstadoServicioAccion,
  );
  const [eliminarEstado, eliminar, pendienteEliminar] = useActionState(
    eliminarServicioAccion,
    {} as EstadoServicioAccion,
  );
  const [estadoEstado, cambiarEstado, pendienteEstado] = useActionState(
    cambiarEstadoServicioAccion,
    {} as EstadoServicioAccion,
  );
  const visibles = useMemo(
    () =>
      servicios.filter(
        (s) =>
          s.nombre.toLowerCase().includes(busqueda.toLowerCase().trim()) &&
          (filtro === "todos" || s.estado === filtro || s.modalidad === filtro),
      ),
    [servicios, busqueda, filtro],
  );
  const actual = modal && modal !== "crear" ? modal : null;
  const notificarAlEnviar = (accion: typeof ultimaAccion) => {
    setUltimaAccion(accion);
    setOperacionEnCurso(true);
    setMostrarBanner(true);
    window.setTimeout(() => {
      setMostrarBanner(false);
      router.refresh();
    }, 4000);
  };
  const resultadoActual = {
    crear: crearEstado,
    editar:
      editarEstado.exito || editarEstado.error ? editarEstado : estadoEstado,
    eliminar: eliminarEstado,
  }[ultimaAccion];
  useEffect(() => {
    if (operacionEnCurso && resultadoActual.exito) {
      const cierre = window.setTimeout(() => {
        setModal(null);
        setOperacionEnCurso(false);
      }, 100);
      return () => window.clearTimeout(cierre);
    }
  }, [operacionEnCurso, resultadoActual.exito]);
  return (
    <div className="grid gap-5">
      {mostrarBanner && (resultadoActual.exito || resultadoActual.error) ? (
        <p
          role={resultadoActual.error ? "alert" : "status"}
          className={`fixed right-5 top-5 z-[70] flex w-[min(90vw,28rem)] items-center gap-3 rounded-3xl border px-5 py-4 text-sm shadow-xl ${resultadoActual.error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {resultadoActual.error || resultadoActual.exito}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          {visibles.length} de {servicios.length} servicios
        </p>
        <button
          type="button"
          onClick={() => {
            setMostrarBanner(false);
            setModal("crear");
          }}
          className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Crear servicio
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar servicio..."
          className="h-11 rounded-xl border border-[var(--line)] px-4"
        />
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="h-11 rounded-xl border border-[var(--line)] px-4"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
          <option value="presencial">Presenciales</option>
          <option value="online">Online</option>
        </select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
        <div className="hidden grid-cols-[1fr_160px_110px] gap-4 border-b border-[var(--line)] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#71816a] sm:grid">
          <span>Servicio</span>
          <span>Modalidad</span>
          <span>Estado</span>
        </div>
        {visibles.length ? (
          visibles.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => {
                setMostrarBanner(false);
                setModal(s);
              }}
              className="grid w-full gap-2 border-b border-[var(--line)] px-5 py-4 text-left last:border-0 hover:bg-[var(--cream)] sm:grid-cols-[1fr_160px_110px] sm:items-center"
            >
              <span>
                <strong className="block text-sm">{s.nombre}</strong>
                <small className="text-xs text-[var(--muted)]">
                  {s.duracionMinutos} min
                </small>
              </span>
              <span className="text-sm">{formatearModalidad(s.modalidad)}</span>
              <span className="w-fit rounded-full bg-[var(--sage)]/55 px-3 py-1 text-xs font-semibold text-[var(--forest)]">
                {s.estado}
              </span>
            </button>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-[var(--muted)]">
            No encontramos servicios con esos filtros.
          </p>
        )}
      </div>
      {modal ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/35 p-4"
          onMouseDown={(evento) =>
            evento.target === evento.currentTarget && setModal(null)
          }
        >
          <section
            className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--paper)] shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <h2 className="font-[Fraunces] text-2xl font-semibold">
                  {actual ? "Editar servicio" : "Crear servicio"}
                </h2>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-full border px-3 py-1 text-lg"
                >
                  ×
                </button>
              </div>
              <form
                action={actual ? editar : crear}
                onSubmit={() => notificarAlEnviar(actual ? "editar" : "crear")}
                className="mt-6 grid gap-4"
              >
                <input type="hidden" name="id" value={actual?.id ?? ""} />
                <label className="grid gap-1 text-sm font-medium">
                  Nombre
                  <input
                    name="nombre"
                    defaultValue={actual?.nombre ?? ""}
                    required
                    className="h-11 rounded-xl border px-3"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Descripción
                  <textarea
                    name="descripcion"
                    defaultValue={actual?.descripcion ?? ""}
                    className="rounded-xl border p-3"
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Modalidad
                  <select
                    name="modalidad"
                    defaultValue={actual?.modalidad ?? "presencial"}
                    className="h-11 rounded-xl border px-3"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="online">Online</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Duración (minutos)
                  <input
                    name="duracion"
                    type="number"
                    min="5"
                    max="480"
                    defaultValue={actual?.duracionMinutos ?? ""}
                    required
                    className="h-11 rounded-xl border px-3"
                  />
                </label>
                <button
                  disabled={pendienteCrear || pendienteEditar}
                  className="h-11 rounded-full bg-[var(--forest)] text-sm font-semibold text-white"
                >
                  {actual ? "Guardar cambios" : "Crear servicio"}
                </button>
              </form>
              {actual ? (
                <form
                  action={cambiarEstado}
                  onSubmit={() => notificarAlEnviar("editar")}
                  className="mt-3"
                >
                  <input type="hidden" name="id" value={actual.id} />
                  <input
                    type="hidden"
                    name="estado"
                    value={actual.estado === "activo" ? "inactivo" : "activo"}
                  />
                  <button
                    disabled={pendienteEstado}
                    className="h-10 w-full rounded-full border text-sm font-semibold"
                  >
                    {actual.estado === "activo"
                      ? "Inactivar servicio"
                      : "Activar servicio"}
                  </button>
                </form>
              ) : null}
              {actual ? (
                <form
                  action={eliminar}
                  onSubmit={() => notificarAlEnviar("eliminar")}
                  className="mt-3"
                >
                  <input type="hidden" name="id" value={actual.id} />
                  <button
                    disabled={pendienteEliminar}
                    className="h-10 w-full rounded-full border text-sm font-semibold text-rose-700"
                  >
                    Eliminar servicio
                  </button>
                </form>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
