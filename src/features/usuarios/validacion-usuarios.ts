import { normalizarNombreUsuario } from "@/features/empresas/validacion-alta-empresa";

export type DatosUsuarioInterno = {
  nombreUsuario: string;
  contrasena: string;
  confirmacionContrasena: string;
  permisos: number[];
};

export type ResultadoValidacionUsuario =
  | {
      valido: true;
      datos: DatosUsuarioInterno & { nombreUsuarioNormalizado: string };
    }
  | { valido: false; errores: Record<string, string> };

const PATRON_USUARIO = /^[a-z0-9][a-z0-9._-]{2,49}$/;

export function validarUsuarioInterno(
  entrada: DatosUsuarioInterno,
): ResultadoValidacionUsuario {
  const nombreUsuario = entrada.nombreUsuario.trim();
  const nombreUsuarioNormalizado = normalizarNombreUsuario(nombreUsuario);
  const errores: Record<string, string> = {};
  if (!PATRON_USUARIO.test(nombreUsuarioNormalizado)) {
    errores.nombreUsuario =
      "El usuario debe tener entre 3 y 50 caracteres válidos.";
  }
  if (entrada.contrasena.length < 6) {
    errores.contrasena = "La contraseña debe tener al menos 6 caracteres.";
  }
  if (entrada.contrasena !== entrada.confirmacionContrasena) {
    errores.confirmacionContrasena = "Las contraseñas no coinciden.";
  }
  const permisosUnicos = new Set(entrada.permisos);
  if (
    entrada.permisos.some(
      (permiso) => !Number.isInteger(permiso) || permiso < 1 || permiso > 22,
    )
  ) {
    errores.permisos = "La selección de permisos no es válida.";
  }
  if (permisosUnicos.size !== entrada.permisos.length) {
    errores.permisos = "No se permiten permisos repetidos.";
  }
  if (Object.keys(errores).length > 0) return { valido: false, errores };
  return {
    valido: true,
    datos: { ...entrada, nombreUsuario, nombreUsuarioNormalizado },
  };
}

export function validarPermisos(permisos: number[]) {
  const resultado = validarUsuarioInterno({
    nombreUsuario: "usuario.valido",
    contrasena: "ClaveSeguraDePrueba",
    confirmacionContrasena: "ClaveSeguraDePrueba",
    permisos,
  });
  return resultado.valido || resultado.errores.permisos === undefined;
}
