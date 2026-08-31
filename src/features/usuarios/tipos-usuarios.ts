export type UsuarioSeguro = {
  id: string;
  empresaId: string;
  nombreUsuario: string;
  estado: "activo" | "inactivo";
  esPropietario: boolean;
  creadoEn: string;
};

export type DatosCrearUsuario = {
  nombreUsuario: string;
  contrasena: string;
  confirmacionContrasena: string;
  permisos: number[];
};
