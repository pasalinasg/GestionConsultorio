"use server";

import { redirect } from "next/navigation";
import {
  ErrorAltaEmpresa,
  crearEmpresaPropietaria,
} from "./servicio-alta-empresa";
import { validarAltaEmpresa } from "./validacion-alta-empresa";

export type EstadoAltaEmpresa = {
  exito?: string;
  error?: string;
  errores?: Record<string, string>;
};

export async function altaEmpresaAccion(
  _estadoAnterior: EstadoAltaEmpresa,
  formulario: FormData,
): Promise<EstadoAltaEmpresa> {
  const entrada = {
    nombreEmpresa: String(formulario.get("nombreEmpresa") ?? ""),
    nombreUsuario: String(formulario.get("nombreUsuario") ?? ""),
    contrasena: String(formulario.get("contrasena") ?? ""),
    confirmacionContrasena: String(
      formulario.get("confirmacionContrasena") ?? "",
    ),
  };
  const validacion = validarAltaEmpresa(entrada);
  if (!validacion.valido) return { errores: validacion.errores };

  try {
    const resultado = await crearEmpresaPropietaria(entrada);
    redirect(
      `/iniciar-sesion?empresa=${encodeURIComponent(resultado.nombreEmpresa)}`,
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production" && error instanceof Error) {
      return {
        error:
          error instanceof ErrorAltaEmpresa && error.detalle
            ? error.detalle
            : error.message,
      };
    }
    return {
      error:
        error instanceof ErrorAltaEmpresa
          ? error.message
          : "No fue posible completar el alta. Inténtalo de nuevo.",
    };
  }
}
