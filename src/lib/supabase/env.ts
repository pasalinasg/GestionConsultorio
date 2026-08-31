function requerirVariable(nombre: string): string {
  const valor = process.env[nombre];

  if (!valor) {
    throw new Error(`Falta la variable de entorno requerida: ${nombre}.`);
  }

  return valor;
}

export function obtenerConfiguracionSupabasePublica() {
  return {
    url: requerirVariable("NEXT_PUBLIC_SUPABASE_URL"),
    clavePublicable: requerirVariable("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}
