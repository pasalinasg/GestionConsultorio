"use client";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TurnoListado } from "./tipos-agenda";
import {
  crearTurnoAccion,
  cambiarEstadoTurnoAccion,
  type EstadoAgendaAccion,
} from "./acciones-agenda";
type Opcion = {
  id: string;
  profesionalId?: string;
  profesional: string;
  servicio: string;
  modalidad: string;
  precio: number;
  duracion?: number;
  descripcionProfesional?: string | null;
  descripcion?: string | null;
};
type Franja = { asignacionId: string; dia: number; inicio: string; fin: string };
type Paciente = {
  id: string;
  nombreApellido: string;
  documento: string;
  telefono: string;
  sexo: string;
  estado: string;
};
function formatearFecha(valor: string) {
  const [fecha, hora] = valor.slice(0, 16).split("T");
  if (!fecha || !hora) return valor;
  return `${fecha.split("-").reverse().join("/")}, ${hora}`;
}
function sumarMinutos(fecha: string, hora: string, minutos: number) { const base = new Date(`${fecha}T${hora}:00`); base.setMinutes(base.getMinutes() + minutos); return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}T${String(base.getHours()).padStart(2, "0")}:${String(base.getMinutes()).padStart(2, "0")}`; }
export function AgendaInterna({
  turnos,
  opciones,
  pacientes,
  franjas,
}: {
  turnos: TurnoListado[];
  opciones: Opcion[];
  pacientes: Paciente[];
  franjas: Franja[];
}) {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [paso, setPaso] = useState(1);
  const [documento, setDocumento] = useState("");
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [telefonoNuevo, setTelefonoNuevo] = useState("");
  const [sexoNuevo, setSexoNuevo] = useState("");
  const [encontrado, setEncontrado] = useState<Paciente | null>(null);
  const [profesional, setProfesional] = useState("");
  const [opcion, setOpcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [accion, setAccion] = useState<"crear" | "estado">("crear");
  const [banner, setBanner] = useState(false);
  const [crearEstado, crear, pendienteCrear] = useActionState(
    crearTurnoAccion,
    {} as EstadoAgendaAccion,
  );
  const [estadoEstado, cambiar, pendienteCambiar] = useActionState(
    cambiarEstadoTurnoAccion,
    {} as EstadoAgendaAccion,
  );
  const resultado = accion === "crear" ? crearEstado : estadoEstado;
  const visibles = useMemo(
    () =>
      turnos.filter(
        (t) =>
          `${t.paciente} ${t.profesional} ${t.servicio}`
            .toLowerCase()
            .includes(busqueda.toLowerCase()) &&
          (filtro === "todos" || t.estado === filtro),
      ),
    [turnos, busqueda, filtro],
  );
  const horasDisponibles = useMemo(() => { const seleccion = opciones.find((o) => o.id === opcion); const duracion = seleccion?.duracion ?? 30; if (!fecha || !opcion) return []; const dia = new Date(`${fecha}T12:00:00`).getDay() || 7; const minutos = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3)); const resultado: string[] = []; for (const franja of franjas.filter((f) => f.asignacionId === opcion && f.dia === dia)) { for (let m = minutos(franja.inicio); m + duracion <= minutos(franja.fin); m += duracion) { const h = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; const inicio = new Date(`${fecha}T${h}`).getTime(); const ocupado = turnos.some((t) => (t.profesionalId === seleccion?.profesionalId || t.profesional === seleccion?.profesional) && !["rechazada", "vencida", "cancelada"].includes(t.estado) && new Date(t.inicio).getTime() < inicio + duracion * 60000 && new Date(t.fin).getTime() > inicio); if (!ocupado) resultado.push(h); } } return resultado; }, [fecha, opcion, opciones, franjas, turnos]);
  useEffect(() => {
    if (!banner || (!resultado.exito && !resultado.error)) return;
    const t = window.setTimeout(
      () => {
        setBanner(false);
        if (resultado.exito) {
          setModal(false);
          router.refresh();
        }
      },
      resultado.exito ? 1800 : 5000,
    );
    return () => window.clearTimeout(t);
  }, [banner, resultado.exito, resultado.error, router]);
  const abrir = () => {
    setPaso(1);
    setDocumento("");
    setEncontrado(null);
    setNombreNuevo(""); setTelefonoNuevo(""); setSexoNuevo("");
    setProfesional("");
    setOpcion("");
    setFecha(new Date().toISOString().slice(0, 10));
    setHora("");
    setBanner(false);
    setModal(true);
  };
  const buscar = () => {
    const p = pacientes.find(
      (x) => x.documento.replace(/\D/g, "") === documento.replace(/\D/g, ""),
    );
    setEncontrado(p ?? null);
    setPaso(2);
  };
  return (
    <div className="grid gap-5">
      {banner && (resultado.exito || resultado.error) ? (
        <p
          role={resultado.error ? "alert" : "status"}
          className={`fixed right-5 top-5 z-[70] w-[min(90vw,30rem)] rounded-3xl border px-5 py-4 text-sm shadow-xl ${resultado.error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {resultado.error || resultado.exito}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          {visibles.length} de {turnos.length} turnos
        </p>
        <button
          type="button"
          onClick={abrir}
          className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Nuevo turno
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar paciente, profesional..."
          className="h-11 rounded-xl border border-[var(--line)] px-4"
        />
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="h-11 rounded-xl border border-[var(--line)] px-4"
        >
          <option value="todos">Todos los estados</option>
          {[
            "pendiente",
            "confirmada",
            "rechazada",
            "vencida",
            "cancelada",
            "atendida",
            "no_asistio",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
        {visibles.map((t) => (
          <div
            key={t.id}
            className="grid gap-2 border-b border-[var(--line)] px-5 py-4 last:border-0 sm:grid-cols-[1.2fr_1fr_1fr_180px]"
          >
            <span>
              <strong className="block">{t.paciente}</strong>
              <small className="text-[var(--muted)]">
                {formatearFecha(t.inicio)}
              </small>
            </span>
            <span>{t.profesional}</span>
            <span>{t.servicio}</span>
            <form
              action={cambiar}
              onSubmit={() => {
                setAccion("estado");
                setBanner(true);
              }}
              className="flex gap-2"
            >
              <input type="hidden" name="id" value={t.id} />
              <select
                name="estado"
                defaultValue={t.estado}
                disabled={pendienteCambiar}
                className="h-9 rounded-lg border border-[var(--line)] px-2 text-xs"
              >
                {[
                  "pendiente",
                  "confirmada",
                  "rechazada",
                  "vencida",
                  "cancelada",
                  "atendida",
                  "no_asistio",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <button className="text-xs font-semibold text-[var(--forest)]">
                Guardar
              </button>
            </form>
          </div>
        ))}
        {!visibles.length ? (
          <p className="p-10 text-center text-sm text-[var(--muted)]">
            Todavía no hay turnos registrados.
          </p>
        ) : null}
      </div>
      {modal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/35 p-4">
          <section className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-[var(--paper)] shadow-2xl">
            <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="relative flex items-center justify-center border-b border-[var(--line)] pb-5 text-center">
                {paso > 1 ? <button type="button" aria-label="Volver al paso anterior" onClick={() => setPaso((valor) => valor - 1)} className="absolute left-0 top-1 text-2xl leading-none text-[var(--forest)]">←</button> : null}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--forest)]">
                    Paso {paso} de 5
                  </p>
                  <h2 className="font-[Fraunces] text-2xl font-semibold">
                    Nuevo turno
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="absolute right-0 top-0 rounded-full border px-3 py-1 text-lg"
                >
                  ×
                </button>
              </div>
              {paso === 1 ? (
                <div className="mt-6 grid gap-4">
                  <label className="grid gap-1 text-sm font-medium">
                    Cédula del paciente
                    <input
                      value={documento}
                      onChange={(e) => setDocumento(e.target.value)}
                      className="h-11 rounded-xl border border-[var(--line)] px-3"
                      placeholder="Sin puntos ni guiones"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={!documento.trim()}
                    onClick={buscar}
                    className="h-11 rounded-full bg-[var(--forest)] text-sm font-semibold text-white"
                  >
                    Siguiente
                  </button>
                </div>
              ) : null}
              {paso === 2 ? (
                <div className="mt-6 grid gap-4">
                  {encontrado ? (
                    <div className="grid gap-3"><p className="rounded-2xl bg-[var(--cream)] p-4 text-sm">
                      Paciente encontrado:{" "}
                      <strong>{encontrado.nombreApellido}</strong>
                      <br />
                      Tiene{" "}
                      {
                        turnos.filter(
                          (t) =>
                            t.paciente === encontrado.nombreApellido &&
                            !["rechazada", "vencida", "cancelada"].includes(
                              t.estado,
                            ),
                        ).length
                      }{" "}
                      cita(s) vigente(s).
                    </p>{turnos.filter((t) => t.paciente === encontrado.nombreApellido && !["rechazada", "vencida", "cancelada"].includes(t.estado)).map((t) => <form key={t.id} action={cambiar} onSubmit={() => { setAccion("estado"); setBanner(true); }} className="grid gap-2 rounded-xl border border-[var(--line)] p-3 text-sm sm:grid-cols-[1fr_1fr_120px_80px] sm:items-center"><span><small className="block text-xs uppercase tracking-wider text-[var(--muted)]">Profesional</small><strong>{t.profesional}</strong></span><span><small className="block text-xs uppercase tracking-wider text-[var(--muted)]">Servicio</small><strong>{t.servicio}</strong></span><span><small className="block text-xs uppercase tracking-wider text-[var(--muted)]">Hora</small>{formatearFecha(t.inicio)}</span><><input type="hidden" name="id" value={t.id} /><input type="hidden" name="estado" value="cancelada" /><button className="text-xs font-medium text-[var(--muted)] hover:text-rose-700">Cancelar</button></></form>)}</div>
                  ) : (
                    <>
                      <p className="text-sm text-[var(--muted)]">
                        No existe un paciente con esa cédula. Completa sus datos
                        básicos.
                      </p>
                      <input
                        value={nombreNuevo}
                        onChange={(e) => setNombreNuevo(e.target.value)}
                        required
                        placeholder="Nombre y apellido"
                        className="h-11 rounded-xl border border-[var(--line)] px-3"
                      />
                      <input
                        value={telefonoNuevo}
                        onChange={(e) => setTelefonoNuevo(e.target.value)}
                        required
                        placeholder="WhatsApp"
                        className="h-11 rounded-xl border border-[var(--line)] px-3"
                      />
                      <select
                        value={sexoNuevo}
                        onChange={(e) => setSexoNuevo(e.target.value)}
                        required
                        className="h-11 rounded-xl border border-[var(--line)] px-3"
                      >
                        <option value="">Sexo</option>
                        <option value="femenino">Femenino</option>
                        <option value="masculino">Masculino</option>
                        <option value="otro">Otro</option>
                      </select>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setPaso(3)}
                    className="h-11 rounded-full bg-[var(--forest)] text-sm font-semibold text-white"
                  >
                    Siguiente
                  </button>
                </div>
              ) : null}
              {paso === 3 ? (
                <div className="mt-6 grid gap-4">
                  <p className="text-sm text-[var(--muted)]">
                    Selecciona profesional
                  </p>
                  <div className="grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(340px,1fr))]">{[...new Set(opciones.map((o) => o.profesional))].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => {
                        setProfesional(p);
                        setPaso(4);
                      }}
                      className="flex cursor-pointer items-center gap-4 rounded-2xl border border-[var(--line)] p-4 text-left transition hover:border-[var(--forest)] hover:bg-[var(--cream)]"
                    >
                      <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-[var(--sage)] font-[Fraunces] text-4xl text-[var(--forest)]">{p.slice(0, 1).toUpperCase()}</span><span><strong className="block font-[Fraunces] text-2xl leading-tight text-[var(--ink)]">{p}</strong><span className="mt-2 block text-sm leading-relaxed text-[var(--muted)]">{opciones.find((o) => o.profesional === p)?.descripcionProfesional || "Profesional de tu consultorio."}</span></span>
                    </button>
                  ))}</div>
                </div>
              ) : null}
              {paso === 4 ? (
                <div className="mt-6 grid gap-4">
                  <p className="text-sm text-[var(--muted)]">
                    Servicios disponibles
                  </p>
                  <div className="grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(340px,1fr))]">{opciones
                    .filter((o) => o.profesional === profesional)
                    .map((o) => (
                      <button
                        type="button"
                        key={o.id}
                        onClick={() => {
                          setOpcion(o.id);
                          setPaso(5);
                        }}
                        className="min-h-64 cursor-pointer rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5 text-left transition hover:border-[var(--forest)]"
                      >
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--forest)]">{o.modalidad} · {o.duracion ?? 30} min</span><strong className="mt-4 block font-[Fraunces] text-2xl">{o.servicio}</strong><strong className="mt-3 block font-[Fraunces] text-3xl">Gs. {o.precio.toLocaleString("es-PY")}</strong><span className="mt-3 block text-sm text-[var(--muted)]">
                          {o.descripcion ? o.descripcion.split("✓").filter(Boolean).map((line, index) => <span key={`${o.id}-${index}`} className="mb-1 block">✓ {line.trim()}</span>) : "Servicio profesional personalizado."}
                        </span>
                      </button>
                    ))}</div>
                </div>
              ) : null}
              {paso === 5 ? (
                <form
                  id="reserva"
                  action={crear}
                  onSubmit={() => {
                    setAccion("crear");
                    setBanner(true);
                  }}
                  className="mt-6 grid gap-4"
                >
                  <input
                    type="hidden"
                    name="pacienteDocumento"
                    value={documento}
                  />
                  <input
                    type="hidden"
                    name="profesionalServicioId"
                    value={opcion}
                  />
                  <input
                    type="hidden"
                    name="modalidad"
                    value={
                      opciones.find((o) => o.id === opcion)?.modalidad ??
                      "presencial"
                    }
                  />
                  <input type="hidden" name="nombreApellido" value={nombreNuevo} />
                  <input type="hidden" name="telefono" value={telefonoNuevo} />
                  <input type="hidden" name="sexo" value={sexoNuevo} />
                  <label className="grid gap-1 text-sm font-medium">
                    Día
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      required
                      className="h-11 rounded-xl border border-[var(--line)] px-3"
                    />
                  </label>
                  <div className="grid gap-2"><p className="text-sm font-medium">Horarios disponibles</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{horasDisponibles.map((h) => <button type="button" key={h} onClick={() => setHora(h)} className={`rounded-full border px-3 py-2 text-sm ${hora === h ? "border-[var(--forest)] bg-[var(--sage)]/40 font-semibold" : "border-[var(--line)]"}`}>{h}</button>)}</div></div>
                  <input type="hidden" name="inicio" value={fecha && hora ? `${fecha}T${hora}` : ""} />
                  <input
                    type="hidden"
                    name="fin"
                    value={
                      hora
                        ? sumarMinutos(fecha, hora, opciones.find((o) => o.id === opcion)?.duracion ?? 30)
                        : ""
                    }
                  />
                  <p className="rounded-2xl bg-[var(--cream)] p-4 text-sm">
                    Al confirmar, la reserva será válida durante 30 minutos y
                    recibirás las indicaciones de confirmación por WhatsApp.
                  </p>
                  <button
                    disabled={pendienteCrear}
                    className="h-11 rounded-full bg-[var(--forest)] text-sm font-semibold text-white"
                  >
                    Confirmar reserva
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







