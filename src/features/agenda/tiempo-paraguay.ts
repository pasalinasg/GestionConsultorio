const zonaHoraria = "America/Asuncion";

export function fechaHoraActualParaguay(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: zonaHoraria,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha).reduce<Record<string, string>>((resultado, parte) => {
    if (parte.type !== "literal") resultado[parte.type] = parte.value;
    return resultado;
  }, {});

  return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}`;
}

export function fechaActualParaguay(fecha = new Date()) {
  return fechaHoraActualParaguay(fecha).slice(0, 10);
}

export function esFechaHoraPasadaParaguay(fechaHora: string, ahora = fechaHoraActualParaguay()) {
  return fechaHora.slice(0, 16) <= ahora;
}
