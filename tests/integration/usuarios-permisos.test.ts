import { describe, expect, it } from "vitest";
import {
  crearUsuarioInterno,
  type ClienteUsuarios,
  ErrorUsuarios,
} from "@/features/usuarios/servicio-usuarios";
import {
  reemplazarPermisosUsuario,
  type ClientePermisos,
  ErrorPermisos,
} from "@/features/permisos/servicio-permisos";
import type { ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";

const propietario: ContextoAutorizado = {
  usuarioId: "owner",
  empresaId: "empresa-1",
  esPropietario: true,
  permisos: new Set(),
};

function clienteUsuarios(errorUsuario = false) {
  const inserciones: Array<{ tabla: string; filas: unknown }> = [];
  const cliente = {
    auth: {
      admin: {
        createUser: async () => ({
          data: { user: { id: "interno-1" } },
          error: null,
        }),
        deleteUser: async () => ({ error: null }),
      },
    },
    from(tabla: string) {
      return {
        insert: async (filas: unknown) => {
          inserciones.push({ tabla, filas });
          return {
            error:
              errorUsuario && tabla === "usuarios"
                ? new Error("duplicado")
                : null,
          };
        },
        delete: () => ({ eq: async () => ({ error: null }) }),
      };
    },
  } as unknown as ClienteUsuarios;
  return { cliente, inserciones };
}

describe("usuarios y permisos por empresa", () => {
  it("crea un usuario interno con permisos elegidos por el propietario", async () => {
    const escenario = clienteUsuarios();
    await expect(
      crearUsuarioInterno(
        {
          nombreUsuario: "auxiliar.agenda",
          contrasena: "ClaveSeguraDePrueba",
          confirmacionContrasena: "ClaveSeguraDePrueba",
          permisos: [7, 8],
        },
        propietario,
        escenario.cliente,
      ),
    ).resolves.toEqual({ usuarioId: "interno-1" });
    expect(escenario.inserciones.map((registro) => registro.tabla)).toEqual([
      "usuarios",
      "permisos_usuario",
    ]);
  });

  it("no permite crear usuarios desde un contexto sin propiedad", async () => {
    const escenario = clienteUsuarios();
    await expect(
      crearUsuarioInterno(
        {
          nombreUsuario: "auxiliar.agenda",
          contrasena: "ClaveSeguraDePrueba",
          confirmacionContrasena: "ClaveSeguraDePrueba",
          permisos: [7],
        },
        { ...propietario, esPropietario: false },
        escenario.cliente,
      ),
    ).rejects.toMatchObject({
      codigo: "no_autorizado",
    } satisfies Partial<ErrorUsuarios>);
  });

  it("no modifica permisos de otra empresa", async () => {
    const cliente = {
      from() {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: "u-2",
                  empresa_id: "empresa-2",
                  es_propietario: false,
                },
                error: null,
              }),
            }),
          }),
          delete: () => ({ eq: async () => ({ error: null }) }),
          insert: async () => ({ error: null }),
        };
      },
    } as unknown as ClientePermisos;
    await expect(
      reemplazarPermisosUsuario("u-2", [7], propietario, cliente),
    ).rejects.toMatchObject({
      codigo: "usuario_no_encontrado",
    } satisfies Partial<ErrorPermisos>);
  });
});
