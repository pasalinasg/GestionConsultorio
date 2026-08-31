"use client";
import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  formatearImporte,
  formatearEntradaImporte,
  formatearModalidad,
} from "@/lib/formato-presentacion";
import {
  editarProfesionalAccion,
  cambiarEstadoProfesionalAccion,
  eliminarProfesionalAccion,
  type EstadoProfesional,
} from "./acciones-profesionales";
import {
  crearAsignacionAccion,
  editarAsignacionAccion,
  eliminarAsignacionAccion,
  crearDisponibilidadAccion,
  editarDisponibilidadAccion,
  eliminarDisponibilidadAccion,
  crearFranjaServicioAccion,
  editarFranjaServicioAccion,
  eliminarFranjaServicioAccion,
  type EstadoAsignacion,
} from "./acciones-asignaciones";
type S = { id: string; nombre: string; modalidad: string };
type F = { id: string; dia: number; inicio: string; fin: string };
type D = F & { estado: "activo" | "inactivo" };
type A = {
  id: string;
  servicioId: string;
  servicioNombre: string;
  modalidad: string;
  precio: number;
  estado: "activo" | "inactivo";
  franjas: Array<F & { estado?: "activo" | "inactivo" }>;
};
type P = {
  id: string;
  nombre_completo: string;
  descripcion: string | null;
  estado: "activo" | "inactivo";
  asignaciones: A[];
  disponibilidad: D[];
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
export function DetalleProfesional({
  profesional,
  servicios,
}: {
  profesional: P;
  servicios: S[];
}) {
  const [modal, setModal] = useState(false);
  const [servicioModal, setServicioModal] = useState<A | "nuevo" | null>(null);
  const [busquedaServicio, setBusquedaServicio] = useState("");
  const [estadoServicio, setEstadoServicio] = useState("todos");
  const [precioServicio, setPrecioServicio] = useState("");
  const [disponibilidadModal, setDisponibilidadModal] = useState<
    D | "nuevo" | null
  >(null);
  const [busquedaDisponibilidad, setBusquedaDisponibilidad] = useState("");
  const [estadoDisponibilidad, setEstadoDisponibilidad] = useState("todos");
  const [franjaModal, setFranjaModal] = useState<
    | (F & {
        estado?: "activo" | "inactivo";
        asignacionId: string;
        servicioNombre: string;
      })
    | "nuevo"
    | null
  >(null);
  const [busquedaFranja, setBusquedaFranja] = useState("");
  const [estadoFranja, setEstadoFranja] = useState("todos");
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    disponibilidad: false,
    servicios: false,
    franjas: false,
  });
  const [a, editar] = useActionState(
    editarProfesionalAccion,
    {} as EstadoProfesional,
  );
  const [b, estado] = useActionState(
    cambiarEstadoProfesionalAccion,
    {} as EstadoProfesional,
  );
  const [c, eliminar] = useActionState(
    eliminarProfesionalAccion,
    {} as EstadoProfesional,
  );
  const [d, asignar] = useActionState(
    crearAsignacionAccion,
    {} as EstadoAsignacion,
  );
  const [e, editarAsig] = useActionState(
    editarAsignacionAccion,
    {} as EstadoAsignacion,
  );
  const [f, eliminarAsig] = useActionState(
    eliminarAsignacionAccion,
    {} as EstadoAsignacion,
  );
  const [franjaResultado, setFranjaResultado] =
    useState<EstadoAsignacion | null>(null);
  const [notificacion, setNotificacion] = useState<string>();
  const ejecutarCrearFranja = async (formData: FormData) =>
    setFranjaResultado(await crearFranjaServicioAccion({}, formData));
  const ejecutarEliminarFranja = async (formData: FormData) =>
    setFranjaResultado(await eliminarFranjaServicioAccion({}, formData));
  const ejecutarEditarFranja = async (formData: FormData) =>
    setFranjaResultado(await editarFranjaServicioAccion({}, formData));
  const [resultadoDisponibilidad, setResultadoDisponibilidad] =
    useState<EstadoAsignacion | null>(null);
  const ejecutarDisponibilidad = async (formData: FormData) =>
    setResultadoDisponibilidad(await crearDisponibilidadAccion({}, formData));
  const ejecutarEliminarDisponibilidad = async (formData: FormData) =>
    setResultadoDisponibilidad(
      await eliminarDisponibilidadAccion({}, formData),
    );
  const ejecutarEditarDisponibilidad = async (formData: FormData) =>
    setResultadoDisponibilidad(await editarDisponibilidadAccion({}, formData));
  const resultado = [
    a,
    b,
    c,
    d,
    e,
    f,
    resultadoDisponibilidad ?? {},
    franjaResultado ?? {},
  ]
    .map((x) => x.error || x.exito)
    .filter(Boolean)
    .at(-1);
  const aviso = notificacion || resultado;
  useEffect(() => {
    const mensaje = [
      a,
      b,
      c,
      d,
      e,
      f,
      resultadoDisponibilidad ?? {},
      franjaResultado ?? {},
    ]
      .map((x) => x.error || x.exito)
      .filter(Boolean)
      .at(-1);
    if (!mensaje) return;
    const mostrar = window.setTimeout(() => setNotificacion(mensaje), 0);
    const ocultar = window.setTimeout(() => setNotificacion(undefined), 5000);
    return () => {
      window.clearTimeout(mostrar);
      window.clearTimeout(ocultar);
    };
  }, [a, b, c, d, e, f, resultadoDisponibilidad, franjaResultado]);
  useEffect(() => {
    if (resultadoDisponibilidad?.exito || franjaResultado?.exito) {
      const timer = window.setTimeout(() => {
        setDisponibilidadModal(null);
        setFranjaModal(null);
        setResultadoDisponibilidad(null);
        setFranjaResultado(null);
      }, 250);
      return () => window.clearTimeout(timer);
    }
  }, [resultadoDisponibilidad, franjaResultado]);
  const disponibilidadesVisibles = useMemo(
    () =>
      profesional.disponibilidad.filter(
        (x) =>
          `${dias[x.dia]} ${x.inicio} ${x.fin}`
            .toLowerCase()
            .includes(busquedaDisponibilidad.toLowerCase()) &&
          (estadoDisponibilidad === "todos" ||
            x.estado === estadoDisponibilidad),
      ),
    [profesional.disponibilidad, busquedaDisponibilidad, estadoDisponibilidad],
  );
  const franjas = profesional.asignaciones.flatMap((a) =>
    a.franjas.map((fr) => ({
      ...fr,
      asignacionId: a.id,
      servicioNombre: a.servicioNombre,
    })),
  );
  const franjasVisibles = franjas.filter(
    (fr) =>
      `${fr.servicioNombre} ${dias[fr.dia]} ${fr.inicio} ${fr.fin}`
        .toLowerCase()
        .includes(busquedaFranja.toLowerCase()) &&
      (estadoFranja === "todos" || (fr.estado ?? "activo") === estadoFranja),
  );
  const asignacionesVisibles = useMemo(
    () =>
      profesional.asignaciones.filter(
        (x) =>
          x.servicioNombre
            .toLowerCase()
            .includes(busquedaServicio.toLowerCase()) &&
          (estadoServicio === "todos" || x.estado === estadoServicio),
      ),
    [profesional.asignaciones, busquedaServicio, estadoServicio],
  );
  return (
    <div className="grid gap-6">
      {aviso ? (
        <p
          role="alert"
          className={`toast-temporal fixed right-5 top-5 z-[70] w-[min(90vw,28rem)] rounded-3xl border px-5 py-4 text-sm shadow-xl ${[a, b, c, d, e, f, resultadoDisponibilidad ?? {}, franjaResultado ?? {}].some((x) => x.error === aviso) ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {aviso}
        </p>
      ) : null}
      <Link
        href="/profesionales"
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[var(--forest)] hover:underline"
      >
        ← Volver a profesionales
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">
            Profesional
          </p>
          <h1 className="mt-2 font-[Fraunces] text-4xl">
            {profesional.nombre_completo}
          </h1>
          <p className="mt-2 text-[var(--muted)]">
            {profesional.descripcion || "Sin descripción"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModal(true)}
            className="rounded-full border px-4 py-2"
          >
            Editar profesional
          </button>
        </div>
      </header>
      <section className="relative grid gap-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 ${!seccionesAbiertas.disponibilidad ? "min-h-[90px]" : ""}`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">
              Paso 1
            </p>
            <h2 className="mt-1 text-xl font-semibold">Disponibilidad</h2>
            <p className="text-sm text-[var(--muted)]">
              {profesional.disponibilidad.length} franjas generales
            </p>
          </div>
          <button
            onClick={() => {
              setResultadoDisponibilidad(null);
              setDisponibilidadModal("nuevo");
            }}
            className="hidden rounded-full bg-[var(--forest)] px-4 py-2 text-sm font-semibold text-white"
          >
            + Nueva disponibilidad
          </button>
          <button
            type="button"
            aria-label="Contraer disponibilidad"
            onClick={() =>
              setSeccionesAbiertas((actual) => ({
                ...actual,
                disponibilidad: !actual.disponibilidad,
              }))
            }
            className="absolute right-5 top-5 border-0 bg-transparent p-0 text-sm font-bold leading-none text-[var(--forest)] hover:text-[var(--ink)]"
          >
            {seccionesAbiertas.disponibilidad ? "\u25B2" : "\u25B6"}
          </button>
        </div>
        {seccionesAbiertas.disponibilidad ? (
          <>
            <div className="grid gap-3 sm:grid-cols-[1fr_230px_auto]">
              <input
                value={busquedaDisponibilidad}
                onChange={(event) =>
                  setBusquedaDisponibilidad(event.target.value)
                }
                placeholder="Buscar día u horario..."
                className="h-11 rounded-xl border px-4"
              />
              <select
                value={estadoDisponibilidad}
                onChange={(event) =>
                  setEstadoDisponibilidad(event.target.value)
                }
                className="h-11 rounded-xl border px-4"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activas</option>
                <option value="inactivo">Inactivas</option>
              </select>
              <button
                onClick={() => {
                  setResultadoDisponibilidad(null);
                  setDisponibilidadModal("nuevo");
                }}
                className="rounded-full bg-[var(--forest)] px-5 py-2 text-sm font-semibold text-white"
              >
                + Nueva disponibilidad
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
              <div className="hidden grid-cols-[1fr_180px_130px] gap-4 border-b px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#71816a] sm:grid">
                <span>Día</span>
                <span>Horario</span>
                <span>Estado</span>
              </div>
              {disponibilidadesVisibles.map((x) => (
                <button
                  key={x.id}
                  onClick={() => {
                    setResultadoDisponibilidad(null);
                    setDisponibilidadModal(x);
                  }}
                  className="grid w-full gap-2 border-b px-5 py-4 text-left last:border-0 hover:bg-[var(--cream)] sm:grid-cols-[1fr_180px_130px] sm:items-center"
                >
                  <span className="font-semibold">{dias[x.dia]}</span>
                  <span>
                    {x.inicio}–{x.fin}
                  </span>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${x.estado === "activo" ? "bg-[var(--sage)]/55 text-[var(--forest)]" : "bg-slate-100 text-slate-500"}`}
                  >
                    {x.estado}
                  </span>
                </button>
              ))}
              {!disponibilidadesVisibles.length ? (
                <p className="px-5 py-8 text-sm text-[var(--muted)]">
                  No hay disponibilidad que coincida con la búsqueda.
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </section>
      <section className="relative grid gap-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 ${!seccionesAbiertas.servicios ? "min-h-[90px]" : ""}`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">
              Paso 2
            </p>
            <h2 className="mt-1 text-xl font-semibold">Servicios asignados</h2>
            <p className="text-sm text-[var(--muted)]">
              {profesional.asignaciones.length} servicios configurados
            </p>
          </div>
          <button
            onClick={() => {
              setPrecioServicio("");
              setServicioModal("nuevo");
            }}
            className="hidden rounded-full bg-[var(--forest)] px-4 py-2 text-sm font-semibold text-white"
          >
            + Nuevo servicio
          </button>
          <button
            type="button"
            aria-label="Contraer servicios"
            onClick={() =>
              setSeccionesAbiertas((actual) => ({
                ...actual,
                servicios: !actual.servicios,
              }))
            }
            className="absolute right-5 top-5 border-0 bg-transparent p-0 text-sm font-bold leading-none text-[var(--forest)] hover:text-[var(--ink)]"
          >
            {seccionesAbiertas.servicios ? "\u25B2" : "\u25B6"}
          </button>
        </div>
        {seccionesAbiertas.servicios ? (
          <>
            <div className="grid gap-3 sm:grid-cols-[1fr_230px_auto]">
              <input
                value={busquedaServicio}
                onChange={(event) => setBusquedaServicio(event.target.value)}
                placeholder="Buscar servicio..."
                className="h-11 rounded-xl border px-4"
              />
              <select
                value={estadoServicio}
                onChange={(event) => setEstadoServicio(event.target.value)}
                className="h-11 rounded-xl border px-4"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
              <button
                onClick={() => {
                  setPrecioServicio("");
                  setServicioModal("nuevo");
                }}
                className="rounded-full bg-[var(--forest)] px-5 py-2 text-sm font-semibold text-white"
              >
                + Nuevo servicio
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
              <div className="hidden grid-cols-[1fr_180px_130px] gap-4 border-b px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#71816a] sm:grid">
                <span>Servicio</span>
                <span>Modalidad</span>
                <span>Estado</span>
              </div>
              {asignacionesVisibles.map((x) => (
                <button
                  key={x.id}
                  onClick={() => {
                    setPrecioServicio(
                      formatearEntradaImporte(String(x.precio)),
                    );
                    setServicioModal(x);
                  }}
                  className="grid w-full gap-2 border-b px-5 py-4 text-left last:border-0 hover:bg-[var(--cream)] sm:grid-cols-[1fr_180px_130px] sm:items-center"
                >
                  <span>
                    <strong>{x.servicioNombre}</strong>
                    <small className="block text-xs text-[var(--muted)]">
                      Precio {formatearImporte(x.precio)} · {x.franjas.length}{" "}
                      franjas
                    </small>
                  </span>
                  <span>{formatearModalidad(x.modalidad)}</span>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${x.estado === "activo" ? "bg-[var(--sage)]/55 text-[var(--forest)]" : "bg-slate-100 text-slate-500"}`}
                  >
                    {x.estado}
                  </span>
                </button>
              ))}
              {!asignacionesVisibles.length ? (
                <p className="px-5 py-8 text-sm text-[var(--muted)]">
                  No hay servicios asignados que coincidan con la búsqueda.
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </section>
      <section className="hidden grid gap-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Servicios asignados</h2>
          <span className="text-sm text-[var(--muted)]">
            {profesional.asignaciones.length} servicios
          </span>
        </div>
        <form
          action={asignar}
          className="grid gap-2 rounded-2xl bg-[var(--cream)] p-4 sm:grid-cols-[1fr_140px_auto]"
        >
          <input type="hidden" name="profesionalId" value={profesional.id} />
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
            Asignar servicio
          </button>
        </form>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-[#71816a]">
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3">Modalidad</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profesional.asignaciones.map((x) => (
                <tr key={x.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-semibold">
                    {x.servicioNombre}
                  </td>
                  <td className="px-4 py-3">
                    {formatearModalidad(x.modalidad)}
                  </td>
                  <td className="px-4 py-3">
                    <form action={editarAsig} className="flex gap-2">
                      <input type="hidden" name="id" value={x.id} />
                      <input
                        name="precio"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={x.precio}
                        className="h-9 w-28 rounded-lg border px-2"
                      />
                      <input
                        type="hidden"
                        name="estado"
                        value={x.estado === "activo" ? "inactivo" : "activo"}
                      />
                      <button className="rounded-full border px-3">
                        Guardar
                      </button>
                      <button
                        formAction={eliminarAsig}
                        className="rounded-full border px-3 text-rose-700"
                      >
                        Eliminar
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">{x.estado}</td>
                  <td className="px-4 py-3">{x.franjas.length} franjas</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="hidden grid gap-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Disponibilidad del profesional
          </h2>
          <span className="text-sm text-[var(--muted)]">
            {profesional.disponibilidad.length} franjas
          </span>
        </div>
        <form action={ejecutarDisponibilidad} className="flex flex-wrap gap-2">
          <input type="hidden" name="profesionalId" value={profesional.id} />
          <select name="dia" className="h-10 rounded-lg border px-2">
            {dias.slice(1).map((x, n) => (
              <option key={x} value={n + 1}>
                {x}
              </option>
            ))}
          </select>
          <input
            name="inicio"
            type="time"
            required
            className="h-10 rounded-lg border px-2"
          />
          <input
            name="fin"
            type="time"
            required
            className="h-10 rounded-lg border px-2"
          />
          <button className="rounded-full bg-[var(--forest)] px-4 text-white">
            Agregar franja
          </button>
        </form>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {profesional.disponibilidad.map((x) => (
            <div
              key={x.id}
              className="flex items-center justify-between rounded-xl border p-3"
            >
              <span>
                {dias[x.dia]} · {x.inicio}–{x.fin}
              </span>
              <form action={ejecutarEliminarDisponibilidad}>
                <input type="hidden" name="id" value={x.id} />
                <button className="text-rose-700">Eliminar</button>
              </form>
            </div>
          ))}
        </div>
      </section>
      <section className="relative grid gap-5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <div
          className={`flex items-center justify-between gap-3 ${!seccionesAbiertas.franjas ? "min-h-[90px]" : ""}`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">
              Paso 3
            </p>
            <h2 className="mt-1 text-xl font-semibold">Franjas del servicio</h2>
            <p className="text-sm text-[var(--muted)]">
              Horarios específicos para cada servicio
            </p>
          </div>
          <button
            type="button"
            aria-label="Contraer franjas del servicio"
            onClick={() =>
              setSeccionesAbiertas((actual) => ({
                ...actual,
                franjas: !actual.franjas,
              }))
            }
            className="absolute right-5 top-5 border-0 bg-transparent p-0 text-sm font-bold leading-none text-[var(--forest)] hover:text-[var(--ink)]"
          >
            {seccionesAbiertas.franjas ? "\u25B2" : "\u25B6"}
          </button>
        </div>
        {seccionesAbiertas.franjas ? (
          <>
            <div className="grid gap-3 sm:grid-cols-[1fr_230px_auto]">
              <input
                value={busquedaFranja}
                onChange={(event) => setBusquedaFranja(event.target.value)}
                placeholder="Buscar servicio, día u horario..."
                className="h-11 rounded-xl border px-4"
              />
              <select
                value={estadoFranja}
                onChange={(event) => setEstadoFranja(event.target.value)}
                className="h-11 rounded-xl border px-4"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activas</option>
                <option value="inactivo">Inactivas</option>
              </select>
              <button
                onClick={() => setFranjaModal("nuevo")}
                className="rounded-full bg-[var(--forest)] px-5 py-2 text-sm font-semibold text-white"
              >
                + Nueva franja
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
              <div className="hidden grid-cols-[1fr_180px_130px] gap-4 border-b px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#71816a] sm:grid">
                <span>Servicio</span>
                <span>Horario</span>
                <span>Estado</span>
              </div>
              {franjasVisibles.map((fr) => (
                <button
                  key={fr.id}
                  onClick={() => setFranjaModal(fr)}
                  className="grid w-full gap-2 border-b px-5 py-4 text-left last:border-0 hover:bg-[var(--cream)] sm:grid-cols-[1fr_180px_130px] sm:items-center"
                >
                  <span className="font-semibold">{fr.servicioNombre}</span>
                  <span>
                    {dias[fr.dia]} · {fr.inicio}–{fr.fin}
                  </span>
                  <span className="w-fit rounded-full bg-[var(--sage)]/55 px-3 py-1 text-xs font-semibold text-[var(--forest)]">
                    {fr.estado ?? "activo"}
                  </span>
                </button>
              ))}
              {!franjasVisibles.length ? (
                <p className="px-5 py-8 text-sm text-[var(--muted)]">
                  No hay franjas que coincidan con la búsqueda.
                </p>
              ) : null}
            </div>{" "}
          </>
        ) : null}
      </section>
      {franjaModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/35 p-4">
          <section className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--paper)] shadow-2xl">
            <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <h2 className="font-[Fraunces] text-2xl">
                  {franjaModal === "nuevo"
                    ? "Nueva franja del servicio"
                    : "Editar franja del servicio"}
                </h2>
                <button
                  type="button"
                  onClick={() => setFranjaModal(null)}
                  className="rounded-full border px-3 py-1"
                >
                  ×
                </button>
              </div>
              {franjaModal === "nuevo" ? (
                <form action={ejecutarCrearFranja} className="mt-5 grid gap-4">
                  <select
                    name="asignacionId"
                    required
                    className="h-11 rounded-xl border px-3"
                  >
                    <option value="">Selecciona servicio</option>
                    {profesional.asignaciones.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.servicioNombre}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {dias.slice(1).map((dia, index) => (
                      <label
                        key={dia}
                        className="flex items-center gap-2 rounded-xl border p-2 text-sm"
                      >
                        <input type="checkbox" name="dias" value={index + 1} />
                        {dia}
                      </label>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      name="inicio"
                      type="time"
                      required
                      className="h-11 rounded-xl border px-3"
                    />
                    <input
                      name="fin"
                      type="time"
                      required
                      className="h-11 rounded-xl border px-3"
                    />
                  </div>
                  <button className="h-11 rounded-full bg-[var(--forest)] text-white">
                    Guardar franja
                  </button>
                </form>
              ) : (
                <div className="mt-5 grid gap-3">
                  <form action={ejecutarEditarFranja} className="grid gap-4">
                    <input type="hidden" name="id" value={franjaModal.id} />
                    <select
                      name="dia"
                      defaultValue={franjaModal.dia}
                      className="h-11 rounded-xl border px-3"
                    >
                      {dias.slice(1).map((dia, index) => (
                        <option key={dia} value={index + 1}>
                          {dia}
                        </option>
                      ))}
                    </select>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        name="inicio"
                        type="time"
                        defaultValue={franjaModal.inicio}
                        required
                        className="h-11 rounded-xl border px-3"
                      />
                      <input
                        name="fin"
                        type="time"
                        defaultValue={franjaModal.fin}
                        required
                        className="h-11 rounded-xl border px-3"
                      />
                    </div>
                    <input
                      type="hidden"
                      name="estado"
                      value={franjaModal.estado ?? "activo"}
                    />
                    <button className="h-11 rounded-full bg-[var(--forest)] text-white">
                      Guardar cambios
                    </button>
                  </form>
                  <form action={ejecutarEditarFranja}>
                    <input type="hidden" name="id" value={franjaModal.id} />
                    <input type="hidden" name="dia" value={franjaModal.dia} />
                    <input
                      type="hidden"
                      name="inicio"
                      value={franjaModal.inicio}
                    />
                    <input type="hidden" name="fin" value={franjaModal.fin} />
                    <input
                      type="hidden"
                      name="estado"
                      value={
                        franjaModal.estado === "activo" ? "inactivo" : "activo"
                      }
                    />
                    <button className="h-11 w-full rounded-full border">
                      {franjaModal.estado === "activo"
                        ? "Inactivar franja"
                        : "Activar franja"}
                    </button>
                  </form>
                  <form action={ejecutarEliminarFranja}>
                    <input type="hidden" name="id" value={franjaModal.id} />
                    <button className="h-11 w-full rounded-full border text-rose-700">
                      Eliminar franja
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
      {disponibilidadModal ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/35 p-4"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setDisponibilidadModal(null)
          }
        >
          <section className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--paper)] shadow-2xl">
            <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <h2 className="font-[Fraunces] text-2xl">
                  {disponibilidadModal === "nuevo"
                    ? "Nueva disponibilidad"
                    : "Editar disponibilidad"}
                </h2>
                <button
                  type="button"
                  onClick={() => setDisponibilidadModal(null)}
                  className="rounded-full border px-3 py-1 text-lg"
                >
                  ×
                </button>
              </div>
              {disponibilidadModal === "nuevo" ? (
                <form
                  action={ejecutarDisponibilidad}
                  className="mt-5 grid gap-4"
                >
                  <input
                    type="hidden"
                    name="profesionalId"
                    value={profesional.id}
                  />
                  <fieldset className="grid gap-2">
                    <legend className="text-sm font-semibold">
                      Días disponibles
                    </legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {dias.slice(1).map((dia, index) => (
                        <label
                          key={dia}
                          className="flex items-center gap-2 rounded-xl border p-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            name="dias"
                            value={index + 1}
                          />
                          {dia}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm">
                      Desde
                      <input
                        name="inicio"
                        type="time"
                        required
                        className="h-11 rounded-xl border px-3"
                      />
                    </label>
                    <label className="grid gap-1 text-sm">
                      Hasta
                      <input
                        name="fin"
                        type="time"
                        required
                        className="h-11 rounded-xl border px-3"
                      />
                    </label>
                  </div>
                  <button className="h-11 rounded-full bg-[var(--forest)] text-white">
                    Guardar disponibilidad
                  </button>
                </form>
              ) : (
                <div className="mt-5 grid gap-3">
                  <form
                    action={ejecutarEditarDisponibilidad}
                    className="grid gap-4"
                  >
                    <input
                      type="hidden"
                      name="id"
                      value={disponibilidadModal.id}
                    />
                    <label className="grid gap-1 text-sm">
                      Día
                      <select
                        name="dia"
                        defaultValue={disponibilidadModal.dia}
                        className="h-11 rounded-xl border px-3"
                      >
                        {dias.slice(1).map((dia, index) => (
                          <option key={dia} value={index + 1}>
                            {dia}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm">
                        Desde
                        <input
                          name="inicio"
                          type="time"
                          defaultValue={disponibilidadModal.inicio}
                          required
                          className="h-11 rounded-xl border px-3"
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        Hasta
                        <input
                          name="fin"
                          type="time"
                          defaultValue={disponibilidadModal.fin}
                          required
                          className="h-11 rounded-xl border px-3"
                        />
                      </label>
                    </div>
                    <input
                      type="hidden"
                      name="estado"
                      value={disponibilidadModal.estado}
                    />
                    <button className="h-11 rounded-full bg-[var(--forest)] text-white">
                      Guardar cambios
                    </button>
                  </form>
                  <form action={ejecutarEditarDisponibilidad}>
                    <input
                      type="hidden"
                      name="id"
                      value={disponibilidadModal.id}
                    />
                    <input
                      type="hidden"
                      name="dia"
                      value={disponibilidadModal.dia}
                    />
                    <input
                      type="hidden"
                      name="inicio"
                      value={disponibilidadModal.inicio}
                    />
                    <input
                      type="hidden"
                      name="fin"
                      value={disponibilidadModal.fin}
                    />
                    <input
                      type="hidden"
                      name="estado"
                      value={
                        disponibilidadModal.estado === "activo"
                          ? "inactivo"
                          : "activo"
                      }
                    />
                    <button className="h-11 w-full rounded-full border">
                      {disponibilidadModal.estado === "activo"
                        ? "Inactivar disponibilidad"
                        : "Activar disponibilidad"}
                    </button>
                  </form>
                  <form action={ejecutarEliminarDisponibilidad}>
                    <input
                      type="hidden"
                      name="id"
                      value={disponibilidadModal.id}
                    />
                    <button className="h-11 w-full rounded-full border text-rose-700">
                      Eliminar disponibilidad
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
      {servicioModal ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/35 p-4"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setServicioModal(null)
          }
        >
          <section className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--paper)] shadow-2xl">
            <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <h2 className="font-[Fraunces] text-2xl">
                  {servicioModal === "nuevo"
                    ? "Nuevo servicio asignado"
                    : "Editar servicio asignado"}
                </h2>
                <button
                  type="button"
                  onClick={() => setServicioModal(null)}
                  className="rounded-full border px-3 py-1 text-lg"
                >
                  ×
                </button>
              </div>
              {servicioModal === "nuevo" ? (
                <form action={asignar} className="mt-5 grid gap-4">
                  <input
                    type="hidden"
                    name="profesionalId"
                    value={profesional.id}
                  />
                  <select
                    name="servicioId"
                    required
                    className="h-11 rounded-xl border px-3"
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
                    inputMode="numeric"
                    required
                    placeholder="Precio"
                    value={precioServicio}
                    onChange={(event) =>
                      setPrecioServicio(
                        formatearEntradaImporte(event.target.value),
                      )
                    }
                    className="h-11 rounded-xl border px-3"
                  />
                  <button className="h-11 rounded-full bg-[var(--forest)] text-white">
                    Asignar servicio
                  </button>
                </form>
              ) : (
                <div className="mt-5 grid gap-3">
                  <form action={editarAsig} className="grid gap-3">
                    <input type="hidden" name="id" value={servicioModal.id} />
                    <label className="grid gap-1 text-sm">
                      Precio (Gs.)
                      <input
                        name="precio"
                        inputMode="numeric"
                        value={precioServicio}
                        onChange={(event) =>
                          setPrecioServicio(
                            formatearEntradaImporte(event.target.value),
                          )
                        }
                        className="h-11 rounded-xl border px-3"
                      />
                    </label>
                    <input
                      type="hidden"
                      name="estado"
                      value={servicioModal.estado}
                    />
                    <button className="h-11 rounded-full bg-[var(--forest)] text-white">
                      Guardar cambios
                    </button>
                  </form>
                  <form action={editarAsig}>
                    <input type="hidden" name="id" value={servicioModal.id} />
                    <input type="hidden" name="precio" value={precioServicio} />
                    <input
                      type="hidden"
                      name="estado"
                      value={
                        servicioModal.estado === "activo"
                          ? "inactivo"
                          : "activo"
                      }
                    />
                    <button className="h-11 w-full rounded-full border">
                      {servicioModal.estado === "activo"
                        ? "Inactivar servicio"
                        : "Activar servicio"}
                    </button>
                  </form>
                  <form action={eliminarAsig}>
                    <input type="hidden" name="id" value={servicioModal.id} />
                    <button className="h-11 w-full rounded-full border text-rose-700">
                      Eliminar asignación
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
      {modal && !a.exito ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/35 p-4">
          <section className="w-full max-w-lg rounded-3xl bg-[var(--paper)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="font-[Fraunces] text-2xl">Editar profesional</h2>
              <button
                onClick={() => setModal(false)}
                className="rounded-full border px-3 py-1"
              >
                ×
              </button>
            </div>
            <form action={editar} className="mt-5 grid gap-4">
              <input type="hidden" name="id" value={profesional.id} />
              <input
                name="nombre"
                defaultValue={profesional.nombre_completo}
                required
                className="h-11 rounded-xl border px-3"
              />
              <textarea
                name="descripcion"
                defaultValue={profesional.descripcion || ""}
                className="rounded-xl border p-3"
              />
              <button className="h-11 rounded-full bg-[var(--forest)] text-white">
                Guardar cambios
              </button>
            </form>
            <form action={estado} className="mt-3">
              <input type="hidden" name="id" value={profesional.id} />
              <input
                type="hidden"
                name="estado"
                value={profesional.estado === "activo" ? "inactivo" : "activo"}
              />
              <button className="w-full rounded-full border py-2">
                {profesional.estado === "activo" ? "Inactivar" : "Activar"}
              </button>
            </form>
            <form action={eliminar} className="mt-3">
              <input type="hidden" name="id" value={profesional.id} />
              <button className="w-full rounded-full border py-2 text-rose-700">
                Eliminar profesional
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
