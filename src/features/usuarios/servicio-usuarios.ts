import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import { type ContextoAutorizado } from "@/features/autenticacion/servicio-autorizacion";
import { crearCorreoIdentidadTecnica } from "@/features/empresas/servicio-alta-empresa";
import { validarUsuarioInterno } from "./validacion-usuarios";
import type { DatosCrearUsuario } from "./tipos-usuarios";

export class ErrorUsuarios extends Error {
  constructor(
    readonly codigo:
      "no_autorizado" | "usuario_existente" | "operacion_invalida",
  ) {
    super("No fue posible completar la operación de usuarios.");
  }
}

export type ClienteUsuarios = {
  auth: {
    admin: {
      createUser: (datos: {
        email: string;
        password: string;
        email_confirm: boolean;
      }) => Promise<{ data: { user: { id: string } | null }; error: unknown }>;
      deleteUser: (id: string) => Promise<{ error: unknown }>;
    };
  };
  from: (tabla: string) => {
    insert: (filas: unknown) => Promise<{ error: unknown }>;
    delete: () => {
      eq: (columna: string, valor: string) => Promise<{ error: unknown }>;
    };
  };
};

export async function crearUsuarioInterno(
  entrada: DatosCrearUsuario,
  contexto: ContextoAutorizado,
  cliente: ClienteUsuarios = crearClienteSupabaseAdministrativo() as unknown as ClienteUsuarios,
) {
  if (!contexto.esPropietario || !contexto.usuarioId || !contexto.empresaId)
    throw new ErrorUsuarios("no_autorizado");
  const validacion = validarUsuarioInterno(entrada);
  if (!validacion.valido) throw new ErrorUsuarios("operacion_invalida");
  let identidadId: string | null = null;
  try {
    const identidad = await cliente.auth.admin.createUser({
      email: crearCorreoIdentidadTecnica(
        validacion.datos.nombreUsuarioNormalizado,
      ),
      password: validacion.datos.contrasena,
      email_confirm: true,
    });
    if (identidad.error || !identidad.data.user)
      throw new ErrorUsuarios("usuario_existente");
    identidadId = identidad.data.user.id;
    const usuario = await cliente.from("usuarios").insert({
      id: identidadId,
      empresa_id: contexto.empresaId,
      nombre_usuario: validacion.datos.nombreUsuario,
      nombre_usuario_normalizado: validacion.datos.nombreUsuarioNormalizado,
      estado: "activo",
      es_propietario: false,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
      desactivado_en: null,
      desactivado_por_usuario_id: null,
    });
    if (usuario.error) throw new ErrorUsuarios("usuario_existente");
    if (validacion.datos.permisos.length > 0) {
      const permisos = await cliente.from("permisos_usuario").insert(
        validacion.datos.permisos.map((permisoId) => ({
          usuario_id: identidadId,
          permiso_id: permisoId,
          asignado_en: new Date().toISOString(),
          asignado_por_usuario_id: contexto.usuarioId,
        })),
      );
      if (permisos.error) throw new ErrorUsuarios("operacion_invalida");
    }
    return { usuarioId: identidadId };
  } catch (error) {
    if (identidadId) {
      await cliente.from("usuarios").delete().eq("id", identidadId);
      await cliente.auth.admin.deleteUser(identidadId);
    }
    if (error instanceof ErrorUsuarios) throw error;
    throw new ErrorUsuarios("operacion_invalida");
  }
}
