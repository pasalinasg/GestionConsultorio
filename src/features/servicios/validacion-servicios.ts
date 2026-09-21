import type {
  ModalidadServicio,
  PresentacionServicio,
} from "./tipos-servicios";
export function validarServicio(entrada: {
  nombre: string;
  descripcion: string;
  modalidad: string;
  duracion: string;
  presentacion: string;
  ordenPublico: string;
}) {
  const errores: Record<string, string> = {};
  const nombre = entrada.nombre.trim();
  const duracion = Number(entrada.duracion);
  const ordenPublico = Number(entrada.ordenPublico);
  if (nombre.length < 2 || nombre.length > 120)
    errores.nombre = "El nombre debe tener entre 2 y 120 caracteres.";
  if (!["presencial", "online"].includes(entrada.modalidad))
    errores.modalidad = "La modalidad no es valida.";
  if (!Number.isInteger(duracion) || duracion < 5 || duracion > 480)
    errores.duracion = "La duracion debe estar entre 5 y 480 minutos.";
  if (!["normal", "destacado", "promocion"].includes(entrada.presentacion))
    errores.presentacion = "La presentacion no es valida.";
  if (!Number.isInteger(ordenPublico) || ordenPublico < 0)
    errores.ordenPublico =
      "El orden debe ser un numero entero igual o mayor a cero.";
  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datos: {
      nombre,
      descripcion: entrada.descripcion.trim() || null,
      modalidad: entrada.modalidad as ModalidadServicio,
      duracion,
      presentacion: entrada.presentacion as PresentacionServicio,
      ordenPublico,
    },
  };
}
