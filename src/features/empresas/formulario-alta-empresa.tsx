"use client";

import { useActionState } from "react";
import { altaEmpresaAccion, type EstadoAltaEmpresa } from "./acciones-empresa";

const estadoInicial: EstadoAltaEmpresa = {};

function Campo({
  etiqueta,
  nombre,
  tipo = "text",
  ayuda,
  error,
}: {
  etiqueta: string;
  nombre: string;
  tipo?: "password" | "text";
  ayuda?: string;
  error?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-800">
      {etiqueta}
      <input
        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-[var(--forest)] focus:ring-4 focus:ring-[var(--sage)]"
        name={nombre}
        type={tipo}
        aria-describedby={error ? `${nombre}-error` : undefined}
        aria-invalid={Boolean(error)}
        required
      />
      {ayuda ? (
        <span className="text-xs font-normal text-slate-500">{ayuda}</span>
      ) : null}
      {error ? (
        <span
          className="text-xs font-medium text-rose-700"
          id={`${nombre}-error`}
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function FormularioAltaEmpresa() {
  const [estado, accion, pendiente] = useActionState(
    altaEmpresaAccion,
    estadoInicial,
  );
  return (
    <form action={accion} className="grid gap-5" noValidate>
      <Campo
        etiqueta="Nombre de la empresa"
        nombre="nombreEmpresa"
        error={estado.errores?.nombreEmpresa}
      />
      <Campo
        etiqueta="Usuario propietario"
        nombre="nombreUsuario"
        ayuda="Será el identificador para iniciar sesión."
        error={estado.errores?.nombreUsuario}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          etiqueta="Contraseña"
          nombre="contrasena"
          tipo="password"
          error={estado.errores?.contrasena}
        />
        <Campo
          etiqueta="Confirmar contraseña"
          nombre="confirmacionContrasena"
          tipo="password"
          error={estado.errores?.confirmacionContrasena}
        />
      </div>
      {estado.error ? (
        <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
          {estado.error}
        </p>
      ) : null}
      {estado.exito ? (
        <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          {estado.exito}
        </p>
      ) : null}
      <button
        className="mt-1 inline-flex h-11 items-center justify-center rounded-full bg-[var(--forest)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--ink)] focus:outline-none focus:ring-4 focus:ring-[var(--sage)] disabled:cursor-not-allowed disabled:bg-slate-400"
        type="submit"
        disabled={pendiente}
      >
        {pendiente ? "Creando empresa…" : "Crear empresa"}
      </button>
    </form>
  );
}
