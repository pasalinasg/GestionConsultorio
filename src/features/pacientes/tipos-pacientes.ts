export type EstadoPaciente = "prospecto" | "activo" | "inactivo";

export type PacienteListado = {
  id: string;
  nombreApellido: string;
  documento: string;
  telefono: string;
  sexo: string;
  estado: EstadoPaciente;
  creadoEn: string;
};

export type EntradaPaciente = {
  nombreApellido: string;
  documento: string;
  telefono: string;
  codigoPais: string;
  sexo: string;
};
