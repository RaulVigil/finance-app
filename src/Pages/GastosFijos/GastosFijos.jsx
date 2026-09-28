import { useState, useMemo } from "react";
import useGastosFijos from "./useGastosFijos";
import useCategorias from "../Transactions/useCategorias";
import useDeudas from "../Transactions/useDeudas";
import useTarjetas from "../Tarjetas/useTarjetas";
import Api from "../../Services/api";
import { toast } from "react-toastify";
import LogoEmblem from "../../Components/LogoEmblem";
import Modal from "../../Components/Modal";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const inputBase =
  "w-full rounded-xl bg-[#12141A] border border-white/[0.1] focus:border-[#00BCD4]/70 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition shadow-inner";


// ── Tarjeta de gasto pendiente moderna ────────────────────────────────
function GastoCard({ gasto, onSetMonto, onPagar, onEliminar }) {
  const isPagado = gasto.estado === "pagado";
  const sinMonto = !gasto.monto || Number(gasto.monto) === 0;

  return (
    <div
      className={`relative overflow-hidden bg-[#13151B]/85 hover:bg-[#181B22] border transition-all duration-200 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.25)] flex justify-between items-start gap-3 group ${
        isPagado
          ? "border-emerald-500/20 bg-emerald-500/[0.02]"
          : "border-white/[0.08] hover:border-white/[0.15]"
      }`}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isPagado ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
            }`}
          />
          <p className="font-semibold text-white text-sm sm:text-base truncate tracking-tight">
            {gasto.nombre}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {gasto.categoria && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/[0.05] text-[11px] font-medium text-neutral-300 border border-white/[0.06]">
              {gasto.categoria}
            </span>
          )}

          {gasto.descripcion && (
            <span className="text-neutral-400 text-xs truncate max-w-[200px]">
              {gasto.descripcion}
            </span>
          )}
        </div>

        {(gasto.deuda_id || gasto.tarjeta_id || gasto.tarjeta_nombre) && (
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#00BCD4] bg-[#00BCD4]/10 border border-[#00BCD4]/25 rounded-lg px-2 py-0.5">
              <i className={gasto.tarjeta_nombre ? "fas fa-credit-card text-[10px]" : "fas fa-file-invoice-dollar text-[10px]"} />
              {gasto.tarjeta_nombre
                ? `Tarjeta: ${gasto.tarjeta_nombre}`
                : gasto.nombre_deuda || "Cuota de deuda"}
            </span>

            {gasto.tarjeta_nombre && !gasto.deuda_id && (
              <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                Por reponer
              </span>
            )}

            {gasto.deuda_saldo_pendiente && (
              <span className="text-[10px] text-neutral-400 font-medium">
                Saldo: ${Number(gasto.deuda_saldo_pendiente).toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        {/* Monto */}
        {sinMonto && !isPagado ? (
          <button
            onClick={() => onSetMonto(gasto)}
            className="text-xs text-[#00BCD4] font-bold border border-[#00BCD4]/30 bg-[#00BCD4]/10 hover:bg-[#00BCD4]/20 rounded-xl px-2.5 py-1 transition cursor-pointer active:scale-95"
          >
            + Definir monto
          </button>
        ) : (
          <span
            className={`font-black text-sm sm:text-base tabular-nums ${
              isPagado ? "text-neutral-400" : "text-white"
            }`}
          >
            ${Number(gasto.monto).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}

        {/* Acciones y Estado */}
        {isPagado ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <i className="fas fa-check-circle" /> Pagado
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            {!sinMonto && (
              <button
                onClick={() => onPagar(gasto)}
                className="text-xs bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-black rounded-xl px-3 py-1 shadow-[0_0_10px_rgba(0,188,212,0.3)] transition cursor-pointer active:scale-95"
              >
                Pagar
              </button>
            )}

            {!sinMonto && (
              <button
                onClick={() => onSetMonto(gasto)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white border border-white/[0.08] transition cursor-pointer"
                title="Editar monto"
              >
                <i className="fas fa-pencil text-[10px]" />
              </button>
            )}

            <button
              onClick={() => onEliminar(gasto)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
              title="Eliminar gasto"
            >
              <i className="fas fa-trash text-[10px]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tarjeta de plantilla moderna ──────────────────────────────────────
function PlantillaCard({ plantilla, onEditar, onToggle }) {
  const isActiva = plantilla.activa == 1;

  return (
    <div className="bg-[#13151B]/85 hover:bg-[#181B22] border border-white/[0.08] hover:border-white/[0.15] transition-all rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.25)] flex justify-between items-center gap-3">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isActiva ? "bg-[#00BCD4] shadow-[0_0_6px_#00BCD4]" : "bg-neutral-600"
            }`}
          />
          <p className="font-semibold text-white text-sm sm:text-base truncate tracking-tight">
            {plantilla.nombre}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {plantilla.categoria && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/[0.05] text-[11px] font-medium text-neutral-300 border border-white/[0.06]">
              {plantilla.categoria}
            </span>
          )}

          {Number(plantilla.monto_estimado) > 0 ? (
            <span className="text-xs font-semibold text-neutral-300 tabular-nums">
              Estimado: ${Number(plantilla.monto_estimado).toFixed(2)}
            </span>
          ) : (
            <span className="text-xs text-neutral-500">Monto variable</span>
          )}
        </div>

        {(plantilla.deuda_id || plantilla.tarjeta_id || plantilla.tarjeta_nombre) && (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#00BCD4] bg-[#00BCD4]/10 border border-[#00BCD4]/25 rounded-md px-2 py-0.5">
              <i className={plantilla.tarjeta_nombre ? "fas fa-credit-card text-[9px]" : "fas fa-link text-[9px]"} />
              {plantilla.tarjeta_nombre
                ? `Cargo a tarjeta: ${plantilla.tarjeta_nombre}`
                : plantilla.nombre_deuda
                ? `Vinculada a: ${plantilla.nombre_deuda}`
                : "Vinculada a deuda"}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onEditar(plantilla)}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white border border-white/[0.08] transition cursor-pointer"
          title="Editar plantilla"
        >
          <i className="fas fa-pencil text-xs" />
        </button>

        <button
          onClick={() => onToggle(plantilla)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer active:scale-95 ${
            isActiva
              ? "bg-[#00BCD4]/15 text-[#00BCD4] border-[#00BCD4]/30"
              : "bg-white/[0.03] text-neutral-500 border-white/[0.06]"
          }`}
          title={isActiva ? "Desactivar plantilla" : "Activar plantilla"}
        >
          <i className={`fas ${isActiva ? "fa-toggle-on text-sm" : "fa-toggle-off text-sm"}`} />
          <span>{isActiva ? "Activa" : "Pausada"}</span>
        </button>
      </div>
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────
export default function GastosFijos() {
  const { gastos, totales, plantillas, loading, mes, setMes, anio, setAnio, refetch } =
    useGastosFijos();
  const { categorias } = useCategorias();
  const { deudas, refetch: refetchDeudas } = useDeudas();
  const { tarjetas } = useTarjetas();

  // Tabs: "pendientes" | "pagados" | "plantillas"
  const [tab, setTab] = useState("pendientes");

  // Deudas activas por pagar (incluye cuotas de tarjetas / tasa 0)
  const deudasPagar = useMemo(
    () => (deudas || []).filter((d) => d.tipo_deuda === "Pagar" && d.estado !== "Pagada"),
    [deudas]
  );

  // Modales
  const [modalGasto, setModalGasto] = useState(null);
  const [modalMonto, setModalMonto] = useState(null);
  const [modalPagar, setModalPagar] = useState(null);
  const [modalPlantilla, setModalPlantilla] = useState(null);

  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);



  const pendientes = useMemo(() => gastos.filter((g) => g.estado === "pendiente"), [gastos]);
  const pagados = useMemo(() => gastos.filter((g) => g.estado === "pagado"), [gastos]);

  const totalComprometido = Number(totales.pendiente || 0) + Number(totales.pagado || 0);
  const pctPagado = totalComprometido > 0 ? Math.round((Number(totales.pagado) / totalComprometido) * 100) : 0;
  const pctPendiente = 100 - pctPagado;

  const formattedPendiente = Number(totales.pendiente || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [penInt, penDec] = formattedPendiente.split(".");

  // ── Generar mes desde plantillas ──
  async function handleGenerarMes() {
    setSaving(true);
    try {
      const res = await Api.postJson("gastos-pendientes/generar-mes", { mes, anio });
      toast.success(res.data.message);
      refetch();
    } catch {
      toast.error("Error al generar gastos del mes");
    } finally {
      setSaving(false);
    }
  }

  // ── Crear gasto esporádico ──
  async function handleCrearGasto() {
    if (!form.nombre || !form.categoria_id) {
      toast.error("Nombre y categoría son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await Api.postJson("gastos-pendientes", { ...form, mes, anio });
      toast.success("Gasto agregado");
      setModalGasto(false);
      setForm({});
      refetch();
    } catch {
      toast.error("Error al crear el gasto");
    } finally {
      setSaving(false);
    }
  }

  // ── Definir monto ──
  async function handleSetMonto() {
    if (!form.monto || Number(form.monto) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    setSaving(true);
    try {
      await Api.patch(`gastos-pendientes/${modalMonto.gasto_id}/monto`, { monto: form.monto });
      toast.success("Monto actualizado");
      setModalMonto(null);
      setForm({});
      refetch();
    } catch {
      toast.error("Error al actualizar el monto");
    } finally {
      setSaving(false);
    }
  }

  // ── Pagar gasto ──
  async function handlePagar() {
    setSaving(true);
    try {
      await Api.postJson(`gastos-pendientes/${modalPagar.gasto_id}/pagar`, {});
      toast.success("✅ Gasto pagado correctamente");
      setModalPagar(null);
      refetch();
      if (refetchDeudas) refetchDeudas();
    } catch {
      toast.error("Error al pagar el gasto");
    } finally {
      setSaving(false);
    }
  }

  // ── Eliminar gasto ──
  async function handleEliminar(gasto) {
    if (!confirm(`¿Eliminar "${gasto.nombre}"?`)) return;
    try {
      await Api.delete(`gastos-pendientes/${gasto.gasto_id}`);
      toast.success("Gasto eliminado");
      refetch();
    } catch {
      toast.error("Error al eliminar");
    }
  }

  // ── Crear/Actualizar plantilla ──
  async function handleGuardarPlantilla() {
    if (!form.nombre || !form.categoria_id) {
      toast.error("Nombre y categoría son obligatorios");
      return;
    }
    setSaving(true);
    try {
      if (form.plantilla_id) {
        await Api.put(`gastos-fijos/plantillas/${form.plantilla_id}`, form);
      } else {
        await Api.postJson("gastos-fijos/plantillas", form);
      }
      toast.success(form.plantilla_id ? "Plantilla actualizada" : "Plantilla creada");
      setModalPlantilla(false);
      setForm({});
      refetch();
    } catch {
      toast.error("Error al guardar la plantilla");
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle activa plantilla ──
  async function handleTogglePlantilla(plantilla) {
    try {
      await Api.put(`gastos-fijos/plantillas/${plantilla.plantilla_id}`, {
        activa: plantilla.activa == 1 ? 0 : 1,
      });
      refetch();
    } catch {
      toast.error("Error al actualizar plantilla");
    }
  }

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-64 bg-[#13151B]/80 rounded-3xl border border-white/[0.06]" />
        <div className="h-12 bg-[#13151B]/80 rounded-xl border border-white/[0.06]" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#13151B]/80 rounded-2xl border border-white/[0.06]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ========================================================
       * TARJETA HERO UNIFICADA DE GASTOS FIJOS (FINTECH BLACK)
       * ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#1C1F28] via-[#14161C] to-[#0A0B0E] border border-white/[0.12] shadow-[0_24px_50px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.08)_inset] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#00BCD4] before:to-transparent">
        {/* Glows ambientales */}
        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "#00BCD4" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: Number(totales.pendiente) > 0 ? "#F59E0B" : "#10B981" }}
        />

        {/* Marca de agua con el emblema de la marca */}
        <div className="absolute -right-8 -bottom-10 w-56 h-56 opacity-[0.04] pointer-events-none select-none text-white transform -rotate-12">
          <LogoEmblem className="w-full h-full" circleColor="currentColor" dotColor="#00BCD4" />
        </div>

        {/* Fila Superior: Título y Navegador de Mes */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BCD4] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00BCD4]" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
              Gastos Fijos
            </span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400 border border-white/[0.06] tracking-wider">
              Checklist
            </span>
          </div>

          {/* Stepper Mes / Año en la cabecera */}
          <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => {
                if (mes === 1) {
                  setMes(12);
                  setAnio(anio - 1);
                } else {
                  setMes(mes - 1);
                }
              }}
              className="w-7 h-7 rounded-lg hover:bg-white/[0.1] text-neutral-300 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
              title="Mes anterior"
            >
              <i className="fas fa-chevron-left" />
            </button>

            <span className="text-xs font-bold text-white px-2 tracking-wide">
              {MESES[mes - 1]} {anio}
            </span>

            <button
              onClick={() => {
                if (mes === 12) {
                  setMes(1);
                  setAnio(anio + 1);
                } else {
                  setMes(mes + 1);
                }
              }}
              className="w-7 h-7 rounded-lg hover:bg-white/[0.1] text-neutral-300 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
              title="Mes siguiente"
            >
              <i className="fas fa-chevron-right" />
            </button>
          </div>
        </div>

        {/* Sección Cifra Hero: Pendiente por Pagar */}
        <div className="relative z-10 mt-4 sm:mt-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Pendiente por pagar este mes
          </p>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-light text-[#00BCD4] select-none">$</span>
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight tabular-nums">
              {penInt}
            </span>
            <span className="text-xl sm:text-2xl font-semibold text-neutral-400 tabular-nums">
              .{penDec}
            </span>
          </div>

          {/* Badge de Estado */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums border bg-white/[0.04] border-white/[0.08]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                pendientes.length === 0
                  ? "bg-emerald-400 shadow-[0_0_6px_#10B981]"
                  : "bg-amber-400 shadow-[0_0_6px_#F59E0B] animate-pulse"
              }`}
            />
            <span className={pendientes.length === 0 ? "text-emerald-400" : "text-amber-300"}>
              {pendientes.length === 0
                ? "¡Al día! Sin pagos pendientes"
                : `${pendientes.length} gastos pendientes`}
            </span>
            <span className="text-neutral-500 font-normal text-[10px]">
              • {gastos.length} registrados
            </span>
          </div>
        </div>

        {/* Sección Inferior: Sub-tarjetas de Resumen Mensual */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.08]">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Sub-tarjeta Pagado */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs">
                  <i className="fas fa-check" />
                </div>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  Pagado
                </span>
              </div>
              <p className="text-base sm:text-lg font-extrabold text-emerald-400 tabular-nums">
                ${Number(totales.pagado).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-neutral-500">
                {pagados.length} gastos completados
              </span>
            </div>

            {/* Sub-tarjeta Total Comprometido */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-[#00BCD4] text-xs">
                  <i className="fas fa-coins" />
                </div>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  Compromiso Total
                </span>
              </div>
              <p className="text-base sm:text-lg font-extrabold text-white tabular-nums">
                ${totalComprometido.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-neutral-500">
                {pctPagado}% pagado ({pctPendiente}% restante)
              </span>
            </div>
          </div>

          {/* Barra Visual Proporcional de Progreso */}
          {totalComprometido > 0 && (
            <div className="mt-3.5 pt-2">
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden flex">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${pctPagado}%` }}
                />
                <div
                  className="h-full bg-amber-400/80 transition-all duration-500"
                  style={{ width: `${pctPendiente}%` }}
                />
              </div>
            </div>
          )}

          {/* Acciones Rápidas del Hero */}
          <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
            <button
              onClick={handleGenerarMes}
              disabled={saving || plantillas.length === 0}
              className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-neutral-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition cursor-pointer active:scale-95"
            >
              <i className="fas fa-wand-magic-sparkles text-[#00BCD4] text-xs" />
              <span>Generar desde plantillas</span>
            </button>

            <button
              onClick={() => {
                setForm({ mes, anio });
                setModalGasto(true);
              }}
              className="py-2 px-3 rounded-xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(0,188,212,0.3)]"
            >
              <i className="fas fa-plus text-[10px]" />
              <span>Gasto manual</span>
            </button>

            <button
              onClick={() => {
                setForm({});
                setModalPlantilla(true);
              }}
              className="py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-neutral-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <i className="fas fa-repeat text-[10px]" />
              <span>Nueva plantilla</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
       * PESTAÑAS SEGMENTADAS MODERNAS FINTECH
       * ======================================================== */}
      <div className="p-1 sm:p-1.5 rounded-2xl bg-[#12141A]/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.35)] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {/* Tab 1: Por Pagar */}
        <button
          onClick={() => setTab("pendientes")}
          className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 select-none ${
            tab === "pendientes"
              ? "bg-gradient-to-b from-amber-500/20 to-amber-500/10 text-amber-300 border border-amber-500/35 shadow-[0_4px_12px_rgba(245,158,11,0.2),0_1px_0_rgba(245,158,11,0.2)_inset]"
              : "text-neutral-400 hover:text-amber-300 hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <i className={`fas fa-clock text-[11px] ${tab === "pendientes" ? "text-amber-400 animate-pulse" : "text-neutral-500"}`} />
          <span>Por Pagar</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums transition-colors ${
              tab === "pendientes" ? "bg-amber-500/25 text-amber-200" : "bg-white/[0.04] text-neutral-400"
            }`}
          >
            {pendientes.length}
          </span>
        </button>

        {/* Tab 2: Pagados */}
        <button
          onClick={() => setTab("pagados")}
          className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 select-none ${
            tab === "pagados"
              ? "bg-gradient-to-b from-emerald-500/20 to-emerald-500/10 text-emerald-300 border border-emerald-500/35 shadow-[0_4px_12px_rgba(16,185,129,0.2),0_1px_0_rgba(16,185,129,0.2)_inset]"
              : "text-neutral-400 hover:text-emerald-300 hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <i className={`fas fa-circle-check text-[11px] ${tab === "pagados" ? "text-emerald-400" : "text-neutral-500"}`} />
          <span>Pagados</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums transition-colors ${
              tab === "pagados" ? "bg-emerald-500/25 text-emerald-200" : "bg-white/[0.04] text-neutral-400"
            }`}
          >
            {pagados.length}
          </span>
        </button>

        {/* Tab 3: Plantillas Recurrentes */}
        <button
          onClick={() => setTab("plantillas")}
          className={`flex-1 min-w-[105px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 select-none ${
            tab === "plantillas"
              ? "bg-gradient-to-b from-[#00BCD4]/20 to-[#00BCD4]/10 text-cyan-300 border border-[#00BCD4]/35 shadow-[0_4px_12px_rgba(0,188,212,0.2),0_1px_0_rgba(0,188,212,0.2)_inset]"
              : "text-neutral-400 hover:text-cyan-300 hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <i className={`fas fa-repeat text-[11px] ${tab === "plantillas" ? "text-[#00BCD4]" : "text-neutral-500"}`} />
          <span>Plantillas</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums transition-colors ${
              tab === "plantillas" ? "bg-[#00BCD4]/25 text-cyan-200" : "bg-white/[0.04] text-neutral-400"
            }`}
          >
            {plantillas.length}
          </span>
        </button>
      </div>

      {/* ========================================================
       * CONTENIDO DE CADA TAB
       * ======================================================== */}

      {/* TAB: PENDIENTES */}
      {tab === "pendientes" && (
        <div className="space-y-2.5">
          {pendientes.length === 0 ? (
            <div className="py-14 text-center bg-[#13151B]/50 rounded-2xl border border-white/[0.06] p-6 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <i className="fas fa-check-double text-xl" />
              </div>
              <p className="font-bold text-white text-sm">¡Excelente! No tienes pagos pendientes</p>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Todos los gastos fijos de {MESES[mes - 1]} están cubiertos o aún no has generado los del mes.
              </p>
              {gastos.length === 0 && plantillas.length > 0 && (
                <button
                  onClick={handleGenerarMes}
                  disabled={saving}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00BCD4] text-[#0C0D10] font-bold text-xs transition active:scale-95 shadow-[0_0_12px_rgba(0,188,212,0.3)] cursor-pointer"
                >
                  <i className="fas fa-wand-magic-sparkles text-[10px]" />
                  Generar gastos desde plantillas
                </button>
              )}
            </div>
          ) : (
            pendientes.map((g) => (
              <GastoCard
                key={g.gasto_id}
                gasto={g}
                onSetMonto={(g) => {
                  setModalMonto(g);
                  setForm({ monto: g.monto || "" });
                }}
                onPagar={(g) => setModalPagar(g)}
                onEliminar={handleEliminar}
              />
            ))
          )}
        </div>
      )}

      {/* TAB: PAGADOS */}
      {tab === "pagados" && (
        <div className="space-y-2.5">
          {pagados.length === 0 ? (
            <div className="py-14 text-center bg-[#13151B]/50 rounded-2xl border border-white/[0.06] p-6 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-500">
                <i className="fas fa-receipt text-xl" />
              </div>
              <p className="font-bold text-neutral-200 text-sm">Aún no hay gastos pagados</p>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Cuando vayas marcando tus gastos como pagados, aparecerán archivados aquí.
              </p>
            </div>
          ) : (
            pagados.map((g) => (
              <GastoCard
                key={g.gasto_id}
                gasto={g}
                onSetMonto={() => {}}
                onPagar={() => {}}
                onEliminar={handleEliminar}
              />
            ))
          )}
        </div>
      )}

      {/* TAB: PLANTILLAS RECURRENTES */}
      {tab === "plantillas" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              Plantillas que se generan cada inicio de mes:
            </p>
            <button
              onClick={() => {
                setForm({});
                setModalPlantilla(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00BCD4] text-[#0C0D10] text-xs font-bold shadow-[0_0_10px_rgba(0,188,212,0.3)] transition cursor-pointer active:scale-95"
            >
              <i className="fas fa-plus text-[10px]" />
              <span>Nueva plantilla</span>
            </button>
          </div>

          {plantillas.length === 0 ? (
            <div className="py-14 text-center bg-[#13151B]/50 rounded-2xl border border-white/[0.06] p-6 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-500">
                <i className="fas fa-layer-group text-xl" />
              </div>
              <p className="font-bold text-neutral-200 text-sm">No tienes plantillas creadas</p>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Crea plantillas para gastos fijos recurrentes como alquiler, luz, internet o cuotas de deuda.
              </p>
              <button
                onClick={() => {
                  setForm({});
                  setModalPlantilla(true);
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00BCD4] text-[#0C0D10] font-bold text-xs transition active:scale-95 shadow-[0_0_12px_rgba(0,188,212,0.3)] cursor-pointer"
              >
                <i className="fas fa-plus text-[10px]" />
                Crear primera plantilla
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {plantillas.map((p) => (
                <PlantillaCard
                  key={p.plantilla_id}
                  plantilla={p}
                  onEditar={(p) => {
                    setForm({
                      plantilla_id: p.plantilla_id,
                      nombre: p.nombre,
                      descripcion: p.descripcion || "",
                      categoria_id: p.categoria_id,
                      monto_estimado: p.monto_estimado || "",
                      deuda_id: p.deuda_id || "",
                      tarjeta_id: p.tarjeta_id || "",
                    });
                    setModalPlantilla(true);
                  }}
                  onToggle={handleTogglePlantilla}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
       * MODALES EN DARK THEME FINTECH
       * ======================================================== */}

      {/* ── MODAL: Crear gasto esporádico / manual ── */}
      {modalGasto && (
        <Modal
          title="Agregar gasto manual"
          onClose={() => {
            setModalGasto(false);
            setForm({});
          }}
        >
          {/* Tipo / Origen del Gasto */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 font-medium block">
              ¿Cómo se pagó / Origen del gasto?
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#12141A] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setForm({ ...form, origen: "normal", tarjeta_id: null, deuda_id: null })}
                className={`py-2.5 px-2 rounded-xl text-[12px] font-bold transition flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 ${
                  (!form.origen || form.origen === "normal")
                    ? "bg-white/[0.12] text-white border border-white/[0.2] shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <i className="fas fa-wallet text-sm" />
                <span>Normal</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, origen: "deuda", tarjeta_id: null })}
                className={`py-2.5 px-2 rounded-xl text-[12px] font-bold transition flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 ${
                  form.origen === "deuda"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    : "text-neutral-400 hover:text-amber-300"
                }`}
              >
                <i className="fas fa-file-invoice-dollar text-sm" />
                <span>Deuda / Cuota</span>
              </button>
            </div>
          </div>



          {/* Si es Cuota de Deuda */}
          {form.origen === "deuda" && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 animate-in fade-in duration-200">
              <label className="text-xs text-amber-300 font-bold block flex items-center gap-1.5">
                <i className="fas fa-file-invoice-dollar text-xs" /> Deuda o compra a cuotas
              </label>
              {deudasPagar.length === 0 ? (
                <p className="text-xs text-neutral-400">No tienes deudas activas por pagar.</p>
              ) : (
                <select
                  className={inputBase}
                  value={form.deuda_id || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setForm({ ...form, deuda_id: null });
                    } else {
                      const sel = deudasPagar.find((d) => String(d.deuda_id) === String(val));
                      const cuota = Number(sel?.cuota_mensual || 0);
                      const saldo = Number(sel?.saldo_pendiente || 0);
                      const suggestedMonto =
                        cuota > 0 ? sel.cuota_mensual : saldo > 0 ? sel.saldo_pendiente : "";
                      const catDeuda = categorias.find(
                        (c) =>
                          Number(c.categoria_id) === 12 || c.nombre.toLowerCase().includes("deuda")
                      );
                      const catId12 = catDeuda ? catDeuda.categoria_id : 12;

                      setForm({
                        ...form,
                        deuda_id: val,
                        nombre:
                          cuota > 0 ? `Cuota: ${sel.nombre_deuda}` : `Pago: ${sel.nombre_deuda}`,
                        monto: suggestedMonto,
                        categoria_id: catId12,
                      });
                    }
                  }}
                >
                  <option value="" className="bg-[#161822]">
                    Selecciona una deuda
                  </option>
                  {deudasPagar.map((d) => (
                    <option key={d.deuda_id} value={d.deuda_id} className="bg-[#161822]">
                      {d.nombre_deuda}{" "}
                      {Number(d.cuota_mensual) > 0 ? `(Cuota: $${Number(d.cuota_mensual).toFixed(2)})` : ""}{" "}
                      · Saldo: ${Number(d.saldo_pendiente).toFixed(2)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">Nombre</label>
            <input
              placeholder="Ej: Luz, Internet, Compra..."
              className={inputBase}
              value={form.nombre || ""}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">Categoría</label>
            <select
              className={inputBase}
              value={form.categoria_id || ""}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
            >
              <option value="" className="bg-[#161822]">
                Selecciona categoría
              </option>
              {categorias.map((c) => (
                <option key={c.categoria_id} value={c.categoria_id} className="bg-[#161822]">
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">
              Monto (opcional, puedes definirlo después)
            </label>
            <input
              type="number"
              placeholder="0.00"
              className={inputBase}
              value={form.monto || ""}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">Descripción (opcional)</label>
            <input
              placeholder="Notas adicionales..."
              className={inputBase}
              value={form.descripcion || ""}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>

          <button
            onClick={handleCrearGasto}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-extrabold text-sm transition active:scale-95 shadow-[0_0_15px_rgba(0,188,212,0.3)] cursor-pointer mt-2"
          >
            {saving ? "Guardando..." : "Agregar gasto"}
          </button>
        </Modal>
      )}

      {/* ── MODAL: Definir monto ── */}
      {modalMonto && (
        <Modal
          title={`Definir monto — ${modalMonto.nombre}`}
          onClose={() => {
            setModalMonto(null);
            setForm({});
          }}
        >
          <p className="text-xs text-neutral-400">
            Ingresa el valor exacto a pagar para este gasto del mes:
          </p>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#00BCD4] font-bold text-sm">
              $
            </span>
            <input
              type="number"
              placeholder="0.00"
              className={`${inputBase} pl-8 text-base font-bold`}
              value={form.monto || ""}
              autoFocus
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
            />
          </div>
          <button
            onClick={handleSetMonto}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-extrabold text-sm transition active:scale-95 shadow-[0_0_15px_rgba(0,188,212,0.3)] cursor-pointer"
          >
            {saving ? "Guardando..." : "Guardar monto"}
          </button>
        </Modal>
      )}

      {/* ── MODAL: Confirmar pago ── */}
      {modalPagar && (
        <Modal title="Confirmar pago" onClose={() => setModalPagar(null)}>
          <div className="bg-[#12141A] rounded-2xl p-4 border border-white/[0.08] space-y-2">
            <p className="font-semibold text-white text-base">{modalPagar.nombre}</p>
            <p className="text-3xl font-black text-[#00BCD4] tabular-nums">
              ${Number(modalPagar.monto).toFixed(2)}
            </p>
            <p className="text-xs text-neutral-400">
              Este monto se descontará automáticamente de tu saldo disponible en cuenta corriente.
            </p>

            {(modalPagar.deuda_id || modalPagar.tarjeta_id || modalPagar.tarjeta_nombre) && (
              <div className="mt-3 pt-3 border-t border-white/[0.08] text-xs text-[#00BCD4] bg-[#00BCD4]/10 p-3 rounded-xl space-y-1 border border-[#00BCD4]/20">
                <p className="font-bold flex items-center gap-1.5">
                  <i className="fas fa-info-circle text-[11px]" /> {modalPagar.tarjeta_nombre ? "Reposición automática a tu tarjeta:" : "Abono automático a tu deuda:"}
                </p>
                {modalPagar.nombre_deuda && (
                  <p className="text-neutral-300">
                    • Se reducirá el saldo pendiente de <strong>"{modalPagar.nombre_deuda}"</strong>.
                  </p>
                )}
                {modalPagar.tarjeta_nombre && (
                  <p className="text-neutral-300">
                    • Se repondrán <strong>${Number(modalPagar.monto).toFixed(2)}</strong> de cupo disponible en tu tarjeta <strong>{modalPagar.tarjeta_nombre}</strong>.
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handlePagar}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-extrabold text-sm transition active:scale-95 shadow-[0_0_15px_rgba(0,188,212,0.3)] cursor-pointer"
          >
            {saving ? "Procesando..." : "Confirmar pago"}
          </button>
        </Modal>
      )}

      {/* ── MODAL: Plantilla ── */}
      {modalPlantilla && (
        <Modal
          title={form.plantilla_id ? "Editar plantilla" : "Nueva plantilla"}
          onClose={() => {
            setModalPlantilla(false);
            setForm({});
          }}
        >
          {/* Vinculación opcional */}
          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">
              Vincular a Tarjeta de Crédito o Deuda (opcional)
            </label>
            <select
              className={inputBase}
              value={
                form.tarjeta_id
                  ? `tarjeta:${form.tarjeta_id}`
                  : form.deuda_id
                  ? `deuda:${form.deuda_id}`
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setForm({ ...form, tarjeta_id: null, deuda_id: null });
                } else if (val.startsWith("tarjeta:")) {
                  const tId = val.replace("tarjeta:", "");
                  setForm({ ...form, tarjeta_id: tId, deuda_id: null });
                } else if (val.startsWith("deuda:")) {
                  const dId = val.replace("deuda:", "");
                  const sel = deudasPagar.find((d) => String(d.deuda_id) === String(dId));
                  const cuota = Number(sel?.cuota_mensual || 0);
                  const saldo = Number(sel?.saldo_pendiente || 0);
                  const suggestedMonto =
                    cuota > 0 ? sel.cuota_mensual : saldo > 0 ? sel.saldo_pendiente : "";
                  const catDeuda = categorias.find(
                    (c) =>
                      Number(c.categoria_id) === 12 || c.nombre.toLowerCase().includes("deuda")
                  );
                  const catId12 = catDeuda ? catDeuda.categoria_id : 12;

                  setForm({
                    ...form,
                    tarjeta_id: null,
                    deuda_id: dId,
                    nombre: cuota > 0 ? `Cuota: ${sel.nombre_deuda}` : `Pago: ${sel.nombre_deuda}`,
                    monto_estimado: suggestedMonto,
                    categoria_id: catId12,
                  });
                }
              }}
            >
              <option value="" className="bg-[#161822]">
                Ninguna (gasto recurrente regular de cuenta corriente)
              </option>
              {tarjetas.length > 0 && (
                <optgroup label="💳 Tarjetas de Crédito (cargo recurrente mensual)" className="bg-[#161822]">
                  {tarjetas.map((t) => (
                    <option key={`tarjeta:${t.tarjeta_id}`} value={`tarjeta:${t.tarjeta_id}`}>
                      💳 {t.nombre} {t.banco ? `(${t.banco})` : ""}
                    </option>
                  ))}
                </optgroup>
              )}
              {deudasPagar.length > 0 && (
                <optgroup label="📑 Deudas / Préstamos por pagar" className="bg-[#161822]">
                  {deudasPagar.map((d) => (
                    <option key={`deuda:${d.deuda_id}`} value={`deuda:${d.deuda_id}`}>
                      📑 {d.nombre_deuda} {Number(d.cuota_mensual) > 0 ? `(Cuota: $${Number(d.cuota_mensual).toFixed(2)})` : ""}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">Nombre</label>
            <input
              placeholder="Ej: Internet Fibra, Alquiler..."
              className={inputBase}
              value={form.nombre || ""}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">Categoría</label>
            <select
              className={inputBase}
              value={form.categoria_id || ""}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
            >
              <option value="" className="bg-[#161822]">
                Selecciona categoría
              </option>
              {categorias.map((c) => (
                <option key={c.categoria_id} value={c.categoria_id} className="bg-[#161822]">
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">
              Monto estimado (opcional si es variable)
            </label>
            <input
              type="number"
              placeholder="0.00"
              className={inputBase}
              value={form.monto_estimado || ""}
              onChange={(e) => setForm({ ...form, monto_estimado: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">Descripción (opcional)</label>
            <input
              placeholder="Notas sobre el gasto recurrente..."
              className={inputBase}
              value={form.descripcion || ""}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>

          <button
            onClick={handleGuardarPlantilla}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-extrabold text-sm transition active:scale-95 shadow-[0_0_15px_rgba(0,188,212,0.3)] cursor-pointer mt-2"
          >
            {saving ? "Guardando..." : form.plantilla_id ? "Actualizar plantilla" : "Crear plantilla"}
          </button>
        </Modal>
      )}
    </div>
  );
}
