export type EstadoUsuario = "activo" | "inactivo";

export function validarTransicionUsuario(
  actual: EstadoUsuario,
  siguiente: EstadoUsuario,
) {
  if (actual === siguiente) return false;
  return (
    (actual === "activo" && siguiente === "inactivo") ||
    (actual === "inactivo" && siguiente === "activo")
  );
}
