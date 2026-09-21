import { notFound } from "next/navigation";
import { ReservaPublica } from "@/features/reserva-publica/reserva-publica";
import { obtenerDatosReservaPublica } from "@/features/reserva-publica/servicio-reserva-publica";
import { fechaHoraActualParaguay } from "@/features/agenda/tiempo-paraguay";

export const dynamic = "force-dynamic";

export default async function ReservaProfesionalPage({ params }: { params: Promise<{ profesionalId: string }> }) {
  const { profesionalId } = await params;
  const datos = await obtenerDatosReservaPublica(profesionalId);
  if (!datos) notFound();
  return <ReservaPublica {...datos} ahoraInicial={fechaHoraActualParaguay()} />;
}
