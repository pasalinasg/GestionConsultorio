"use client";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PacienteListado } from "./tipos-pacientes";
import {
  cambiarEstadoPacienteAccion,
  crearPacienteAccion,
  editarPacienteAccion,
  eliminarPacienteAccion,
  type EstadoPacienteAccion,
} from "./acciones-pacientes";

const paises = [
  ["PY", "+595", "Paraguay"],
  ["AR", "+54", "Argentina"],
  ["BR", "+55", "Brasil"],
  ["BO", "+591", "Bolivia"],
  ["CL", "+56", "Chile"],
  ["UY", "+598", "Uruguay"],
  ["US", "+1", "Estados Unidos"],
] as const;
function telefonoInicial(valor: string | undefined) {
  if (!valor) return { codigo: "+595", local: "" };
  const encontrado = paises.find(([, codigo]) => valor.startsWith(codigo));
  return encontrado
    ? { codigo: encontrado[1], local: valor.slice(encontrado[1].length) }
    : { codigo: "+595", local: valor };
}

export function ListaPacientes({
  pacientes,
}: {
  pacientes: PacienteListado[];
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modal, setModal] = useState<PacienteListado | "crear" | null>(null);
  const [accion, setAccion] = useState<
    "crear" | "editar" | "estado" | "eliminar"
  >("crear");
  const [mostrarBanner, setMostrarBanner] = useState(false);
  const [crearEstado, crear, pendienteCrear] = useActionState(
    crearPacienteAccion,
    {} as EstadoPacienteAccion,
  );
  const [editarEstado, editar, pendienteEditar] = useActionState(
    editarPacienteAccion,
    {} as EstadoPacienteAccion,
  );
  const [estadoEstado, cambiarEstado, pendienteEstado] = useActionState(
    cambiarEstadoPacienteAccion,
    {} as EstadoPacienteAccion,
  );
  const [eliminarEstado, eliminar, pendienteEliminar] = useActionState(
    eliminarPacienteAccion,
    {} as EstadoPacienteAccion,
  );
  const resultado = {
    crear: crearEstado,
    editar: editarEstado,
    estado: estadoEstado,
    eliminar: eliminarEstado,
  }[accion];
  const visibles = useMemo(
    () =>
      pacientes.filter(
        (p) =>
          `${p.nombreApellido} ${p.documento} ${p.telefono}`
            .toLowerCase()
            .includes(busqueda.toLowerCase().trim()) &&
          (filtro === "todos" || p.estado === filtro),
      ),
    [pacientes, busqueda, filtro],
  );
  const actual = modal !== "crear" ? modal : null;
  const telefono = telefonoInicial(actual?.telefono);
  const estadoActual = actual?.estado.trim().toLowerCase();
  useEffect(() => {
    if (!mostrarBanner || (!resultado.exito && !resultado.error)) return;
    const t = window.setTimeout(
      () => {
        setMostrarBanner(false);
        if (resultado.exito) {
          setModal(null);
          router.refresh();
        }
      },
      resultado.exito ? 1200 : 5000,
    );
    return () => window.clearTimeout(t);
  }, [mostrarBanner, resultado.exito, resultado.error, router]);
  const enviar = (tipo: typeof accion) => {
    setAccion(tipo);
    setMostrarBanner(true);
  };
  return (
    <div className="grid gap-5">
      {mostrarBanner && (resultado.exito || resultado.error) ? (
        <p
          role={resultado.error ? "alert" : "status"}
          className={`fixed right-5 top-5 z-[70] w-[min(90vw,28rem)] rounded-3xl border px-5 py-4 text-sm shadow-xl ${resultado.error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {resultado.error || resultado.exito}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          {visibles.length} de {pacientes.length} pacientes
        </p>
        <button
          type="button"
          onClick={() => {
            setMostrarBanner(false);
            setModal("crear");
          }}
          className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Crear paciente
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar paciente..."
          className="h-11 rounded-xl border border-[var(--line)] px-4"
        />
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="h-11 rounded-xl border border-[var(--line)] px-4"
        >
          <option value="todos">Todos los estados</option>
          <option value="prospecto">Prospectos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
        <div className="hidden grid-cols-[1fr_150px_160px_110px] gap-4 border-b border-[var(--line)] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#71816a] sm:grid">
          <span>Paciente</span>
          <span>Documento</span>
          <span>WhatsApp</span>
          <span>Estado</span>
        </div>
        {visibles.map((p) => (
          <button
            type="button"
            key={p.id}
            onClick={() => {
              setMostrarBanner(false);
              setModal(p);
            }}
            className="grid w-full gap-2 border-b border-[var(--line)] px-5 py-4 text-left last:border-0 hover:bg-[var(--cream)] sm:grid-cols-[1fr_150px_160px_110px] sm:items-center"
          >
            <span>
              <strong className="block text-sm">{p.nombreApellido}</strong>
              <small className="text-xs text-[var(--muted)]">{p.sexo}</small>
            </span>
            <span className="text-sm">{p.documento}</span>
            <span className="text-sm">{p.telefono}</span>
            <span className="w-fit rounded-full bg-[var(--sage)]/55 px-3 py-1 text-xs font-semibold text-[var(--forest)]">
              {p.estado}
            </span>
          </button>
        ))}
        {!visibles.length ? (
          <p className="p-8 text-center text-sm text-[var(--muted)]">
            No encontramos pacientes con esos filtros.
          </p>
        ) : null}
      </div>
      {modal ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/35 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <section className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--paper)] shadow-2xl">
            <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                <h2 className="font-[Fraunces] text-2xl font-semibold">
                  {actual ? "Editar paciente" : "Crear paciente"}
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
                onSubmit={() => enviar(actual ? "editar" : "crear")}
                className="mt-6 grid gap-4"
              >
                <input type="hidden" name="id" value={actual?.id ?? ""} />
                {(
                  [
                    [
                      "nombreApellido",
                      "Nombre y apellido",
                      "text",
                      actual?.nombreApellido ?? "",
                    ],
                    [
                      "documento",
                      "Cédula de identidad",
                      "text",
                      actual?.documento ?? "",
                    ],
                  ] as const
                ).map(([name, label, type, value]) => (
                  <label key={name} className="grid gap-1 text-sm font-medium">
                    {label}
                    <input
                      name={name}
                      type={type}
                      defaultValue={value}
                      required
                      className="h-11 rounded-xl border border-[var(--line)] px-3"
                    />
                  </label>
                ))}
                <label className="grid gap-1 text-sm font-medium">
                  WhatsApp
                  <span className="flex h-11 overflow-hidden rounded-xl border border-[var(--line)]">
                    <select
                      name="codigoPais"
                      defaultValue={telefono.codigo}
                      className="w-28 border-r border-[var(--line)] bg-[var(--cream)] px-2 text-sm font-semibold"
                    >
                      {paises.map(([sigla, codigo]) => (
                        <option key={codigo} value={codigo}>
                          {sigla} {codigo}
                        </option>
                      ))}
                    </select>
                    <input
                      name="telefono"
                      type="tel"
                      defaultValue={telefono.local}
                      placeholder="981 123456"
                      required
                      className="min-w-0 flex-1 px-3 outline-none"
                    />
                  </span>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Sexo
                  <select
                    name="sexo"
                      defaultValue={actual?.sexo?.trim().toLowerCase() ?? ""}
                    required
                    className="h-11 rounded-xl border border-[var(--line)] px-3"
                  >
                    <option value="">Seleccionar</option>
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                    <option value="otro">Otro</option>
                  </select>
                </label>
                <button
                  disabled={pendienteCrear || pendienteEditar}
                  className="h-11 rounded-full bg-[var(--forest)] text-sm font-semibold text-white"
                >
                  {actual ? "Guardar cambios" : "Crear paciente"}
                </button>
              </form>
              {actual ? (
                <>
                  <form
                    action={cambiarEstado}
                    onSubmit={() => enviar("estado")}
                    className="mt-3"
                  >
                    <input type="hidden" name="id" value={actual.id} />
                    <input
                      type="hidden"
                      name="estado"
                      value={
                        estadoActual === "inactivo" ? "activo" : "inactivo"
                      }
                    />
                    <button
                      disabled={pendienteEstado}
                      className="h-10 w-full rounded-full border text-sm font-semibold"
                    >
                      {estadoActual === "inactivo"
                        ? "Activar paciente"
                        : "Inactivar paciente"}
                    </button>
                  </form>
                  <form
                    action={eliminar}
                    onSubmit={() => enviar("eliminar")}
                    className="mt-3"
                  >
                    <input type="hidden" name="id" value={actual.id} />
                    <button
                      disabled={pendienteEliminar}
                      className="h-10 w-full rounded-full border text-sm font-semibold text-rose-700"
                    >
                      Eliminar paciente
                    </button>
                  </form>
                </>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

