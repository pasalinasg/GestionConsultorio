import { NextResponse } from "next/server";
import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";

const headers = {
  "Access-Control-Allow-Origin": "https://beta.nutribelen.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() { return new NextResponse(null, { status: 204, headers }); }

export async function GET() {
  const db = crearClienteSupabaseAdministrativo();
  const { data: empresa } = await db.from("empresas").select("id").limit(1).maybeSingle();
  if (!empresa) return NextResponse.json({ error: "Empresa no disponible" }, { status: 404, headers });
  const { data, error } = await db.from("profesionales_servicios").select("id,precio,profesional_id,profesionales(id,nombre_completo,descripcion),servicios(id,nombre,descripcion,modalidad,duracion_minutos)").eq("empresa_id", empresa.id).eq("estado", "activo").eq("servicios.estado", "activo").eq("profesionales.estado", "activo").order("id");
  if (error) return NextResponse.json({ error: "No fue posible cargar los servicios" }, { status: 500, headers });
  return NextResponse.json({ servicios: (data ?? []).map((item: Record<string, unknown>) => ({ id: item.id, precioGs: item.precio, profesional: Array.isArray(item.profesionales) ? item.profesionales[0] : item.profesionales, servicio: Array.isArray(item.servicios) ? item.servicios[0] : item.servicios })) }, { headers });
}
