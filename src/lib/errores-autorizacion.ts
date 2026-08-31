export type CodigoErrorAutorizacion =
  | "sesion_requerida"
  | "usuario_no_encontrado"
  | "usuario_inactivo"
  | "permiso_denegado";

export class ErrorAutorizacion extends Error {
  readonly codigo: CodigoErrorAutorizacion;

  constructor(codigo: CodigoErrorAutorizacion, actividad?: string) {
    super(
      actividad
        ? `No tienes acceso a la actividad: ${actividad}.`
        : "No tienes permiso para realizar esta acción.",
    );
    this.name = "ErrorAutorizacion";
    this.codigo = codigo;
  }
}

export function esErrorAutorizacion(
  error: unknown,
): error is ErrorAutorizacion {
  return error instanceof ErrorAutorizacion;
}

export function mensajeSeguro(error: unknown, alternativa: string) {
  return esErrorAutorizacion(error) ? error.message : alternativa;
}
