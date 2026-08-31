import type { EntradaPaciente } from "./tipos-pacientes";
export function normalizarDocumento(valor: string) { return valor.trim().replace(/[^\dA-Za-z]/g, "").toUpperCase(); }
const longitudes: Record<string, number[]> = { "+595": [9], "+54": [10], "+55": [10, 11], "+591": [8], "+56": [9], "+598": [8], "+1": [10] };
export function normalizarTelefono(codigoPais: string, telefono: string) { const codigo = codigoPais.trim(); let local = telefono.replace(/\D/g, ""); const prefijo = codigo.replace(/\D/g, ""); if (local.startsWith(prefijo)) local = local.slice(prefijo.length); local = local.replace(/^0+/, ""); return { codigo, local, internacional: `${codigo}${local}` }; }
export function validarPaciente(entrada: EntradaPaciente) {
  const nombreApellido = entrada.nombreApellido.trim().replace(/\s+/g, " "); const documento = normalizarDocumento(entrada.documento); const telefono = normalizarTelefono(entrada.codigoPais, entrada.telefono); const sexo = entrada.sexo.trim().toLowerCase(); const errores: Record<string, string> = {};
  if (nombreApellido.length < 2 || nombreApellido.length > 160) errores.nombreApellido = "Ingresa nombre y apellido.";
  if (documento.length < 3 || documento.length > 40) errores.documento = "Ingresa una cédula válida.";
  if (!longitudes[telefono.codigo] || !longitudes[telefono.codigo].includes(telefono.local.length)) errores.telefono = "Ingresa un WhatsApp válido para el país seleccionado.";
  if (!sexo) errores.sexo = "Selecciona el sexo.";
  return { valido: Object.keys(errores).length === 0, errores, datos: { nombreApellido, documento, telefono: telefono.internacional, codigoPais: telefono.codigo, sexo } };
}
