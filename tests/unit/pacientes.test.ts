import { describe, expect, it } from "vitest";
import { normalizarDocumento, validarPaciente } from "@/features/pacientes/validacion-pacientes";

describe("validación de pacientes", () => {
  it("normaliza la cédula", () => {
    expect(normalizarDocumento("  1.234.567-k ")).toBe("1234567K");
  });
  it("acepta los datos mínimos", () => {
    expect(validarPaciente({ nombreApellido: "Ana Pérez", documento: "123", telefono: "0981 123456", codigoPais: "+595", sexo: "femenino" }).valido).toBe(true);
  });
  it("rechaza datos incompletos", () => {
    expect(validarPaciente({ nombreApellido: "", documento: "", telefono: "", codigoPais: "+595", sexo: "" }).valido).toBe(false);
  });
});
