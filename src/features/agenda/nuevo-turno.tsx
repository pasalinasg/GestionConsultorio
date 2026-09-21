"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TurnoListado } from "./tipos-agenda";
import {
  cambiarEstadoMiTurnoAccion,
  cambiarEstadoTurnoAccion,
  crearTurnoAccion,
  type EstadoAgendaAccion,
} from "./acciones-agenda";
import { fechaHoraActualParaguay } from "./tiempo-paraguay";

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
type Franja = {
  asignacionId: string;
  dia: number;
  inicio: string;
  fin: string;
};
type Paciente = {
  id: string;
  nombreApellido: string;
  documento: string;
  telefono: string;
  sexo: string;
  estado: string;
};

function sumarMinutos(fecha: string, hora: string, minutos: number) {
  const base = new Date(`${fecha}T${hora}:00`);
  base.setMinutes(base.getMinutes() + minutos);
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}T${String(base.getHours()).padStart(2, "0")}:${String(base.getMinutes()).padStart(2, "0")}`;
}
function fechaHora(valor: string) {
  const [fecha, hora] = valor.slice(0, 16).split("T");
  return fecha && hora
    ? `${fecha.split("-").reverse().join("/")}, ${hora}`
    : valor;
}

export function NuevoTurno({
  turnos,
  opciones,
  pacientes,
  franjas,
  ahoraInicial,
  profesionalInicial,
  volverHref = "/agenda",
  agendaPropia = false,
}: {
  turnos: TurnoListado[];
  opciones: Opcion[];
  pacientes: Paciente[];
  franjas: Franja[];
  ahoraInicial: string;
  profesionalInicial?: string;
  volverHref?: string;
  agendaPropia?: boolean;
}) {
  const router = useRouter();
  const esAgendaPropia = Boolean(profesionalInicial);
  const [paso, setPaso] = useState(1);
  const [documento, setDocumento] = useState("");
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [telefonoNuevo, setTelefonoNuevo] = useState("");
  const [sexoNuevo, setSexoNuevo] = useState("");
  const [encontrado, setEncontrado] = useState<Paciente | null>(null);
  const [profesional, setProfesional] = useState(profesionalInicial ?? "");
  const [opcion, setOpcion] = useState("");
  const [fecha, setFecha] = useState(() => ahoraInicial.slice(0, 10));
  const [ahoraParaguay, setAhoraParaguay] = useState(ahoraInicial);
  const [hora, setHora] = useState("");
  const [accion, setAccion] = useState<"crear" | "cancelar">("crear");
  const [banner, setBanner] = useState(false);
  const [crearEstado, crear, pendienteCrear] = useActionState(
    crearTurnoAccion,
    {} as EstadoAgendaAccion,
  );
  const [cancelarEstado, cancelar] = useActionState(
    agendaPropia ? cambiarEstadoMiTurnoAccion : cambiarEstadoTurnoAccion,
    {} as EstadoAgendaAccion,
  );
  const resultado = accion === "crear" ? crearEstado : cancelarEstado;
  const vigentes = encontrado
    ? turnos.filter(
        (turno) =>
          turno.paciente === encontrado.nombreApellido &&
          !["rechazada", "vencida", "cancelada"].includes(turno.estado),
      )
    : [];
  const seleccion = opciones.find((item) => item.id === opcion);
  const pasoMostrado = esAgendaPropia && paso > 3 ? paso - 1 : paso;
  const totalPasos = esAgendaPropia ? 4 : 5;
  const horasDisponibles = useMemo(() => {
    if (!fecha || !seleccion) return [];
    const dia = new Date(`${fecha}T12:00:00`).getDay() || 7;
    const minutos = (horaTexto: string) =>
      Number(horaTexto.slice(0, 2)) * 60 + Number(horaTexto.slice(3));
    const resultadoHoras: string[] = [];
    for (const franja of franjas.filter(
      (item) => item.asignacionId === seleccion.id && item.dia === dia,
    )) {
      for (
        let total = minutos(franja.inicio);
        total + (seleccion.duracion ?? 30) <= minutos(franja.fin);
        total += seleccion.duracion ?? 30
      ) {
        const disponible = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
        const inicio = new Date(`${fecha}T${disponible}`).getTime();
        const ocupado = turnos.some(
          (turno) =>
            (turno.profesionalId === seleccion.profesionalId ||
              turno.profesional === seleccion.profesional) &&
            !["rechazada", "vencida", "cancelada"].includes(turno.estado) &&
            new Date(turno.inicio).getTime() <
              inicio + (seleccion.duracion ?? 30) * 60000 &&
            new Date(turno.fin).getTime() > inicio,
        );
        if (`${fecha}T${disponible}` > ahoraParaguay && !ocupado)
          resultadoHoras.push(disponible);
      }
    }
    return resultadoHoras;
  }, [fecha, seleccion, franjas, turnos, ahoraParaguay]);

  useEffect(() => {
    if (!banner || (!resultado.exito && !resultado.error)) return;
    const temporizador = window.setTimeout(
      () => {
        setBanner(false);
        if (resultado.exito && accion === "crear") router.push(volverHref);
        else if (resultado.exito) router.refresh();
      },
      resultado.exito ? 1800 : 5000,
    );
    return () => window.clearTimeout(temporizador);
  }, [accion, banner, resultado, router, volverHref]);
  useEffect(() => {
    const actualizar = () => setAhoraParaguay(fechaHoraActualParaguay());
    actualizar();
    const temporizador = window.setInterval(actualizar, 30_000);
    return () => window.clearInterval(temporizador);
  }, []);
  useEffect(() => {
    if (paso !== 5) return;
    const temporizador = window.setInterval(() => router.refresh(), 30_000);
    return () => window.clearInterval(temporizador);
  }, [paso, router]);
  useEffect(() => {
    if (fecha < ahoraParaguay.slice(0, 10))
      setFecha(ahoraParaguay.slice(0, 10));
  }, [fecha, ahoraParaguay]);
  useEffect(() => {
    if (hora && !horasDisponibles.includes(hora)) setHora("");
  }, [hora, horasDisponibles]);

  const buscar = () => {
    setEncontrado(
      pacientes.find(
        (paciente) =>
          paciente.documento.replace(/\D/g, "") ===
          documento.replace(/\D/g, ""),
      ) ?? null,
    );
    setPaso(2);
  };
  const puedeAvanzarPaciente =
    encontrado || (nombreNuevo.trim() && telefonoNuevo.trim() && sexoNuevo);
  const siguientePaciente = () => setPaso(esAgendaPropia ? 4 : 3);

  return (
    <div className="mx-auto max-w-7xl">
      {banner && (resultado.exito || resultado.error) ? (
        <p
          role={resultado.error ? "alert" : "status"}
          className={`fixed right-5 top-5 z-[70] w-[min(90vw,30rem)] rounded-3xl border px-5 py-4 text-sm shadow-xl ${resultado.error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {resultado.error || resultado.exito}
        </p>
      ) : null}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-6">
        <Link
          href={volverHref}
          className="text-sm font-semibold text-[var(--forest)]"
        >
          ← Volver a Agenda
        </Link>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--forest)]">
            Paso {pasoMostrado} de {totalPasos}
          </p>
          <h1 className="font-[Fraunces] text-3xl">Nuevo turno</h1>
        </div>
        <span className="w-28" />
      </div>
      <section className="mt-8 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-6 sm:p-8">
        {paso === 1 ? (
          <div className="mx-auto grid max-w-xl gap-5">
            <h2 className="font-[Fraunces] text-2xl">Identifica al paciente</h2>
            <label className="grid gap-2 text-sm font-medium">
              Cédula de identidad
              <input
                value={documento}
                onChange={(evento) => setDocumento(evento.target.value)}
                placeholder="Sin puntos ni guiones"
                className="h-12 rounded-xl border border-[var(--line)] px-4"
              />
            </label>
            <button
              type="button"
              disabled={!documento.trim()}
              onClick={buscar}
              className="h-12 rounded-full bg-[var(--forest)] font-semibold text-white disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        ) : null}
        {paso === 2 ? (
          <div className="mx-auto grid max-w-4xl gap-5">
            <h2 className="font-[Fraunces] text-2xl">Datos del paciente</h2>
            {encontrado ? (
              <>
                <div className="rounded-2xl bg-[var(--cream)] p-5">
                  Paciente encontrado:{" "}
                  <strong>{encontrado.nombreApellido}</strong>
                  <br />
                  <span className="text-sm text-[var(--muted)]">
                    Tiene {vigentes.length} cita(s) vigente(s).
                  </span>
                </div>
                {vigentes.length ? (
                  <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
                    {vigentes.map((turno) => (
                      <form
                        key={turno.id}
                        action={cancelar}
                        onSubmit={() => {
                          setAccion("cancelar");
                          setBanner(true);
                        }}
                        className="grid gap-3 border-b border-[var(--line)] p-4 last:border-0 sm:grid-cols-[1fr_1fr_150px_auto] sm:items-center"
                      >
                        <span>
                          <small className="block text-xs text-[var(--muted)]">
                            Profesional
                          </small>
                          {turno.profesional}
                        </span>
                        <span>
                          <small className="block text-xs text-[var(--muted)]">
                            Servicio
                          </small>
                          {turno.servicio}
                        </span>
                        <span>{fechaHora(turno.inicio)}</span>
                        <input type="hidden" name="id" value={turno.id} />
                        <input type="hidden" name="estado" value="cancelada" />
                        <button className="text-sm font-semibold text-rose-700">
                          Cancelar
                        </button>
                      </form>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={nombreNuevo}
                  onChange={(evento) => setNombreNuevo(evento.target.value)}
                  placeholder="Nombre y apellido"
                  className="h-12 rounded-xl border border-[var(--line)] px-4 sm:col-span-2"
                />
                <input
                  value={telefonoNuevo}
                  onChange={(evento) => setTelefonoNuevo(evento.target.value)}
                  placeholder="WhatsApp"
                  className="h-12 rounded-xl border border-[var(--line)] px-4"
                />
                <select
                  value={sexoNuevo}
                  onChange={(evento) => setSexoNuevo(evento.target.value)}
                  className="h-12 rounded-xl border border-[var(--line)] px-4"
                >
                  <option value="">Sexo</option>
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="rounded-full border border-[var(--line)] px-5 py-3 font-semibold"
              >
                Atrás
              </button>
              <button
                type="button"
                disabled={!puedeAvanzarPaciente}
                onClick={siguientePaciente}
                className="rounded-full bg-[var(--forest)] px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : null}
        {paso === 3 ? (
          <div className="grid gap-5">
            <h2 className="font-[Fraunces] text-2xl">Selecciona profesional</h2>
            <div className="grid max-w-5xl gap-4">
              {[...new Set(opciones.map((item) => item.profesional))].map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => {
                      setProfesional(item);
                      setPaso(4);
                    }}
                    className="flex items-center gap-5 rounded-2xl border border-[var(--line)] p-6 text-left transition hover:border-[var(--forest)] hover:bg-[var(--cream)]"
                  >
                    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[var(--sage)] font-[Fraunces] text-3xl text-[var(--forest)]">
                      {item.slice(0, 1)}
                    </span>
                    <span>
                      <strong className="block font-[Fraunces] text-2xl">
                        {item}
                      </strong>
                      <span className="mt-2 block max-w-4xl text-sm leading-6 text-[var(--muted)]">
                        {opciones.find(
                          (opcionActual) => opcionActual.profesional === item,
                        )?.descripcionProfesional ||
                          "Profesional de tu consultorio."}
                      </span>
                    </span>
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={() => setPaso(2)}
              className="w-fit rounded-full border border-[var(--line)] px-5 py-3 font-semibold"
            >
              Atrás
            </button>
          </div>
        ) : null}
        {paso === 4 ? (
          <div className="grid gap-5">
            <h2 className="font-[Fraunces] text-2xl">Servicios disponibles</h2>
            <div className="grid grid-flow-col auto-cols-[17rem] justify-start gap-4 overflow-x-auto pb-3 xl:auto-cols-[calc((100%-4rem)/5)] xl:justify-center">
              {opciones
                .filter((item) => item.profesional === profesional)
                .map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setOpcion(item.id);
                      setPaso(5);
                    }}
                    className="flex min-h-64 flex-col items-start rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5 text-left transition hover:border-[var(--forest)]"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--forest)]">
                      {item.modalidad} · {item.duracion ?? 30} min
                    </span>
                    <strong className="mt-4 font-[Fraunces] text-2xl">
                      {item.servicio}
                    </strong>
                    <strong className="mt-3 font-[Fraunces] text-3xl">
                      Gs. {item.precio.toLocaleString("es-PY")}
                    </strong>
                    <span className="mt-4 text-sm text-[var(--muted)]">
                      {item.descripcion
                        ? item.descripcion
                            .split("✓")
                            .filter(Boolean)
                            .map((linea, indice) => (
                              <span key={indice} className="mb-1 block">
                                ✓ {linea.trim()}
                              </span>
                            ))
                        : "Servicio profesional personalizado."}
                    </span>
                  </button>
                ))}
            </div>
            <button
              type="button"
              onClick={() => setPaso(esAgendaPropia ? 2 : 3)}
              className="w-fit rounded-full border border-[var(--line)] px-5 py-3 font-semibold"
            >
              Atrás
            </button>
          </div>
        ) : null}
        {paso === 5 ? (
          <form
            action={crear}
            onSubmit={() => {
              setAccion("crear");
              setBanner(true);
            }}
            className="mx-auto grid max-w-4xl gap-5"
          >
            <h2 className="font-[Fraunces] text-2xl">Elige fecha y horario</h2>
            <input type="hidden" name="pacienteDocumento" value={documento} />
            <input type="hidden" name="profesionalServicioId" value={opcion} />
            <input
              type="hidden"
              name="modalidad"
              value={seleccion?.modalidad ?? "presencial"}
            />
            <input type="hidden" name="nombreApellido" value={nombreNuevo} />
            <input type="hidden" name="telefono" value={telefonoNuevo} />
            <input type="hidden" name="sexo" value={sexoNuevo} />
            <label className="grid gap-2 text-sm font-medium">
              Día
              <input
                type="date"
                value={fecha}
                onChange={(evento) => {
                  setFecha(evento.target.value);
                  setHora("");
                }}
                className="h-12 rounded-xl border border-[var(--line)] px-4"
              />
            </label>
            <div>
              <p className="mb-3 text-sm font-medium">Horarios disponibles</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {horasDisponibles.map((disponible) => (
                  <button
                    type="button"
                    key={disponible}
                    onClick={() => setHora(disponible)}
                    className={`rounded-full border px-4 py-3 ${hora === disponible ? "border-[var(--forest)] bg-[var(--sage)]/40 font-semibold" : "border-[var(--line)]"}`}
                  >
                    {disponible}
                  </button>
                ))}
              </div>
              {!horasDisponibles.length ? (
                <p className="mt-3 text-sm text-[var(--muted)]">
                  No hay horarios disponibles para este día.
                </p>
              ) : null}
            </div>
            <input
              type="hidden"
              name="inicio"
              value={hora ? `${fecha}T${hora}` : ""}
            />
            <input
              type="hidden"
              name="fin"
              value={
                hora ? sumarMinutos(fecha, hora, seleccion?.duracion ?? 30) : ""
              }
            />
            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setPaso(4)}
                className="rounded-full border border-[var(--line)] px-5 py-3 font-semibold"
              >
                Atrás
              </button>
              <button
                disabled={!hora || pendienteCrear}
                className="rounded-full bg-[var(--forest)] px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                Confirmar reserva
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
}
