"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  buscarPacienteReservaPublicaAccion,
  crearReservaPublicaAccion,
  type EstadoReservaPublica,
} from "./acciones-reserva-publica";
import { fechaHoraActualParaguay } from "@/features/agenda/tiempo-paraguay";
import { TarjetasServicios } from "@/features/servicios/tarjetas-servicios";

type Servicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  modalidad: "presencial" | "online";
  duracion: number;
  precio: number;
  presentacion: "normal" | "destacado" | "promocion";
  ordenPublico: number;
};
type Franja = {
  asignacionId: string;
  dia: number;
  inicio: string;
  fin: string;
};
type Ocupacion = { inicio: string; fin: string; estado: string };

function sumarMinutos(fecha: string, hora: string, minutos: number) {
  const base = new Date(`${fecha}T${hora}:00`);
  base.setMinutes(base.getMinutes() + minutos);
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}T${String(base.getHours()).padStart(2, "0")}:${String(base.getMinutes()).padStart(2, "0")}`;
}

export function ReservaPublica({
  profesional,
  servicios,
  franjas,
  ocupaciones,
  asignacionPreseleccionada,
  ahoraInicial,
}: {
  profesional: { id: string; nombre: string; descripcion: string | null };
  servicios: Servicio[];
  franjas: Franja[];
  ocupaciones: Ocupacion[];
  asignacionPreseleccionada: string | null;
  ahoraInicial: string;
}) {
  const [paso, setPaso] = useState(1);
  const [documento, setDocumento] = useState("");
  const [pacienteEncontrado, setPacienteEncontrado] = useState<string | null>(
    null,
  );
  const [registrandoPaciente, setRegistrandoPaciente] = useState(false);
  const [errorDocumento, setErrorDocumento] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("+595 ");
  const [sexo, setSexo] = useState("");
  const [asignacionId, setAsignacionId] = useState(
    asignacionPreseleccionada ?? "",
  );
  const [fecha, setFecha] = useState(ahoraInicial.slice(0, 10));
  const [hora, setHora] = useState("");
  const [ahora, setAhora] = useState(ahoraInicial);
  const [estado, crear, pendiente] = useActionState(
    crearReservaPublicaAccion,
    {} as EstadoReservaPublica,
  );
  const servicio = servicios.find((item) => item.id === asignacionId);
  const horarios = useMemo(() => {
    if (!servicio) return [];
    const dia = new Date(`${fecha}T12:00:00`).getDay() || 7;
    const enMinutos = (texto: string) =>
      Number(texto.slice(0, 2)) * 60 + Number(texto.slice(3));
    const resultado: string[] = [];
    for (const franja of franjas.filter(
      (item) => item.asignacionId === servicio.id && item.dia === dia,
    )) {
      for (
        let minuto = enMinutos(franja.inicio);
        minuto + servicio.duracion <= enMinutos(franja.fin);
        minuto += servicio.duracion
      ) {
        const candidato = `${String(Math.floor(minuto / 60)).padStart(2, "0")}:${String(minuto % 60).padStart(2, "0")}`;
        const inicio = `${fecha}T${candidato}`;
        const fin = sumarMinutos(fecha, candidato, servicio.duracion);
        if (
          inicio > ahora &&
          !ocupaciones.some(
            (ocupacion) => ocupacion.inicio < fin && ocupacion.fin > inicio,
          )
        )
          resultado.push(candidato);
      }
    }
    return resultado;
  }, [ahora, fecha, franjas, ocupaciones, servicio]);
  useEffect(() => {
    const actualizar = () => setAhora(fechaHoraActualParaguay());
    actualizar();
    const intervalo = window.setInterval(actualizar, 30_000);
    return () => window.clearInterval(intervalo);
  }, []);
  useEffect(() => {
    if (hora && !horarios.includes(hora)) setHora("");
  }, [hora, horarios]);
  const verificarDocumento = async () => {
    if (documento.replace(/\D/g, "").length < 5)
      return setErrorDocumento("Ingresa una cédula válida.");
    setVerificando(true);
    setErrorDocumento("");
    const resultado = await buscarPacienteReservaPublicaAccion(
      documento,
      profesional.id,
    );
    setVerificando(false);
    if ("error" in resultado && resultado.error)
      return setErrorDocumento(resultado.error);
    if (resultado.encontrado) {
      setPacienteEncontrado(resultado.nombre);
      setRegistrandoPaciente(false);
      setPaso(asignacionPreseleccionada ? 3 : 2);
      return;
    }
    setPacienteEncontrado(null);
    setRegistrandoPaciente(true);
  };
  const continuarNuevoPaciente = () => {
    if (
      nombre.trim().length < 2 ||
      telefono.replace(/\D/g, "").length < 7 ||
      !sexo
    )
      return setErrorDocumento(
        "Completa nombre, WhatsApp y sexo para continuar.",
      );
    setErrorDocumento("");
    setPaso(asignacionPreseleccionada ? 3 : 2);
  };
  if (estado.exito)
    return (
      <main className="min-h-screen bg-[var(--cream)] px-5 py-12">
        <section className="mx-auto max-w-xl rounded-3xl bg-[var(--paper)] p-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--forest)]">
            Reserva enviada
          </p>
          <h1 className="mt-3 font-[Fraunces] text-4xl">¡Gracias!</h1>
          <p className="mt-5 leading-7 text-[var(--muted)]">{estado.exito}</p>
        </section>
      </main>
    );
  return (
    <main className="min-h-screen bg-[var(--cream)] px-5 py-8 sm:px-8 sm:py-12">
      <section className="mx-auto max-w-5xl">
        <header className="border-b border-[var(--line)] pb-7 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--forest)]">
            Reserva online
          </p>
          <h1 className="mt-3 font-[Fraunces] text-4xl sm:text-5xl">
            {profesional.nombre}
          </h1>
          {profesional.descripcion ? (
            <p className="mx-auto mt-4 max-w-2xl whitespace-pre-line text-[var(--muted)]">
              {profesional.descripcion}
            </p>
          ) : null}
        </header>
        <div className="mx-auto mt-8 max-w-4xl">
          <div className="mb-6 flex justify-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span
              className={
                paso >= 1 ? "text-[var(--forest)]" : "text-[var(--muted)]"
              }
            >
              1. Paciente
            </span>
            <span className="text-[var(--line)]">—</span>
            {!asignacionPreseleccionada ? (
              <>
                <span
                  className={
                    paso >= 2 ? "text-[var(--forest)]" : "text-[var(--muted)]"
                  }
                >
                  2. Servicio
                </span>
                <span className="text-[var(--line)]">—</span>
              </>
            ) : null}
            <span
              className={
                paso >= 3 ? "text-[var(--forest)]" : "text-[var(--muted)]"
              }
            >
              {asignacionPreseleccionada ? "2. Horario" : "3. Horario"}
            </span>
          </div>
          <section className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-sm sm:p-8">
            {estado.error ? (
              <p
                role="alert"
                className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {estado.error}
              </p>
            ) : null}
            {paso === 1 ? (
              <div className="mx-auto grid max-w-xl gap-4">
                <div>
                  <h2 className="font-[Fraunces] text-2xl">
                    Ingresa tu cédula
                  </h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    La usamos para encontrar tus datos antes de reservar.
                  </p>
                </div>
                <label className="grid gap-2 text-sm font-medium">
                  Cédula de identidad
                  <input
                    value={documento}
                    onChange={(evento) => {
                      setDocumento(evento.target.value);
                      setPacienteEncontrado(null);
                      setRegistrandoPaciente(false);
                      setErrorDocumento("");
                    }}
                    inputMode="numeric"
                    placeholder="Sin puntos ni guiones"
                    className="h-12 rounded-xl border border-[var(--line)] px-4"
                  />
                </label>
                {errorDocumento ? (
                  <p role="alert" className="text-sm text-rose-700">
                    {errorDocumento}
                  </p>
                ) : null}
                {registrandoPaciente ? (
                  <div className="grid gap-4 rounded-2xl bg-[var(--cream)] p-5">
                    <div>
                      <p className="font-semibold">Aún no tenemos tus datos</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Completa estos datos una sola vez para crear tu
                        paciente.
                      </p>
                    </div>
                    <label className="grid gap-2 text-sm font-medium">
                      Nombre y apellido
                      <input
                        value={nombre}
                        onChange={(evento) => setNombre(evento.target.value)}
                        className="h-12 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4"
                      />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium">
                        WhatsApp
                        <input
                          value={telefono}
                          onChange={(evento) =>
                            setTelefono(evento.target.value)
                          }
                          inputMode="tel"
                          className="h-12 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium">
                        Sexo
                        <select
                          value={sexo}
                          onChange={(evento) => setSexo(evento.target.value)}
                          className="h-12 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4"
                        >
                          <option value="">Selecciona</option>
                          <option value="femenino">Femenino</option>
                          <option value="masculino">Masculino</option>
                          <option value="otro">Otro</option>
                        </select>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={continuarNuevoPaciente}
                      className="h-12 rounded-full bg-[var(--forest)] font-semibold text-white"
                    >
                      Continuar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={verificando}
                    onClick={verificarDocumento}
                    className="mt-2 h-12 rounded-full bg-[var(--forest)] font-semibold text-white disabled:opacity-50"
                  >
                    {verificando ? "Verificando…" : "Continuar"}
                  </button>
                )}
              </div>
            ) : null}
            {paso === 2 && !asignacionPreseleccionada ? (
              <div className="grid gap-5">
                <div>
                  <h2 className="font-[Fraunces] text-2xl">
                    Elige tu servicio
                  </h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {pacienteEncontrado ? (
                      <>
                        Reservarás como{" "}
                        <strong className="text-[var(--ink)]">
                          {pacienteEncontrado}
                        </strong>
                        .
                      </>
                    ) : (
                      "Selecciona la atención que necesitas."
                    )}
                  </p>
                </div>
                <TarjetasServicios
                  servicios={servicios}
                  onSeleccionar={(id) => {
                    setAsignacionId(id);
                    setPaso(3);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  className="w-fit rounded-full border border-[var(--line)] px-5 py-3 font-semibold"
                >
                  Atrás
                </button>
              </div>
            ) : null}
            {paso === 3 && servicio ? (
              <form action={crear} className="mx-auto grid max-w-2xl gap-5">
                <input
                  type="hidden"
                  name="profesionalId"
                  value={profesional.id}
                />
                <input type="hidden" name="asignacionId" value={servicio.id} />
                <input type="hidden" name="documento" value={documento} />
                <input type="hidden" name="nombre" value={nombre} />
                <input type="hidden" name="telefono" value={telefono} />
                <input type="hidden" name="sexo" value={sexo} />
                <h2 className="font-[Fraunces] text-2xl">
                  Elige fecha y horario
                </h2>
                <label className="grid gap-2 text-sm font-medium">
                  Día
                  <input
                    type="date"
                    min={ahora.slice(0, 10)}
                    value={fecha}
                    onChange={(evento) => {
                      setFecha(evento.target.value);
                      setHora("");
                    }}
                    className="h-12 rounded-xl border border-[var(--line)] px-4"
                  />
                </label>
                <div>
                  <p className="mb-3 text-sm font-medium">
                    Horarios disponibles
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {horarios.map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => setHora(item)}
                        className={`cursor-pointer rounded-full border px-4 py-3 ${hora === item ? "border-[var(--forest)] bg-[var(--sage)]/45 font-semibold" : "border-[var(--line)]"}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  {!horarios.length ? (
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
                <div className="flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setPaso(asignacionPreseleccionada ? 1 : 2)}
                    className="rounded-full border border-[var(--line)] px-5 py-3 font-semibold"
                  >
                    Atrás
                  </button>
                  <button
                    disabled={!hora || pendiente}
                    className="rounded-full bg-[var(--forest)] px-6 py-3 font-semibold text-white disabled:opacity-50"
                  >
                    Confirmar reserva
                  </button>
                </div>
              </form>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
