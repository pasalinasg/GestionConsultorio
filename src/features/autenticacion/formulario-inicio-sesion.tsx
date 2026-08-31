"use client";

import { useActionState } from "react";
import { iniciarSesionAccion } from "./acciones-autenticacion";

export function FormularioInicioSesion() {
  const [estado, accion, pendiente] = useActionState(iniciarSesionAccion, {});
  return (
    <form action={accion} className="grid gap-5">
      <label className="grid gap-1.5 text-sm font-medium text-slate-800">
        Usuario
        <input
          name="nombreUsuario"
          required
          className="h-11 rounded-xl border border-slate-300 px-3 outline-none focus:border-[var(--forest)] focus:ring-4 focus:ring-[var(--sage)]"
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-slate-800">
        Contraseña
        <input
          name="contrasena"
          type="password"
          required
          className="h-11 rounded-xl border border-slate-300 px-3 outline-none focus:border-[var(--forest)] focus:ring-4 focus:ring-[var(--sage)]"
        />
      </label>
      {estado.error ? (
        <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
          {estado.error}
        </p>
      ) : null}
      <button
        disabled={pendiente}
        className="h-11 rounded-full bg-[var(--forest)] text-sm font-semibold text-white disabled:bg-slate-400"
      >
        {pendiente ? "Ingresando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
