import { useState, useMemo } from "react";
import useDeudasDetalle from "./useDeudasDetalle";
import DeudaCard from "../../Components/DeudaCard";
import LogoEmblem from "../../Components/LogoEmblem";
import useAuthStore from "../../store/useAuthStore";
import Api from "../../Services/api";
import { toast } from "react-toastify";
import Modal from "../../Components/Modal";

const inputBase =
  "w-full rounded-xl bg-[#12141A] border border-white/[0.1] focus:border-[#00BCD4]/70 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none transition shadow-inner [color-scheme:dark]";



export default function Deudas() {
  const { cobrar, pagar, totales, loading, refetch } = useDeudasDetalle();
  const user = useAuthStore((state) => state.user);

  // Estados de vista y filtros
  const [tab, setTab] = useState("pagar"); // "pagar" | "cobrar"
  const [filtroEstado, setFiltroEstado] = useState("todas"); // "todas" | "activas" | "liquidadas"

  // Estados de modales
  const [modalNueva, setModalNueva] = useState(false);
  const [formNueva, setFormNueva] = useState({ tipo_deuda: "Pagar" });
  const [savingNueva, setSavingNueva] = useState(false);


  // Lista según pestaña
  const currentList = tab === "pagar" ? pagar : cobrar;
  const resumen = tab === "pagar" ? totales.pagar : totales.cobrar;

  const porcentaje =
    resumen.inicial > 0
      ? Math.min(100, Math.round(((resumen.inicial - resumen.pendiente) / resumen.inicial) * 100))
      : 0;

  // Filtrado de la lista
  const activasCount = useMemo(
    () => currentList.filter((d) => d.estado !== "Pagada" && Number(d.saldo_pendiente) > 0).length,
    [currentList]
  );
  const liquidadasCount = useMemo(
    () => currentList.filter((d) => d.estado === "Pagada" || Number(d.saldo_pendiente) <= 0).length,
    [currentList]
  );

  const filteredList = useMemo(() => {
    if (filtroEstado === "activas") {
      return currentList.filter((d) => d.estado !== "Pagada" && Number(d.saldo_pendiente) > 0);
    }
    if (filtroEstado === "liquidadas") {
      return currentList.filter((d) => d.estado === "Pagada" || Number(d.saldo_pendiente) <= 0);
    }
    return currentList;
  }, [currentList, filtroEstado]);

  // ── Crear nueva deuda ──
  async function handleCrearDeuda() {
    if (!formNueva.nombre_deuda || !formNueva.monto_total_inicial) {
      toast.error("Nombre y monto total son obligatorios");
      return;
    }
    const monto = Number(formNueva.monto_total_inicial);
    if (monto <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }
    setSavingNueva(true);
    try {
      await Api.postJson("deudas-crear", {
        usuario_id: user?.usuario_id,
        nombre_deuda: formNueva.nombre_deuda,
        tipo_deuda: formNueva.tipo_deuda || "Pagar",
        monto_total_inicial: monto,
        cuota_mensual: formNueva.cuota_mensual ? Number(formNueva.cuota_mensual) : 0,
        fecha_inicio: formNueva.fecha_inicio || new Date().toISOString().split("T")[0],
        fecha_vencimiento: formNueva.fecha_vencimiento || null,
      });
      toast.success(
        formNueva.tipo_deuda === "Cobrar"
          ? "Cuenta por cobrar registrada"
          : "Deuda registrada correctamente"
      );
      setModalNueva(false);
      setFormNueva({ tipo_deuda: tab === "cobrar" ? "Cobrar" : "Pagar" });
      refetch();
    } catch (e) {
      toast.error(e?.response?.data?.messages?.error || "Error al crear la deuda");
    } finally {
      setSavingNueva(false);
    }
  }


  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-44 bg-[#14161F] rounded-3xl border border-white/[0.06]" />
        <div className="h-28 bg-[#14161F] rounded-2xl border border-white/[0.06]" />
        <div className="h-28 bg-[#14161F] rounded-2xl border border-white/[0.06]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* ── CARD HERO GLOBAL: RESUMEN DE DEUDAS / COBROS ──────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#1C1F28] via-[#14161C] to-[#0A0B0E] border border-white/[0.12] shadow-[0_24px_50px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.08)_inset] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#00BCD4] before:to-transparent">
        {/* Glows ambientales */}
        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500"
          style={{ background: tab === "pagar" ? "#F43F5E" : "#10B981" }}
        />

        {/* Marca de agua */}
        <div className="absolute -right-8 -bottom-10 w-56 h-56 opacity-[0.04] pointer-events-none select-none text-white transform -rotate-12">
          <LogoEmblem className="w-full h-full" circleColor="currentColor" dotColor="#00BCD4" />
        </div>

        <div className="relative z-10 space-y-4">
          {/* Cabecera: Beacon + Título + Botón Nueva Deuda */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    tab === "pagar" ? "bg-rose-400" : "bg-emerald-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    tab === "pagar" ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                Gestión de Compromisos
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormNueva({ tipo_deuda: tab === "cobrar" ? "Cobrar" : "Pagar" });
                setModalNueva(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-black text-xs transition active:scale-95 shadow-[0_0_12px_rgba(0,188,212,0.3)] cursor-pointer flex items-center gap-1.5"
            >
              <i className="fas fa-plus text-[10px]" />
              <span>Nueva Deuda</span>
            </button>
          </div>

          {/* Switcher de Pestaña Principal (Por Pagar vs Por Cobrar) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setTab("pagar")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                tab === "pagar"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <i className="fas fa-money-bill-transfer text-[11px]" />
              <span>Por Pagar ({pagar.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("cobrar")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                tab === "cobrar"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <i className="fas fa-hand-holding-dollar text-[11px]" />
              <span>Por Cobrar ({cobrar.length})</span>
            </button>
          </div>

          {/* Cifra Hero Principal */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {tab === "pagar" ? "Total Pendiente por Liquidar" : "Total Pendiente por Cobrar"}
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                className={`text-2xl sm:text-3xl font-light select-none ${
                  tab === "pagar" ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                $
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight tabular-nums">
                {Number(resumen.pendiente).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs font-semibold text-neutral-400 ml-2">
                / ${Number(resumen.inicial).toLocaleString("en-US", { minimumFractionDigits: 0 })} Inicial
              </span>
            </div>
          </div>

          {/* Subtarjetas de métricas: Monto Inicial vs Pagado / Recibido */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.08]">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                {tab === "pagar" ? "Monto Inicial Contratado" : "Monto Total Prestado"}
              </span>
              <p className="text-base font-black text-white tabular-nums">
                ${Number(resumen.inicial).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">
                {tab === "pagar" ? "Total Amortizado" : "Total Recuperado"}
              </span>
              <p
                className={`text-base font-black tabular-nums ${
                  tab === "pagar" ? "text-cyan-400" : "text-emerald-400"
                }`}
              >
                ${Number(tab === "pagar" ? resumen.pagado : resumen.recibido).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Barra de Progreso de Amortización / Recuperación */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400 font-medium">
                {tab === "pagar" ? "Progreso de liquidación de deuda" : "Progreso de recuperación"}
              </span>
              <span
                className={`font-bold tabular-nums ${
                  tab === "pagar" ? "text-[#00BCD4]" : "text-emerald-400"
                }`}
              >
                {porcentaje}% completado
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  tab === "pagar"
                    ? "bg-gradient-to-r from-[#00BCD4] to-emerald-400 shadow-[0_0_8px_#00BCD4]"
                    : "bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_8px_#10B981]"
                }`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── LISTADO DE COMPROMISOS ─────────────────────────────────────────── */}
      <div className="space-y-3.5">
        {/* Cabecera de Lista con Filtros de Estado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            {tab === "pagar" ? "Deudas por Pagar" : "Cuentas por Cobrar"} ({currentList.length})
          </p>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] w-fit">
            <button
              type="button"
              onClick={() => setFiltroEstado("todas")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filtroEstado === "todas"
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Todas ({currentList.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado("activas")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filtroEstado === "activas"
                  ? "bg-[#00BCD4]/20 text-cyan-300 border border-[#00BCD4]/30 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Activas ({activasCount})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado("liquidadas")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filtroEstado === "liquidadas"
                  ? "bg-white/[0.12] text-neutral-200 border border-white/[0.1] shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Liquidadas ({liquidadasCount})
            </button>
          </div>
        </div>

        {/* Lista o Empty State */}
        {filteredList.length === 0 ? (
          <div className="text-center py-14 bg-[#13151B]/60 rounded-3xl border border-white/[0.06] p-6 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400">
              <i
                className={`fas ${
                  tab === "pagar" ? "fa-hand-holding-dollar" : "fa-coins"
                } text-xl text-[#00BCD4]`}
              />
            </div>
            <h3 className="font-bold text-white text-sm">
              {filtroEstado === "activas"
                ? tab === "pagar"
                  ? "¡Felicidades! No tienes deudas activas pendientes."
                  : "No tienes cuentas por cobrar activas."
                : filtroEstado === "liquidadas"
                ? "Sin compromisos liquidados aún."
                : tab === "pagar"
                ? "Sin deudas por pagar registradas"
                : "Sin cuentas por cobrar registradas"}
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              {tab === "pagar"
                ? "Registra tus préstamos o financiamientos para controlar tus cuotas y proyecciones de liquidación."
                : "Anota el dinero que te deben para tener claridad de tus cuentas por cobrar."}
            </p>
            <button
              type="button"
              onClick={() => {
                setFormNueva({ tipo_deuda: tab === "cobrar" ? "Cobrar" : "Pagar" });
                setModalNueva(true);
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00BCD4] text-[#0C0D10] font-bold text-xs transition active:scale-95 shadow-[0_0_12px_rgba(0,188,212,0.3)] cursor-pointer"
            >
              <i className="fas fa-plus text-[10px]" />
              {tab === "pagar" ? "Registrar primera deuda" : "Registrar primera cuenta por cobrar"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((deuda) => (
              <DeudaCard
                key={deuda.deuda_id}
                deuda={deuda}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL: NUEVA DEUDA / COMPROMISO ───────────────────────────────── */}
      {modalNueva && (
        <Modal
          title={formNueva.tipo_deuda === "Cobrar" ? "Nueva Cuenta por Cobrar" : "Nueva Deuda por Pagar"}
          onClose={() => {
            setModalNueva(false);
            setFormNueva({ tipo_deuda: "Pagar" });
          }}
        >
          {/* Selector de Tipo */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setFormNueva({ ...formNueva, tipo_deuda: "Pagar" })}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                formNueva.tipo_deuda === "Pagar"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <i className="fas fa-money-bill-transfer text-[10px]" />
              <span>Por Pagar</span>
            </button>

            <button
              type="button"
              onClick={() => setFormNueva({ ...formNueva, tipo_deuda: "Cobrar" })}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                formNueva.tipo_deuda === "Cobrar"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <i className="fas fa-hand-holding-dollar text-[10px]" />
              <span>Por Cobrar</span>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-400 font-medium block">
              {formNueva.tipo_deuda === "Cobrar" ? "¿Quién te debe? / Concepto" : "Nombre de la deuda o acreedor"}
            </label>
            <input
              placeholder={
                formNueva.tipo_deuda === "Cobrar"
                  ? "Ej: Préstamo a Carlos Gómez, Anticipo..."
                  : "Ej: Préstamo Personal Banco, Deuda con Juan..."
              }
              className={inputBase}
              value={formNueva.nombre_deuda || ""}
              onChange={(e) => setFormNueva({ ...formNueva, nombre_deuda: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium block">
                Monto Total Inicial
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00BCD4] font-bold text-sm">$</span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className={`${inputBase} pl-8 text-base font-bold`}
                  value={formNueva.monto_total_inicial || ""}
                  onChange={(e) =>
                    setFormNueva({ ...formNueva, monto_total_inicial: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium block">
                Cuota Mensual (opcional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-sm">$</span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className={`${inputBase} pl-8`}
                  value={formNueva.cuota_mensual || ""}
                  onChange={(e) => setFormNueva({ ...formNueva, cuota_mensual: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium block">
                Fecha de Inicio
              </label>
              <input
                type="date"
                className={inputBase}
                value={formNueva.fecha_inicio || new Date().toISOString().split("T")[0]}
                onChange={(e) => setFormNueva({ ...formNueva, fecha_inicio: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium block">
                Fecha Vencimiento (opcional)
              </label>
              <input
                type="date"
                className={inputBase}
                value={formNueva.fecha_vencimiento || ""}
                onChange={(e) => setFormNueva({ ...formNueva, fecha_vencimiento: e.target.value })}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCrearDeuda}
            disabled={savingNueva}
            className="w-full py-3.5 rounded-2xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-black text-sm transition active:scale-95 shadow-[0_0_15px_rgba(0,188,212,0.3)] cursor-pointer mt-2"
          >
            {savingNueva ? "Guardando..." : "Crear Compromiso"}
          </button>
        </Modal>
      )}


    </div>
  );
}
