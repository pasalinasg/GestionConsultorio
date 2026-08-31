import { describe, expect, it } from "vitest";
import {
  crearEmpresaPropietaria,
  type ClienteAltaEmpresa,
  ErrorAltaEmpresa,
} from "@/features/empresas/servicio-alta-empresa";

type Registro = { tabla: string; filas: unknown };

function crearClientePrueba(opciones?: {
  empresaActiva?: boolean;
  errorAlInsertar?: string;
}) {
  const inserciones: Registro[] = [];
  const eliminaciones: Array<{
    tabla: string;
    columna: string;
    valor: string;
  }> = [];
  const identidadesEliminadas: string[] = [];

  const cliente = {
    auth: {
      admin: {
        createUser: async () => ({
          data: { user: { id: "identidad-propietaria" } },
          error: null,
        }),
        deleteUser: async (id: string) => {
          identidadesEliminadas.push(id);
          return { error: null };
        },
      },
    },
    from(tabla: string) {
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => ({
                  data: opciones?.empresaActiva
                    ? { id: "empresa-existente" }
                    : null,
                  error: null,
                }),
              };
            },
          };
        },
        insert: async (filas: unknown) => {
          inserciones.push({ tabla, filas });
          return {
            error:
              opciones?.errorAlInsertar === tabla ? { code: "error" } : null,
          };
        },
        delete() {
          return {
            eq: async (columna: string, valor: string) => {
              eliminaciones.push({ tabla, columna, valor });
              return { error: null };
            },
          };
        },
      };
    },
  } as unknown as ClienteAltaEmpresa;

  return { cliente, inserciones, eliminaciones, identidadesEliminadas };
}

const datosValidos = {
  nombreEmpresa: "Clínica Renacer",
  nombreUsuario: "nutri.renacer",
  contrasena: "UnaClaveSegura1",
  confirmacionContrasena: "UnaClaveSegura1",
};

describe("alta única de empresa", () => {
  it("crea empresa, propietario y el catálogo completo de permisos", async () => {
    const escenario = crearClientePrueba();

    await expect(
      crearEmpresaPropietaria(datosValidos, escenario.cliente),
    ).resolves.toEqual({
      nombreEmpresa: "Clínica Renacer",
    });

    expect(escenario.inserciones.map(({ tabla }) => tabla)).toEqual([
      "empresas",
      "usuarios",
      "permisos_usuario",
    ]);
    expect(escenario.inserciones[2].filas).toHaveLength(22);
  });

  it("rechaza la segunda empresa antes de crear una identidad", async () => {
    const escenario = crearClientePrueba({ empresaActiva: true });

    await expect(
      crearEmpresaPropietaria(datosValidos, escenario.cliente),
    ).rejects.toMatchObject({
      codigo: "empresa_no_disponible",
    } satisfies Partial<ErrorAltaEmpresa>);
    expect(escenario.inserciones).toHaveLength(0);
    expect(escenario.identidadesEliminadas).toHaveLength(0);
  });

  it("compensa identidad y filas si la creación del usuario interno falla", async () => {
    const escenario = crearClientePrueba({ errorAlInsertar: "usuarios" });

    await expect(
      crearEmpresaPropietaria(datosValidos, escenario.cliente),
    ).rejects.toMatchObject({
      codigo: "alta_no_completada",
    } satisfies Partial<ErrorAltaEmpresa>);
    expect(escenario.eliminaciones).toEqual([
      expect.objectContaining({ tabla: "empresas", columna: "id" }),
    ]);
    expect(escenario.identidadesEliminadas).toEqual(["identidad-propietaria"]);
  });
});
