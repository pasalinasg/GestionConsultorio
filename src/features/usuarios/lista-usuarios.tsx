"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { reemplazarPermisosAccion } from "@/features/permisos/acciones-permisos";
import { restablecerContrasenaAccion } from "./acciones-contrasena";
import { cambiarEstadoUsuarioAccion } from "./acciones-estado-usuario";
import { crearUsuarioAccion } from "./acciones-usuarios";
import type {
  PermisoDisponible,
  UsuarioListado,
} from "./servicio-listado-usuarios";

type EstadoAccion = { exito?: string; error?: string };

function Modal({
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
        className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--paper)] shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
            <h2 className="font-[Fraunces] text-2xl font-semibold">{titulo}</h2>
            <button
              type="button"
              onClick={cerrar}
              className="rounded-full border px-3 py-1 text-lg"
            >
              ×
            </button>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </section>
    </div>
  );
}

function Mensaje({ estado }: { estado: { exito?: string; error?: string } }) {
  return estado.error ? (
    <p
      role="alert"
      className="fixed right-5 top-5 z-[70] flex w-[min(90vw,28rem)] items-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-xl"
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-200 font-bold">
        !
      </span>
      <span>{estado.error}</span>
    </p>
  ) : estado.exito ? (
    <p
      role="status"
      className="fixed right-5 top-5 z-[70] flex w-[min(90vw,28rem)] items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-xl"
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-200 font-bold">
        ✓
      </span>
      <span>{estado.exito}</span>
    </p>
  ) : null;
}

function SelectorPermisos({
  permisos,
  seleccionados,
  cambiarSeleccion,
}: {
  permisos: PermisoDisponible[];
  seleccionados?: number[];
  cambiarSeleccion?: (id: number, activo: boolean) => void;
}) {
  const grupos = permisos.reduce<Record<string, PermisoDisponible[]>>(
    (resultado, permiso) => {
      const clave = permiso.recurso || "otros";
      (resultado[clave] ??= []).push(permiso);
      return resultado;
    },
    {},
  );

  return (
    <div className="grid gap-3 rounded-2xl bg-[var(--cream)] p-4">
      {Object.entries(grupos).map(([recurso, actividades]) => (
        <div
          key={recurso}
          className="grid gap-3 border-b border-[var(--line)] pb-3 last:border-0 last:pb-0"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--forest)]">
            {actividades[0]?.recursoNombre || recurso}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {actividades.map((permiso) => (
              <label
                key={permiso.id}
                className="inline-flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="permisos"
                  value={permiso.id}
                  checked={seleccionados?.includes(permiso.id)}
                  defaultChecked={
                    seleccionados === undefined ? false : undefined
                  }
                  onChange={(evento) =>
                    cambiarSeleccion?.(permiso.id, evento.target.checked)
                  }
                />
                <span>
                  {permiso.accion === "visualizar"
                    ? "Ver"
                    : permiso.accion === "validar_comprobante"
                      ? "Validar comprobantes"
                      : permiso.accion.charAt(0).toUpperCase() +
                        permiso.accion.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListaUsuarios({
  usuarios,
  permisos,
}: {
  usuarios: UsuarioListado[];
  permisos: PermisoDisponible[];
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [crear, setCrear] = useState(false);
  const [seleccionado, setSeleccionado] = useState<UsuarioListado | null>(null);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>(
    [],
  );
  const [mostrarMensajes, setMostrarMensajes] = useState(false);
  const [ultimaAccion, setUltimaAccion] = useState<
    "crear" | "permisos" | "estado" | "contrasena"
  >("crear");
  const visibles = useMemo(
    () =>
      usuarios.filter(
        (u) =>
          u.nombreUsuario
            .toLowerCase()
            .includes(busqueda.toLowerCase().trim()) &&
          (filtro === "todos" || u.estado === filtro),
      ),
    [usuarios, busqueda, filtro],
  );
  const [estadoCrear, accionCrear, pendienteCrear] = useActionState(
    crearUsuarioAccion,
    {} as EstadoAccion,
  );
  const [estadoPermisos, accionPermisos, pendientePermisos] = useActionState(
    reemplazarPermisosAccion,
    {} as EstadoAccion,
  );
  const [estadoEstado, accionEstado, pendienteEstado] = useActionState(
    cambiarEstadoUsuarioAccion,
    {} as EstadoAccion,
  );
  const [estadoContrasena, accionContrasena, pendienteContrasena] =
    useActionState(restablecerContrasenaAccion, {} as EstadoAccion);
  const mostrarMensajeTemporal = (accion: typeof ultimaAccion) => {
    setUltimaAccion(accion);
    setMostrarMensajes(true);
    window.setTimeout(() => {
      setMostrarMensajes(false);
      router.refresh();
    }, 4000);
  };
  const hayExito = Boolean(
    estadoCrear.exito ||
    estadoPermisos.exito ||
    estadoEstado.exito ||
    estadoContrasena.exito,
  );
  useEffect(() => {
    if (hayExito) {
      const cierre = window.setTimeout(() => {
        setMostrarMensajes(true);
        setCrear(false);
        setSeleccionado(null);
      }, 300);
      return () => window.clearTimeout(cierre);
    }
  }, [hayExito]);
  const estadoBanner = {
    error: {
      crear: estadoCrear,
      permisos: estadoPermisos,
      estado: estadoEstado,
      contrasena: estadoContrasena,
    }[ultimaAccion].error,
    exito: {
      crear: estadoCrear,
      permisos: estadoPermisos,
      estado: estadoEstado,
      contrasena: estadoContrasena,
    }[ultimaAccion].exito,
  };
  return (
    <>
      {mostrarMensajes ? <Mensaje estado={estadoBanner} /> : null}
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">
            {visibles.length} de {usuarios.length} usuarios
          </p>
          <button
            type="button"
            onClick={() => {
              setMostrarMensajes(false);
              setCrear(true);
            }}
            className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            + Crear usuario
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar usuario..."
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
          </select>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
          <div className="hidden grid-cols-[1fr_130px_110px] gap-4 border-b border-[var(--line)] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#71816a] sm:grid">
            <span>Usuario</span>
            <span>Estado</span>
            <span />
          </div>
          {visibles.length ? (
            visibles.map((u) => (
              <button
                type="button"
                key={u.id}
                onClick={() => {
                  setMostrarMensajes(false);
                  setPermisosSeleccionados(u.permisos);
                  setSeleccionado(u);
                }}
                className="grid w-full gap-2 border-b border-[var(--line)] px-5 py-4 text-left last:border-0 hover:bg-[var(--cream)] sm:grid-cols-[1fr_130px_110px] sm:items-center"
              >
                <span>
                  <strong className="block text-sm">{u.nombreUsuario}</strong>
                  <small className="text-xs text-[var(--muted)]">
                    {u.esPropietario ? "Propietario" : "Usuario interno"}
                  </small>
                </span>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${u.estado === "activo" ? "bg-[var(--sage)]/55 text-[var(--forest)]" : "bg-slate-100 text-slate-500"}`}
                >
                  {u.estado}
                </span>
                <span className="text-xs font-semibold text-[var(--forest)]">
                  Ver usuario →
                </span>
              </button>
            ))
          ) : (
            <p className="p-8 text-center text-sm text-[var(--muted)]">
              No encontramos usuarios con esos filtros.
            </p>
          )}
        </div>
        {crear ? (
          <Modal titulo="Crear usuario" cerrar={() => setCrear(false)}>
            <form
              action={accionCrear}
              onSubmit={() => mostrarMensajeTemporal("crear")}
              className="grid gap-4"
            >
              <label className="grid gap-1 text-sm font-medium">
                Nombre de usuario
                <input
                  name="nombreUsuario"
                  required
                  className="h-11 rounded-xl border px-3"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Contraseña temporal
                <input
                  name="contrasena"
                  type="password"
                  required
                  className="h-11 rounded-xl border px-3"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Confirmar contraseña
                <input
                  name="confirmacionContrasena"
                  type="password"
                  required
                  className="h-11 rounded-xl border px-3"
                />
              </label>
              <fieldset className="grid gap-3">
                <legend className="text-sm font-semibold">
                  Permisos iniciales
                </legend>
                <SelectorPermisos permisos={permisos} />
              </fieldset>
              <button
                disabled={pendienteCrear}
                className="h-11 rounded-full bg-[var(--forest)] text-sm font-semibold text-white"
              >
                Crear usuario
              </button>
            </form>
          </Modal>
        ) : null}
        {seleccionado ? (
          <Modal
            titulo={seleccionado.nombreUsuario}
            cerrar={() => {
              setMostrarMensajes(false);
              setSeleccionado(null);
            }}
          >
            {seleccionado.esPropietario ? (
              <p className="text-sm text-[var(--muted)]">
                El propietario tiene acceso total y no se administra desde este
                panel.
              </p>
            ) : (
              <div className="grid gap-5">
                <form
                  action={accionPermisos}
                  onSubmit={() => mostrarMensajeTemporal("permisos")}
                  className="grid gap-2 border-t pt-5"
                >
                  <input
                    type="hidden"
                    name="usuarioId"
                    value={seleccionado.id}
                  />
                  <fieldset className="grid gap-1 text-sm font-semibold">
                    <legend>Gestionar permisos</legend>
                    <SelectorPermisos
                      permisos={permisos}
                      seleccionados={permisosSeleccionados}
                      cambiarSeleccion={(id, activo) =>
                        setPermisosSeleccionados((actuales) =>
                          activo
                            ? [...new Set([...actuales, id])]
                            : actuales.filter((actual) => actual !== id),
                        )
                      }
                    />
                  </fieldset>
                  <button
                    disabled={pendientePermisos}
                    className="h-10 rounded-full border border-[var(--forest)] text-sm font-semibold text-[var(--forest)]"
                  >
                    Guardar permisos
                  </button>
                </form>
                <form
                  action={accionEstado}
                  onSubmit={() => mostrarMensajeTemporal("estado")}
                  className="grid gap-2 border-t pt-5"
                >
                  <input
                    type="hidden"
                    name="usuarioId"
                    value={seleccionado.id}
                  />
                  <input
                    type="hidden"
                    name="estado"
                    value={
                      seleccionado.estado === "activo" ? "inactivo" : "activo"
                    }
                  />
                  <button
                    disabled={pendienteEstado}
                    className="h-10 rounded-full border text-sm font-semibold"
                  >
                    {seleccionado.estado === "activo"
                      ? "Desactivar usuario"
                      : "Activar usuario"}
                  </button>
                </form>
                <form
                  action={accionContrasena}
                  onSubmit={() => mostrarMensajeTemporal("contrasena")}
                  className="grid gap-2 border-t pt-5"
                >
                  <input
                    type="hidden"
                    name="usuarioId"
                    value={seleccionado.id}
                  />
                  <label className="grid gap-1 text-sm font-semibold">
                    Cambiar / restablecer contraseña
                    <input
                      name="nuevaContrasena"
                      type="password"
                      minLength={6}
                      required
                      className="h-11 rounded-xl border px-3 font-normal"
                    />
                  </label>
                  <button
                    disabled={pendienteContrasena}
                    className="h-10 rounded-full bg-[var(--forest)] text-sm font-semibold text-white"
                  >
                    Restablecer contraseña
                  </button>
                </form>
              </div>
            )}
          </Modal>
        ) : null}
      </div>
    </>
  );
}
