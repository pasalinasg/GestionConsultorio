"use server";

import {
  crearReservaPublica,
  ErrorReservaPublica,
} from "./servicio-reserva-publica";
import { buscarPacienteReservaPublica } from "./servicio-reserva-publica";

export type EstadoReservaPublica = { exito?: string; error?: string };
export type ResultadoBusquedaPacientePublica =
  | { encontrado: true; nombre: string }
  | { encontrado: false }
  | { encontrado: false; error: string };

export async function buscarPacienteReservaPublicaAccion(
  documento: string,
  profesionalId: string,
): Promise<ResultadoBusquedaPacientePublica> {
  try {
    const paciente = await buscarPacienteReservaPublica(
      documento,
      profesionalId,
    );
    return paciente
      ? { encontrado: true, nombre: paciente.nombre }
      : { encontrado: false };
  } catch {
    return {
      encontrado: false,
      error: "No fue posible verificar la cédula. Intenta nuevamente.",
    };
  }
}

export async function crearReservaPublicaAccion(
  _: EstadoReservaPublica,
  formulario: FormData,
): Promise<EstadoReservaPublica> {
  try {
    await crearReservaPublica({
      profesionalId: String(formulario.get("profesionalId") ?? ""),
      asignacionId: String(formulario.get("asignacionId") ?? ""),
      documento: String(formulario.get("documento") ?? ""),
      nombre: String(formulario.get("nombre") ?? ""),
      telefono: String(formulario.get("telefono") ?? ""),
      sexo: String(formulario.get("sexo") ?? ""),
      inicio: String(formulario.get("inicio") ?? ""),
    });
    return {
      exito:
        "Reserva recibida correctamente. Recibirás las indicaciones de confirmación por WhatsApp.",
    };
  } catch (error) {
    return {
      error:
        error instanceof ErrorReservaPublica && error.codigo === "no_disponible"
          ? "Ese horario ya no está disponible. Elige otro para continuar."
          : "Revisa los datos e intenta nuevamente.",
    };
  }
}
