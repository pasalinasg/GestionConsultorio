export type DatosAltaEmpresa = {
  nombreEmpresa: string;
  nombreUsuario: string;
  contrasena: string;
  confirmacionContrasena: string;
};

export type CampoAltaEmpresa =
  "nombreEmpresa" | "nombreUsuario" | "contrasena" | "confirmacionContrasena";

export type ResultadoValidacionAltaEmpresa =
  | {
      valido: true;
      datos: {
        nombreEmpresa: string;
        nombreUsuario: string;
        nombreUsuarioNormalizado: string;
        contrasena: string;
      };
    }
  | { valido: false; errores: Partial<Record<CampoAltaEmpresa, string>> };

const PATRON_NOMBRE_USUARIO = /^[a-z0-9][a-z0-9._-]{2,49}$/;
const LONGITUD_MINIMA_CONTRASENA = 6;

export function normalizarNombreUsuario(valor: string) {
  return valor.trim().toLocaleLowerCase("es-PY");
}

function limpiarTexto(valor: string) {
  return valor.trim().replace(/\s+/g, " ");
}

export function validarAltaEmpresa(
  entrada: DatosAltaEmpresa,
): ResultadoValidacionAltaEmpresa {
  const nombreEmpresa = limpiarTexto(entrada.nombreEmpresa);
  const nombreUsuario = limpiarTexto(entrada.nombreUsuario);
  const nombreUsuarioNormalizado = normalizarNombreUsuario(nombreUsuario);
  const errores: Partial<Record<CampoAltaEmpresa, string>> = {};

  if (nombreEmpresa.length < 2 || nombreEmpresa.length > 120) {
    errores.nombreEmpresa =
      "Ingresa un nombre de empresa de 2 a 120 caracteres.";
  }

  if (!PATRON_NOMBRE_USUARIO.test(nombreUsuarioNormalizado)) {
    errores.nombreUsuario =
      "El usuario debe tener entre 3 y 50 caracteres y usar letras, números, punto, guion o guion bajo.";
  }

  if (entrada.contrasena.length < LONGITUD_MINIMA_CONTRASENA) {
    errores.contrasena = "La contraseña debe tener al menos 6 caracteres.";
  }

  if (entrada.contrasena !== entrada.confirmacionContrasena) {
    errores.confirmacionContrasena = "Las contraseñas no coinciden.";
  }

  if (Object.keys(errores).length > 0) {
    return { valido: false, errores };
  }

  return {
    valido: true,
    datos: {
      nombreEmpresa,
      nombreUsuario,
      nombreUsuarioNormalizado,
      contrasena: entrada.contrasena,
    },
  };
}
