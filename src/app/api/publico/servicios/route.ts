import { NextResponse } from "next/server";
import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";

const headers = {
  "Access-Control-Allow-Origin": "https://beta.nutribelen.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(request: Request) {
  const origen = new URL(request.url).origin;
  const db = crearClienteSupabaseAdministrativo();
  const { data: empresa } = await db
    .from("empresas")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (!empresa)
    return NextResponse.json(
      { error: "Empresa no disponible" },
      { status: 404, headers },
    );
  const { data, error } = await db
    .from("profesionales_servicios")
    .select(
      "id,precio,profesional_id,profesionales(id,nombre_completo,descripcion),servicios(id,nombre,descripcion,modalidad,duracion_minutos,presentacion,orden_publico)",
    )
    .eq("empresa_id", empresa.id)
    .eq("estado", "activo")
    .eq("servicios.estado", "activo")
    .eq("profesionales.estado", "activo")
    .order("id");
  if (error)
    return NextResponse.json(
      { error: "No fue posible cargar los servicios" },
      { status: 500, headers },
    );
  return NextResponse.json(
    {
      servicios: (data ?? [])
        .map((item: Record<string, unknown>) => {
          const profesional = Array.isArray(item.profesionales)
            ? item.profesionales[0]
            : item.profesionales;
          const servicio = Array.isArray(item.servicios)
            ? item.servicios[0]
            : item.servicios;
          const profesionalId = String(
            (profesional as Record<string, unknown> | null)?.id ??
              item.profesional_id,
          );
          return {
            id: item.id,
            precioGs: item.precio,
            enlaceReserva: `${origen}/reservar/${profesionalId}/${item.id}`,
            profesional,
            servicio,
          };
        })
        .sort(
          (a, b) =>
            Number((a.servicio as Record<string, unknown>).orden_publico ?? 0) -
              Number(
                (b.servicio as Record<string, unknown>).orden_publico ?? 0,
              ) ||
            String(
              (a.servicio as Record<string, unknown>).nombre,
            ).localeCompare(
              String((b.servicio as Record<string, unknown>).nombre),
              "es",
            ),
        ),
    },
    { headers },
  );
}
