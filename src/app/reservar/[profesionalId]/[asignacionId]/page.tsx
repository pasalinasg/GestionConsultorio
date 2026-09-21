import { notFound } from "next/navigation";
import { ReservaPublica } from "@/features/reserva-publica/reserva-publica";
import { obtenerDatosReservaPublica } from "@/features/reserva-publica/servicio-reserva-publica";
import { fechaHoraActualParaguay } from "@/features/agenda/tiempo-paraguay";

export const dynamic = "force-dynamic";

export default async function ReservaServicioPage({
  params,
}: {
  params: Promise<{ profesionalId: string; asignacionId: string }>;
}) {
  const { profesionalId, asignacionId } = await params;
  const datos = await obtenerDatosReservaPublica(profesionalId, asignacionId);
  if (!datos) notFound();
  return <ReservaPublica {...datos} ahoraInicial={fechaHoraActualParaguay()} />;
}
