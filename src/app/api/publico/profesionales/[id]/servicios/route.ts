import { NextResponse } from "next/server";
import { crearClienteSupabaseAdministrativo } from "@/lib/supabase/admin";

const headers = {
  "Access-Control-Allow-Origin": "https://beta.nutribelen.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() { return new NextResponse(null, { status: 204, headers }); }

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = crearClienteSupabaseAdministrativo();
  const { data: empresa } = await db.from("empresas").select("id").limit(1).maybeSingle();
  if (!empresa) return NextResponse.json({ error: "Empresa no disponible" }, { status: 404, headers });
  const { data: profesional } = await db.from("profesionales").select("id,nombre_completo,descripcion,estado").eq("id", id).eq("empresa_id", empresa.id).eq("estado", "activo").maybeSingle();
  if (!profesional) return NextResponse.json({ error: "Profesional no disponible" }, { status: 404, headers });
  const { data: servicios, error } = await db.from("profesionales_servicios").select("id,precio,servicios(id,nombre,descripcion,modalidad,duracion_minutos)").eq("empresa_id", empresa.id).eq("profesional_id", id).eq("estado", "activo").eq("servicios.estado", "activo").order("id");
  if (error) return NextResponse.json({ error: "No fue posible cargar los servicios" }, { status: 500, headers });
  return NextResponse.json({ profesional, servicios: (servicios ?? []).map((item: Record<string, unknown>) => ({ asignacionId: item.id, precioGs: item.precio, servicio: Array.isArray(item.servicios) ? item.servicios[0] : item.servicios })) }, { headers });
}
