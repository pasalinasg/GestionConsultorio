import { describe, expect, it } from "vitest";
import {
  cambiarEstadoUsuario,
  type ClienteEstadoUsuario,
} from "@/features/usuarios/servicio-estado-usuario";
import {
  restablecerContrasenaUsuario,
  type ClienteContrasenas,
} from "@/features/usuarios/servicio-contrasenas";
import type { ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";

const propietario: ContextoAutorizado = {
  usuarioId: "owner",
  empresaId: "empresa-1",
  esPropietario: true,
  permisos: new Set(),
};

function clienteEstado() {
  const eventos: string[] = [];
  const cliente = {
    from(tabla: string) {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                id: "u-1",
                empresa_id: "empresa-1",
                estado: "activo",
                es_propietario: false,
              },
              error: null,
            }),
          }),
        }),
        update: (fila: { estado: string }) => ({
          eq: async () => {
            eventos.push(`estado:${fila.estado}`);
            return { error: null };
          },
        }),
        insert: async (fila: { codigo_evento: string }) => {
          eventos.push(`${tabla}:${fila.codigo_evento}`);
          return { error: null };
        },
      };
    },
  } as unknown as ClienteEstadoUsuario;
  return { cliente, eventos };
}

describe("estado y contraseña de usuarios", () => {
  it("desactiva y registra auditoría", async () => {
    const escenario = clienteEstado();
    await expect(
      cambiarEstadoUsuario("u-1", "inactivo", propietario, escenario.cliente),
    ).resolves.toBeUndefined();
    expect(escenario.eventos).toEqual([
      "estado:inactivo",
      "auditorias_acceso:usuario.desactivado",
    ]);
  });

  it("rechaza cambiar estado desde un usuario no propietario", async () => {
    const escenario = clienteEstado();
    await expect(
      cambiarEstadoUsuario(
        "u-1",
        "inactivo",
        { ...propietario, esPropietario: false },
        escenario.cliente,
      ),
    ).rejects.toMatchObject({ codigo: "no_autorizado" });
  });

  it("restablece contraseña mediante Auth sin devolver identidad técnica", async () => {
    let nueva: string | undefined;
    const cliente = {
      auth: {
        admin: {
          updateUserById: async (_id: string, datos: { password: string }) => {
            nueva = datos.password;
            return { error: null };
          },
        },
      },
      from: (tabla: string) => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                id: "u-1",
                empresa_id: "empresa-1",
                nombre_usuario_normalizado: "auxiliar",
                es_propietario: false,
              },
              error: null,
            }),
          }),
        }),
        insert: async () => ({
          error: tabla === "auditorias_acceso" ? null : null,
        }),
      }),
    } as unknown as ClienteContrasenas;
    await expect(
      restablecerContrasenaUsuario(
        "u-1",
        "NuevaClaveSegura1",
        propietario,
        cliente,
      ),
    ).resolves.toBeUndefined();
    expect(nueva).toBe("NuevaClaveSegura1");
  });
});
