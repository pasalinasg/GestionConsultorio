import { describe, expect, it } from "vitest";
import { ErrorAutorizacion } from "@/lib/errores-autorizacion";
import {
  crearCodigoPermiso,
  obtenerContextoAutorizado,
  requerirAutorizacion,
  tienePermiso,
  type ClienteAutorizacion,
  type ContextoAutorizado,
} from "@/features/autenticacion/servicio-autorizacion";

type EscenarioCliente = {
  usuarioAutenticado?: { id: string } | null;
  usuarioInterno?: Record<string, unknown> | null;
  asignaciones?: Array<{ permiso_id: number }>;
  permisos?: Array<{
    codigo_accion: string;
    recurso: { codigo: string } | null;
  }>;
};

function crearClientePrueba(escenario: EscenarioCliente): ClienteAutorizacion {
  return {
    auth: {
      getUser: async () => ({
        data: {
          user:
            escenario.usuarioAutenticado === undefined
              ? { id: "usuario-1" }
              : escenario.usuarioAutenticado,
        },
        error: null,
      }),
    },
    from(tabla: string) {
      return {
        select() {
          return {
            eq() {
              if (tabla === "usuarios") {
                return {
                  maybeSingle: async () => ({
                    data:
                      escenario.usuarioInterno === undefined
                        ? {
                            id: "usuario-1",
                            empresa_id: "empresa-1",
                            estado: "activo",
                            es_propietario: false,
                          }
                        : escenario.usuarioInterno,
                    error: null,
                  }),
                };
              }

              return Promise.resolve({
                data: escenario.asignaciones ?? [],
                error: null,
              });
            },
            in: async () => ({ data: escenario.permisos ?? [], error: null }),
          };
        },
      };
    },
  } as unknown as ClienteAutorizacion;
}

function crearContexto(
  permisos: string[] = [],
  esPropietario = false,
): ContextoAutorizado {
  return {
    usuarioId: "usuario-1",
    empresaId: "empresa-1",
    esPropietario,
    permisos: new Set(permisos),
  };
}

describe("servicio de autorización", () => {
  it("crea códigos de permiso estables", () => {
    expect(crearCodigoPermiso("agenda", "visualizar")).toBe(
      "agenda.visualizar",
    );
  });

  it("deniega una sesión ausente", async () => {
    const cliente = crearClientePrueba({ usuarioAutenticado: null });

    await expect(obtenerContextoAutorizado(cliente)).rejects.toMatchObject({
      codigo: "sesion_requerida",
    } satisfies Partial<ErrorAutorizacion>);
  });

  it("deniega un usuario interno inexistente", async () => {
    const cliente = crearClientePrueba({ usuarioInterno: null });

    await expect(obtenerContextoAutorizado(cliente)).rejects.toMatchObject({
      codigo: "usuario_no_encontrado",
    } satisfies Partial<ErrorAutorizacion>);
  });

  it("deniega una cuenta inactiva", async () => {
    const cliente = crearClientePrueba({
      usuarioInterno: {
        id: "usuario-1",
        empresa_id: "empresa-1",
        estado: "inactivo",
        es_propietario: false,
      },
    });

    await expect(obtenerContextoAutorizado(cliente)).rejects.toMatchObject({
      codigo: "usuario_inactivo",
    } satisfies Partial<ErrorAutorizacion>);
  });

  it("autoriza una acción asignada de forma explícita", async () => {
    const cliente = crearClientePrueba({
      asignaciones: [{ permiso_id: 7 }],
      permisos: [
        { codigo_accion: "visualizar", recurso: { codigo: "agenda" } },
      ],
    });

    const contexto = await requerirAutorizacion(
      "agenda",
      "visualizar",
      cliente,
    );

    expect(contexto.permisos.has("agenda.visualizar")).toBe(true);
  });

  it("otorga acceso total al propietario", () => {
    const contexto = crearContexto([], true);

    expect(tienePermiso(contexto, "usuarios", "editar")).toBe(true);
    expect(tienePermiso(contexto, "agenda", "validar_comprobante")).toBe(true);
  });
});
