import "server-only";

type NotificacionReserva = {
  paciente: string;
  telefono: string;
  servicio: string;
  inicio: string;
};

function textoNuevaReserva({ paciente, telefono, servicio, inicio }: NotificacionReserva) {
  const [fecha = "", hora = ""] = inicio.split("T");
  const [anio, mes, dia] = fecha.split("-");
  const fechaLegible = anio && mes && dia ? `${dia}/${mes}/${anio}` : fecha;

  return [
    "🗓️ Nueva consulta agendada",
    "",
    `Paciente: ${paciente}`,
    `WhatsApp: ${telefono}`,
    `Servicio: ${servicio}`,
    `Fecha: ${fechaLegible}`,
    `Horario: ${hora.slice(0, 5)}`,
    "",
    "Revisá la agenda para confirmar los detalles.",
  ].join("\n");
}

/** Envía un aviso sin afectar una reserva ya creada si el canal de avisos falla. */
export async function notificarNuevaReserva(reserva: NotificacionReserva) {
  const webhookUrl = process.env.N8N_NUEVA_RESERVA_WEBHOOK_URL;
  const usuario = process.env.N8N_NUEVA_RESERVA_USERNAME;
  const contrasena = process.env.N8N_NUEVA_RESERVA_PASSWORD;

  if (!webhookUrl || !usuario || !contrasena) {
    console.warn("La notificación de nueva reserva no está configurada.");
    return;
  }

  try {
    const autorizacion = Buffer.from(`${usuario}:${contrasena}`).toString("base64");
    const respuesta = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${autorizacion}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: "595994580614",
        text: textoNuevaReserva(reserva),
        email: "belenmarianutri@gmail.com",
        paciente: reserva.paciente,
        whatsappPaciente: reserva.telefono,
        servicio: reserva.servicio,
        fechaHora: reserva.inicio,
      }),
      cache: "no-store",
    });

    if (!respuesta.ok)
      console.error("No fue posible enviar la notificación de nueva reserva.");
  } catch {
    console.error("No fue posible conectar con el servicio de notificaciones.");
  }
}
