export function formatearImporte(valor: number | string | null | undefined) {
  const numero = Number(valor ?? 0);
  const importe = new Intl.NumberFormat("es-PY", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numero) ? numero : 0);
  return `Gs. ${importe}`;
}

export function formatearEntradaImporte(valor: string) {
  const digitos = valor.replace(/\D/g, "");
  return digitos
    ? new Intl.NumberFormat("es-PY", { maximumFractionDigits: 0 }).format(
        Number(digitos),
      )
    : "";
}

export function parsearImporte(valor: string | null) {
  return Number((valor ?? "").replace(/\D/g, ""));
}

export function formatearModalidad(valor: string) {
  const etiquetas: Record<string, string> = {
    presencial: "Presencial",
    online: "Online",
  };
  const normalizado = valor.trim().toLowerCase();
  return (
    etiquetas[normalizado] ??
    valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase()
  );
}
