import type { ModalidadServicio } from "./tipos-servicios";
export function validarServicio(entrada: {
  nombre: string;
  descripcion: string;
  modalidad: string;
  duracion: string;
}) {
  const errores: Record<string, string> = {};
  const nombre = entrada.nombre.trim();
  const duracion = Number(entrada.duracion);
  if (nombre.length < 2 || nombre.length > 120)
    errores.nombre = "El nombre debe tener entre 2 y 120 caracteres.";
  if (!["presencial", "online"].includes(entrada.modalidad))
    errores.modalidad = "La modalidad no es valida.";
  if (!Number.isInteger(duracion) || duracion < 5 || duracion > 480)
    errores.duracion = "La duracion debe estar entre 5 y 480 minutos.";
  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datos: {
      nombre,
      descripcion: entrada.descripcion.trim() || null,
      modalidad: entrada.modalidad as ModalidadServicio,
      duracion,
    },
  };
}
