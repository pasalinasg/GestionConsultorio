"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TurnoListado } from "./tipos-agenda";
import { cambiarEstadoMiTurnoAccion, cambiarEstadoTurnoAccion, type EstadoAgendaAccion } from "./acciones-agenda";

const estadosDisponibles = ["pendiente", "confirmada", "rechazada", "vencida", "cancelada", "atendida", "no_asistio"];
function etiquetaEstado(valor: string) { return ({ pendiente: "Pendiente", confirmada: "Confirmada", rechazada: "Rechazada", vencida: "Vencida", cancelada: "Cancelada", atendida: "Atendida", no_asistio: "No asistió" } as Record<string, string>)[valor] ?? valor; }
function etiquetaResumenEstado(valor: string) { return ({ pendiente: "Pendientes", confirmada: "Confirmados", rechazada: "Rechazados", vencida: "Vencidos", cancelada: "Cancelados", atendida: "Atendidos", no_asistio: "No asistieron" } as Record<string, string>)[valor] ?? etiquetaEstado(valor); }
function formatearFecha(valor: string) { const [fecha, hora] = valor.slice(0, 16).split("T"); return fecha && hora ? `${fecha.split("-").reverse().join("/")}, ${hora}` : valor; }
function inicioSemana(fecha: string) { const dia = new Date(`${fecha}T12:00:00`); dia.setDate(dia.getDate() - ((dia.getDay() + 6) % 7)); return dia.toISOString().slice(0, 10); }
function finSemana(fecha: string) { const dia = new Date(`${inicioSemana(fecha)}T12:00:00`); dia.setDate(dia.getDate() + 6); return dia.toISOString().slice(0, 10); }
function inicioMes(fecha: string) { return `${fecha.slice(0, 7)}-01`; }
function finMes(fecha: string) { const dia = new Date(`${inicioMes(fecha)}T12:00:00`); dia.setMonth(dia.getMonth() + 1, 0); return dia.toISOString().slice(0, 10); }

export function AgendaInterna({ turnos, hoy, propia = false, puedeCrear = true, puedeEditar = true, nuevoHref = "/agenda/nuevo" }: { turnos: TurnoListado[]; hoy: string; propia?: boolean; puedeCrear?: boolean; puedeEditar?: boolean; nuevoHref?: string }) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState(() => inicioSemana(hoy));
  const [hasta, setHasta] = useState(() => finSemana(hoy));
  const [periodo, setPeriodo] = useState<"hoy" | "semana" | "mes" | "periodo">("semana");
  const [estadosSeleccionados, setEstadosSeleccionados] = useState<string[]>(["pendiente", "confirmada"]);
  const [menuEstadosAbierto, setMenuEstadosAbierto] = useState(false);
  const [banner, setBanner] = useState(false);
  const [estado, cambiar, pendiente] = useActionState(propia ? cambiarEstadoMiTurnoAccion : cambiarEstadoTurnoAccion, {} as EstadoAgendaAccion);
  const turnosEnPeriodo = useMemo(() => turnos.filter((t) => (!desde || t.inicio.slice(0, 10) >= desde) && (!hasta || t.inicio.slice(0, 10) <= hasta)), [turnos, desde, hasta]);
  const visibles = useMemo(() => turnosEnPeriodo.filter((t) => `${t.paciente} ${t.profesional} ${t.servicio}`.toLowerCase().includes(busqueda.toLowerCase()) && estadosSeleccionados.includes(t.estado)), [turnosEnPeriodo, busqueda, estadosSeleccionados]);
  const alternarEstado = (valor: string) => setEstadosSeleccionados((actual) => actual.includes(valor) ? actual.filter((item) => item !== valor) : [...actual, valor]);
  const seleccionarPeriodo = (valor: "hoy" | "semana" | "mes" | "periodo") => { setPeriodo(valor); if (valor === "hoy") { setDesde(hoy); setHasta(hoy); } if (valor === "semana") { setDesde(inicioSemana(hoy)); setHasta(finSemana(hoy)); } if (valor === "mes") { setDesde(inicioMes(hoy)); setHasta(finMes(hoy)); } };
  const clasePeriodo = (valor: typeof periodo) => `cursor-pointer rounded-full px-2.5 py-1 font-semibold ${periodo === valor ? "bg-[var(--sage)]/55 text-[var(--forest)]" : "text-[var(--muted)] hover:bg-[var(--cream)]"}`;

  useEffect(() => { if (!banner || (!estado.exito && !estado.error)) return; const t = window.setTimeout(() => { setBanner(false); if (estado.exito) router.refresh(); }, estado.exito ? 1800 : 5000); return () => window.clearTimeout(t); }, [banner, estado, router]);

  return <div className="grid gap-5">
    {banner && (estado.exito || estado.error) ? <p role={estado.error ? "alert" : "status"} className={`fixed right-5 top-5 z-[70] w-[min(90vw,30rem)] rounded-3xl border px-5 py-4 text-sm shadow-xl ${estado.error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{estado.error || estado.exito}</p> : null}
    {puedeCrear ? <div className="flex justify-end"><Link href={nuevoHref} className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-white">+ Nuevo turno</Link></div> : null}
    <div className="grid gap-3 xl:grid-cols-[1fr_390px_230px]">
      <label className="grid grid-rows-[20px_17px_44px] gap-1 text-sm text-[var(--muted)]"><span>{visibles.length} de {turnosEnPeriodo.length} turnos</span><span aria-hidden="true" /><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar paciente, profesional..." className="h-11 rounded-xl border border-[var(--line)] px-4 text-[var(--ink)]" /></label>
      <div className="grid grid-rows-[20px_17px_44px] gap-1"><div className="flex flex-wrap items-center gap-2 text-xs"><button type="button" onClick={() => seleccionarPeriodo("hoy")} className={clasePeriodo("hoy")}>Hoy</button><button type="button" onClick={() => seleccionarPeriodo("semana")} className={clasePeriodo("semana")}>Semana</button><button type="button" onClick={() => seleccionarPeriodo("mes")} className={clasePeriodo("mes")}>Mes</button><button type="button" onClick={() => seleccionarPeriodo("periodo")} className={clasePeriodo("periodo")}>Período</button></div><span aria-hidden="true" /><div className="grid grid-cols-2 gap-3"><input type="date" aria-label="Desde" value={desde} disabled={periodo !== "periodo"} onChange={(e) => setDesde(e.target.value)} className="h-11 rounded-xl border border-[var(--line)] px-3 text-sm text-[var(--ink)] disabled:cursor-not-allowed disabled:bg-[var(--cream)] disabled:text-[var(--muted)]" /><input type="date" aria-label="Hasta" value={hasta} disabled={periodo !== "periodo"} onChange={(e) => setHasta(e.target.value)} className="h-11 rounded-xl border border-[var(--line)] px-3 text-sm text-[var(--ink)] disabled:cursor-not-allowed disabled:bg-[var(--cream)] disabled:text-[var(--muted)]" /></div></div>
      <div className="relative self-end"><button type="button" onClick={() => setMenuEstadosAbierto((abierto) => !abierto)} className="flex h-11 w-full items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 text-left text-sm"><span className="truncate">{estadosSeleccionados.length ? estadosSeleccionados.map(etiquetaResumenEstado).join(", ") : "Seleccionar estados"}</span><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="ml-3 h-4 w-4 shrink-0 text-[var(--ink)]"><path d="m5 7 5 5 5-5" /></svg></button>{menuEstadosAbierto ? <div className="absolute right-0 z-20 mt-2 grid w-full min-w-56 gap-1 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-2 shadow-lg"><p className="px-2 pb-1 pt-1 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Estados</p>{estadosDisponibles.map((valor) => <label key={valor} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-[var(--cream)]"><input type="checkbox" checked={estadosSeleccionados.includes(valor)} onChange={() => alternarEstado(valor)} />{etiquetaEstado(valor)}</label>)}</div> : null}</div>
    </div>
    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)]"><div className="hidden gap-2 border-b border-[var(--line)] px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#71816a] sm:grid sm:grid-cols-[150px_1fr_1fr_1fr_110px]"><span>Fecha</span><span>Profesional</span><span>Paciente</span><span>Servicio</span><span>Estado</span></div>{visibles.map((t) => <div key={t.id} className="grid gap-2 border-b border-[var(--line)] px-5 py-4 text-left last:border-0 sm:grid-cols-[150px_1fr_1fr_1fr_110px] sm:items-center"><span className="justify-self-start text-sm">{formatearFecha(t.inicio)}</span><span className="justify-self-start">{t.profesional}</span><span className="justify-self-start"><strong>{t.paciente}</strong></span><span className="justify-self-start">{t.servicio}</span><form action={cambiar} onSubmit={() => setBanner(true)} className="w-full justify-self-start"><input type="hidden" name="id" value={t.id} /><select name="estado" defaultValue={t.estado} disabled={pendiente} onChange={(evento) => evento.currentTarget.form?.requestSubmit()} className="h-9 w-full rounded-lg border border-[var(--line)] px-2 text-left text-xs">{estadosDisponibles.map((x) => <option key={x} value={x}>{etiquetaEstado(x)}</option>)}</select></form></div>)}{!visibles.length ? <p className="p-10 text-center text-sm text-[var(--muted)]">Todavía no hay turnos con estos filtros.</p> : null}</div>
  </div>;
}
