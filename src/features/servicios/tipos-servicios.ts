export type ModalidadServicio = "presencial" | "online";
export type EstadoServicio = "activo" | "inactivo";
export type PresentacionServicio = "normal" | "destacado" | "promocion";
export type ServicioListado = {
  id: string;
  nombre: string;
  descripcion: string | null;
  modalidad: ModalidadServicio;
  duracionMinutos: number;
  presentacion: PresentacionServicio;
  ordenPublico: number;
  estado: EstadoServicio;
};
