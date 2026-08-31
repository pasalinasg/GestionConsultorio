import { randomUUID } from "node:crypto";

import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";
import {
  type DatosAltaEmpresa,
  validarAltaEmpresa,
} from "./validacion-alta-empresa";

const DOMINIO_IDENTIDAD_TECNICA = "auth.gestion-consultorio.local";
const PERMISOS_PROPIETARIO = Array.from(
  { length: 22 },
  (_, indice) => indice + 1,
);

type FilaEmpresa = { id: string };

export class ErrorAltaEmpresa extends Error {
  constructor(
    readonly codigo:
      "empresa_no_disponible" | "usuario_no_disponible" | "alta_no_completada",
    readonly detalle?: string,
  ) {
    super(
      "No fue posible completar el alta. Revisa los datos e inténtalo de nuevo.",
    );
    this.name = "ErrorAltaEmpresa";
  }
}

export type ClienteAltaEmpresa = {
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
    select: (columnas: string) => {
      eq: (
        columna: string,
        valor: string,
      ) => {
        maybeSingle: () => Promise<{
          data: FilaEmpresa | null;
          error: unknown;
        }>;
      };
    };
    insert: (filas: unknown) => Promise<{ error: unknown }>;
    delete: () => {
      eq: (columna: string, valor: string) => Promise<{ error: unknown }>;
    };
  };
};

export function crearCorreoIdentidadTecnica(nombreUsuarioNormalizado: string) {
  return `${nombreUsuarioNormalizado}@${DOMINIO_IDENTIDAD_TECNICA}`;
}

function esErrorDuplicado(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function detalleError(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const dato = error as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };
    return [dato.message, dato.code, dato.details, dato.hint]
      .filter(Boolean)
      .join(" | ");
  }
  return error ? String(error) : undefined;
}

export async function crearEmpresaPropietaria(
  entrada: DatosAltaEmpresa,
  cliente: ClienteAltaEmpresa = crearClienteSupabaseAdministrativo() as unknown as ClienteAltaEmpresa,
) {
  const validacion = validarAltaEmpresa(entrada);
  if (!validacion.valido) {
    throw new ErrorAltaEmpresa("alta_no_completada");
  }

  const { data: empresaActiva, error: errorConsultaEmpresa } = await cliente
    .from("empresas")
    .select("id")
    .eq("estado", "activa")
    .maybeSingle();

  if (errorConsultaEmpresa || empresaActiva) {
    throw new ErrorAltaEmpresa(
      empresaActiva ? "empresa_no_disponible" : "alta_no_completada",
      detalleError(errorConsultaEmpresa),
    );
  }

  const ahora = new Date().toISOString();
  const empresaId = randomUUID();
  let identidadId: string | null = null;
  let empresaCreada = false;
  let usuarioCreado = false;

  try {
    const { data: identidad, error: errorIdentidad } =
      await cliente.auth.admin.createUser({
        email: crearCorreoIdentidadTecnica(
          validacion.datos.nombreUsuarioNormalizado,
        ),
        password: validacion.datos.contrasena,
        email_confirm: true,
      });

    if (errorIdentidad || !identidad.user) {
      throw new ErrorAltaEmpresa(
        "usuario_no_disponible",
        detalleError(errorIdentidad),
      );
    }

    identidadId = identidad.user.id;
    const { error: errorEmpresa } = await cliente.from("empresas").insert({
      id: empresaId,
      nombre: validacion.datos.nombreEmpresa,
      estado: "activa",
      creado_en: ahora,
      actualizado_en: ahora,
      inactivado_en: null,
    });

    if (errorEmpresa) {
      throw new ErrorAltaEmpresa(
        esErrorDuplicado(errorEmpresa)
          ? "empresa_no_disponible"
          : "alta_no_completada",
        detalleError(errorEmpresa),
      );
    }
    empresaCreada = true;

    const { error: errorUsuario } = await cliente.from("usuarios").insert({
      id: identidadId,
      empresa_id: empresaId,
      nombre_usuario: validacion.datos.nombreUsuario,
      nombre_usuario_normalizado: validacion.datos.nombreUsuarioNormalizado,
      estado: "activo",
      es_propietario: true,
      creado_en: ahora,
      actualizado_en: ahora,
      desactivado_en: null,
      desactivado_por_usuario_id: null,
    });

    if (errorUsuario) {
      throw new ErrorAltaEmpresa(
        esErrorDuplicado(errorUsuario)
          ? "usuario_no_disponible"
          : "alta_no_completada",
        detalleError(errorUsuario),
      );
    }
    usuarioCreado = true;

    const { error: errorPermisos } = await cliente
      .from("permisos_usuario")
      .insert(
        PERMISOS_PROPIETARIO.map((permisoId) => ({
          usuario_id: identidadId,
          permiso_id: permisoId,
          asignado_en: ahora,
          asignado_por_usuario_id: identidadId,
        })),
      );

    if (errorPermisos) {
      throw new ErrorAltaEmpresa("alta_no_completada");
    }

    return { nombreEmpresa: validacion.datos.nombreEmpresa };
  } catch (error) {
    if (usuarioCreado && identidadId) {
      await cliente.from("usuarios").delete().eq("id", identidadId);
    }

    if (empresaCreada) {
      await cliente.from("empresas").delete().eq("id", empresaId);
    }

    if (identidadId) {
      await cliente.auth.admin.deleteUser(identidadId);
    }

    if (error instanceof ErrorAltaEmpresa) {
      throw error;
    }

    throw new ErrorAltaEmpresa("alta_no_completada");
  }
}
