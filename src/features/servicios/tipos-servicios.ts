export type ModalidadServicio = "presencial" | "online";
export type EstadoServicio = "activo" | "inactivo";
export type ServicioListado = {
  id: string;
  nombre: string;
  descripcion: string | null;
  modalidad: ModalidadServicio;
  duracionMinutos: number;
  estado: EstadoServicio;
};
