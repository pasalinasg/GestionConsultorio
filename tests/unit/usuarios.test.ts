import { describe, expect, it } from "vitest";
import {
  validarPermisos,
  validarUsuarioInterno,
} from "@/features/usuarios/validacion-usuarios";
import { validarTransicionUsuario } from "@/features/usuarios/estado-usuario";

describe("reglas de usuarios", () => {
  it("valida permisos del catálogo y elimina duplicados", () => {
    expect(validarPermisos([7, 8, 10])).toBe(true);
    expect(validarPermisos([7, 7])).toBe(false);
    expect(validarPermisos([99])).toBe(false);
  });

  it("normaliza el usuario y rechaza confirmación incorrecta", () => {
    const resultado = validarUsuarioInterno({
      nombreUsuario: "  Nutri.Aux ",
      contrasena: "ClaveSeguraDePrueba",
      confirmacionContrasena: "otra",
      permisos: [7],
    });
    expect(resultado.valido).toBe(false);
    if (!resultado.valido)
      expect(resultado.errores.confirmacionContrasena).toBeDefined();
  });

  it("solo permite transiciones explícitas entre estados", () => {
    expect(validarTransicionUsuario("activo", "inactivo")).toBe(true);
    expect(validarTransicionUsuario("inactivo", "activo")).toBe(true);
    expect(validarTransicionUsuario("activo", "activo")).toBe(false);
  });
});
