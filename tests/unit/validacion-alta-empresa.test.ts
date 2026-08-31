import { describe, expect, it } from "vitest";
import {
  normalizarNombreUsuario,
  validarAltaEmpresa,
} from "@/features/empresas/validacion-alta-empresa";

describe("validación de alta de empresa", () => {
  it("normaliza el usuario para una unicidad visible", () => {
    expect(normalizarNombreUsuario("  Clínica.Nutri_01 ")).toBe(
      "clínica.nutri_01",
    );
  });

  it("acepta datos de alta válidos y conserva el nombre visible", () => {
    const resultado = validarAltaEmpresa({
      nombreEmpresa: "  Clínica   Renacer ",
      nombreUsuario: "Nutri.Centro_01",
      contrasena: "UnaClaveSegura1",
      confirmacionContrasena: "UnaClaveSegura1",
    });

    expect(resultado).toEqual({
      valido: true,
      datos: {
        nombreEmpresa: "Clínica Renacer",
        nombreUsuario: "Nutri.Centro_01",
        nombreUsuarioNormalizado: "nutri.centro_01",
        contrasena: "UnaClaveSegura1",
      },
    });
  });

  it("rechaza usuario inválido y contraseña insuficiente", () => {
    const resultado = validarAltaEmpresa({
      nombreEmpresa: "A",
      nombreUsuario: "no válido",
      contrasena: "corta",
      confirmacionContrasena: "otra",
    });

    expect(resultado).toMatchObject({
      valido: false,
      errores: {
        nombreEmpresa: expect.any(String),
        nombreUsuario: expect.any(String),
        contrasena: expect.any(String),
        confirmacionContrasena: expect.any(String),
      },
    });
  });
});
