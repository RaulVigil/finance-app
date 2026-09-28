import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useTransacciones from "./useTransacciones";
import TransactionCard from "../../Components/TransactionCard";
import LogoEmblem from "../../Components/LogoEmblem";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const MONTH_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

export default function Movimientos() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useTransacciones();

  // Estados de Filtros
  const [activeTab, setActiveTab] = useState("todos"); // "todos" | "ingresos" | "egresos" | "pendientes"
  const [searchQuery, setSearchQuery] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  // Estados de Filtro de Fecha (FinTech sin inputs de fecha nativos)
  const [dateFilter, setDateFilter] = useState("todos"); // "todos" | "este_mes" | "mes_anterior" | "ultimos_3_meses" | "mes_especifico"
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [showMonthModal, setShowMonthModal] = useState(false);

  const ingresos = useMemo(() => data?.data?.ingresos || [], [data]);
  const egresos = useMemo(() => data?.data?.egresos || [], [data]);
  const totalIngresosMonto = Number(data?.totales?.ingresos_monto || 0);
  const totalEgresosMonto = Number(data?.totales?.egresos_monto || 0);
  const netoHistorico = totalIngresosMonto - totalEgresosMonto;

  const totalFlujoHistorico = totalIngresosMonto + totalEgresosMonto;
  const pctIngresos = totalFlujoHistorico > 0 ? Math.round((totalIngresosMonto / totalFlujoHistorico) * 100) : 50;
  const pctEgresos = totalFlujoHistorico > 0 ? 100 - pctIngresos : 50;

  const formattedNeto = Math.abs(netoHistorico).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [netoInt, netoDec] = formattedNeto.split(".");

  // Unir todas las transacciones ordenadas cronológicamente
  const allTransacciones = useMemo(() => {
    return [...ingresos, ...egresos].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );
  }, [ingresos, egresos]);

  // Meses que tienen transacciones en el año seleccionado (para pintar puntitos de actividad)
  const activeMonthsInSelectedYear = useMemo(() => {
    const active = new Set();
    allTransacciones.forEach((tx) => {
      if (tx.fecha && tx.fecha.startsWith(String(selectedYear))) {
        const m = Number(tx.fecha.slice(5, 7)) - 1;
        active.add(m);
      }
    });
    return active;
  }, [allTransacciones, selectedYear]);

  // FILTRADO POR FECHA
  const filteredByDate = useMemo(() => {
    const now = new Date();
    const currentY = now.getFullYear();
    const currentM = now.getMonth();

    if (dateFilter === "todos") {
      return allTransacciones;
    }

    if (dateFilter === "este_mes") {
      const key = `${currentY}-${String(currentM + 1).padStart(2, "0")}`;
      return allTransacciones.filter((tx) => (tx.fecha || "").startsWith(key));
    }

    if (dateFilter === "mes_anterior") {
      const prevDate = new Date(currentY, currentM - 1, 1);
      const key = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
      return allTransacciones.filter((tx) => (tx.fecha || "").startsWith(key));
    }

    if (dateFilter === "ultimos_3_meses") {
      const limitDate = new Date(currentY, currentM - 2, 1);
      const limitStr = `${limitDate.getFullYear()}-${String(limitDate.getMonth() + 1).padStart(2, "0")}-01`;
      return allTransacciones.filter((tx) => (tx.fecha || "") >= limitStr);
    }

    if (dateFilter === "mes_especifico") {
      const key = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
      return allTransacciones.filter((tx) => (tx.fecha || "").startsWith(key));
    }

    return allTransacciones;
  }, [allTransacciones, dateFilter, selectedYear, selectedMonth]);

  // FILTRADO FINAL (POR TIPO, PENDIENTES Y BÚSQUEDA)
  const filteredList = useMemo(() => {
    let list = filteredByDate;

    if (activeTab === "ingresos") {
      list = list.filter((tx) => tx.tipo === "Ingreso");
    } else if (activeTab === "egresos") {
      list = list.filter((tx) => tx.tipo === "Egreso");
    } else if (activeTab === "pendientes") {
      list = list.filter((tx) => tx.estado !== "pagado");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((tx) => {
        const desc = (tx.descripcion || "").toLowerCase();
        const cat = (tx.categoria || "").toLowerCase();
        const monto = String(tx.monto || "");
        return desc.includes(q) || cat.includes(q) || monto.includes(q);
      });
    }

    return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [filteredByDate, activeTab, searchQuery]);

  // Contadores dinámicos del conjunto filtrado por fecha
  const totalCountInDateRange = filteredByDate.length;
  const ingresosCountInDateRange = useMemo(
    () => filteredByDate.filter((tx) => tx.tipo === "Ingreso").length,
    [filteredByDate]
  );
  const egresosCountInDateRange = useMemo(
    () => filteredByDate.filter((tx) => tx.tipo === "Egreso").length,
    [filteredByDate]
  );
  const pendientesCountInDateRange = useMemo(
    () => filteredByDate.filter((tx) => tx.estado !== "pagado").length,
    [filteredByDate]
  );

  // Totales de montos del periodo seleccionado
  const periodTotals = useMemo(() => {
    const ingMonto = filteredByDate
      .filter((tx) => tx.tipo === "Ingreso" && tx.estado === "pagado")
      .reduce((sum, tx) => sum + Number(tx.monto || 0), 0);
    const egrMonto = filteredByDate
      .filter((tx) => tx.tipo === "Egreso" && tx.estado === "pagado")
      .reduce((sum, tx) => sum + Number(tx.monto || 0), 0);
    return {
      ingresos: ingMonto,
      egresos: egrMonto,
      neto: ingMonto - egrMonto,
    };
  }, [filteredByDate]);

  // Etiqueta legible del periodo activo
  const activeDateLabel = useMemo(() => {
    if (dateFilter === "este_mes") return `Este mes (${MONTH_SHORT[new Date().getMonth()]})`;
    if (dateFilter === "mes_anterior") {
      const prevDate = new Date();
      prevDate.setMonth(prevDate.getMonth() - 1);
      return `Mes anterior (${MONTH_SHORT[prevDate.getMonth()]})`;
    }
    if (dateFilter === "ultimos_3_meses") return "Últimos 3 meses";
    if (dateFilter === "mes_especifico") return `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    return "Todo el historial";
  }, [dateFilter, selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-64 bg-[#13151B]/80 rounded-3xl border border-white/[0.06]" />
        <div className="h-12 bg-[#13151B]/80 rounded-xl border border-white/[0.06]" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 bg-[#13151B]/80 rounded-2xl border border-white/[0.06]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center my-8 space-y-3">
        <i className="fas fa-circle-exclamation text-3xl text-rose-400" />
        <p className="font-semibold text-white text-base">Error al cargar movimientos</p>
        <p className="text-xs text-neutral-400">
          No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
        >
          <i className="fas fa-rotate-right" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ========================================================
       * TARJETA HERO UNIFICADA DE MOVIMIENTOS (FINTECH BLACK)
       * ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#1C1F28] via-[#14161C] to-[#0A0B0E] border border-white/[0.12] shadow-[0_24px_50px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.08)_inset] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#00BCD4] before:to-transparent">
        {/* Halos ambientales */}
        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "#00BCD4" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: netoHistorico >= 0 ? "#10B981" : "#F43F5E" }}
        />

        {/* Marca de agua con el emblema geométrico de la marca */}
        <div className="absolute -right-8 -bottom-10 w-56 h-56 opacity-[0.04] pointer-events-none select-none text-white transform -rotate-12">
          <LogoEmblem className="w-full h-full" circleColor="currentColor" dotColor="#00BCD4" />
        </div>

        {/* Fila Superior: Título y Botón Nueva Transacción */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BCD4] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00BCD4]" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
              Movimientos
            </span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400 border border-white/[0.06] tracking-wider">
              Historial
            </span>
          </div>

          <button
            onClick={() => navigate("/app/transacciones/nueva")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-bold text-xs shadow-[0_0_15px_rgba(0,188,212,0.35)] transition-all active:scale-95 cursor-pointer"
          >
            <i className="fas fa-plus text-[10px]" />
            <span>Nueva transacción</span>
          </button>
        </div>

        {/* Sección Central: Balance Neto Acumulado + Tooltip explicativo */}
        <div className="relative z-10 mt-4 sm:mt-5">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <p className="text-[11px] font-medium uppercase tracking-wider">
              Balance Neto Acumulado
            </p>

            <button
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-neutral-400 hover:text-[#00BCD4] transition-colors p-1 focus:outline-none cursor-pointer"
              title="Información sobre Balance Neto Acumulado"
              aria-label="Información sobre Balance Neto Acumulado"
            >
              <i className={`fas ${showTooltip ? "fa-circle-xmark text-[#00BCD4]" : "fa-circle-info"} text-xs transition-colors`} />
            </button>
          </div>

          {/* Panel Explicativo Inline (100% adaptable en el flujo, imposible de cortarse) */}
          {showTooltip && (
            <div className="mt-2.5 mb-1 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-xs transition-all duration-200">
              <div className="flex items-start justify-between gap-2.5">
                <div>
                  <p className="font-bold text-[#00BCD4] text-[11px] mb-0.5">
                    ¿Qué es el Balance Neto Histórico?
                  </p>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Es la diferencia total entre todos tus ingresos cobrados y egresos pagados. Si es positivo representa tu <span className="text-emerald-400 font-semibold">superávit</span> acumulado; si es negativo representa un <span className="text-rose-400 font-semibold">déficit</span>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTooltip(false)}
                  className="text-neutral-400 hover:text-white p-1 text-xs shrink-0 cursor-pointer"
                  title="Cerrar"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            </div>
          )}

          {/* Cifra Principal */}
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-light text-[#00BCD4] select-none">
              {netoHistorico >= 0 ? "+" : "-"}$
            </span>
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight tabular-nums">
              {netoInt}
            </span>
            <span className="text-xl sm:text-2xl font-semibold text-neutral-400 tabular-nums">
              .{netoDec}
            </span>
          </div>

          {/* Pill de Estado: Superávit o Déficit */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums border bg-white/[0.04] border-white/[0.08]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                netoHistorico >= 0
                  ? "bg-emerald-400 shadow-[0_0_6px_#10B981]"
                  : "bg-rose-400 shadow-[0_0_6px_#F43F5E]"
              }`}
            />
            <span className={netoHistorico >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {netoHistorico >= 0 ? "Superávit acumulado" : "Déficit acumulado"}
            </span>
            <span className="text-neutral-500 font-normal text-[10px]">
              • {allTransacciones.length} movimientos
            </span>
          </div>
        </div>

        {/* Sección Inferior: Ingresos y Egresos Históricos */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.08]">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Sub-tarjeta Ingresos */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs">
                  <i className="fas fa-arrow-down" />
                </div>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  Ingresos
                </span>
              </div>
              <p className="text-base sm:text-lg font-extrabold text-emerald-400 tabular-nums">
                +${totalIngresosMonto.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-neutral-500">
                {ingresos.length} transacciones
              </span>
            </div>

            {/* Sub-tarjeta Egresos */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 text-xs">
                  <i className="fas fa-arrow-up" />
                </div>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  Egresos
                </span>
              </div>
              <p className="text-base sm:text-lg font-extrabold text-rose-400 tabular-nums">
                -${totalEgresosMonto.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-neutral-500">
                {egresos.length} transacciones
              </span>
            </div>
          </div>

          {/* Barra Visual Proporcional de Ingresos vs Egresos */}
          {totalFlujoHistorico > 0 && (
            <div className="mt-3.5 pt-2">
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Ingresos {pctIngresos}%
                </span>
                <span className="flex items-center gap-1">
                  Egresos {pctEgresos}%
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden flex">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${pctIngresos}%` }}
                />
                <div
                  className="h-full bg-rose-400 transition-all duration-500"
                  style={{ width: `${pctEgresos}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
       * SUITE DE FILTRO DE FECHAS (FINTECH STYLE - SIN INPUTS FEOS)
       * ======================================================== */}
      <div className="space-y-3">
        {/* Pills de Selección Rápida de Período */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setDateFilter("todos")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              dateFilter === "todos"
                ? "bg-[#00BCD4] text-[#0C0D10] shadow-[0_0_12px_rgba(0,188,212,0.35)]"
                : "bg-[#13151B]/90 text-neutral-400 hover:text-white border border-white/[0.08]"
            }`}
          >
            Todo
          </button>

          <button
            onClick={() => setDateFilter("este_mes")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              dateFilter === "este_mes"
                ? "bg-[#00BCD4] text-[#0C0D10] shadow-[0_0_12px_rgba(0,188,212,0.35)]"
                : "bg-[#13151B]/90 text-neutral-400 hover:text-white border border-white/[0.08]"
            }`}
          >
            Este mes
          </button>

          <button
            onClick={() => setDateFilter("mes_anterior")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              dateFilter === "mes_anterior"
                ? "bg-[#00BCD4] text-[#0C0D10] shadow-[0_0_12px_rgba(0,188,212,0.35)]"
                : "bg-[#13151B]/90 text-neutral-400 hover:text-white border border-white/[0.08]"
            }`}
          >
            Mes anterior
          </button>

          <button
            onClick={() => setDateFilter("ultimos_3_meses")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              dateFilter === "ultimos_3_meses"
                ? "bg-[#00BCD4] text-[#0C0D10] shadow-[0_0_12px_rgba(0,188,212,0.35)]"
                : "bg-[#13151B]/90 text-neutral-400 hover:text-white border border-white/[0.08]"
            }`}
          >
            Últimos 3 meses
          </button>

          <button
            onClick={() => {
              setDateFilter("mes_especifico");
              setShowMonthModal(true);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              dateFilter === "mes_especifico"
                ? "bg-[#00BCD4] text-[#0C0D10] shadow-[0_0_12px_rgba(0,188,212,0.35)]"
                : "bg-[#13151B]/90 text-neutral-400 hover:text-white border border-white/[0.08]"
            }`}
          >
            <i className="far fa-calendar text-[11px]" />
            <span>Por Mes</span>
            <i className="fas fa-chevron-down text-[9px] opacity-70" />
          </button>
        </div>

        {/* Stepper de Navegación Mes a Mes (Cuando se activa "Por Mes") */}
        {dateFilter === "mes_especifico" && (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-[#13151B]/90 border border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-top-1">
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear((y) => y - 1);
                } else {
                  setSelectedMonth((m) => m - 1);
                }
              }}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-neutral-300 hover:text-white transition cursor-pointer active:scale-95"
              title="Mes anterior"
            >
              <i className="fas fa-chevron-left text-xs" />
            </button>

            <button
              onClick={() => setShowMonthModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-white transition cursor-pointer"
            >
              <i className="far fa-calendar text-[#00BCD4]" />
              <span>
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </span>
              <span className="text-[10px] text-neutral-400 bg-white/[0.06] px-1.5 py-0.5 rounded">
                Cambiar ▾
              </span>
            </button>

            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear((y) => y + 1);
                } else {
                  setSelectedMonth((m) => m + 1);
                }
              }}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-neutral-300 hover:text-white transition cursor-pointer active:scale-95"
              title="Mes siguiente"
            >
              <i className="fas fa-chevron-right text-xs" />
            </button>
          </div>
        )}

        {/* Resumen dinámico del filtro de fecha activo */}
        {dateFilter !== "todos" && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00BCD4]" />
              <span className="text-neutral-400">
                Periodo: <strong className="text-white">{activeDateLabel}</strong> ({totalCountInDateRange} movs)
              </span>
            </div>

            <div className="flex items-center gap-3 tabular-nums text-[11px]">
              <span className="text-emerald-400 font-semibold">
                +${periodTotals.ingresos.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-rose-400 font-semibold">
                -${periodTotals.egresos.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <button
                onClick={() => setDateFilter("todos")}
                className="text-neutral-400 hover:text-white underline cursor-pointer ml-1"
              >
                Quitar filtro
              </button>
            </div>
          </div>
        )}

        {/* Barra de Búsqueda */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
            <i className="fas fa-magnifying-glass text-xs" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por descripción, categoría o monto..."
            className="w-full bg-[#13151B]/90 border border-white/[0.08] focus:border-[#00BCD4]/50 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white cursor-pointer"
            >
              <i className="fas fa-circle-xmark text-xs" />
            </button>
          )}
        </div>

        {/* Pestañas de Tipo (Tabs Segmentadas Modernas FinTech) */}
        <div className="p-1 sm:p-1.5 rounded-2xl bg-[#12141A]/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.35)] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {/* Tab 1: Todos */}
          <button
            onClick={() => setActiveTab("todos")}
            className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 select-none ${
              activeTab === "todos"
                ? "bg-gradient-to-b from-[#262A36] to-[#181B24] text-white border border-white/[0.16] shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)_inset]"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <i className={`fas fa-layer-group text-[11px] ${activeTab === "todos" ? "text-[#00BCD4]" : "text-neutral-500"}`} />
            <span>Todos</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums transition-colors ${
                activeTab === "todos"
                  ? "bg-white/[0.12] text-white"
                  : "bg-white/[0.04] text-neutral-400"
              }`}
            >
              {totalCountInDateRange}
            </span>
          </button>

          {/* Tab 2: Ingresos */}
          <button
            onClick={() => setActiveTab("ingresos")}
            className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 select-none ${
              activeTab === "ingresos"
                ? "bg-gradient-to-b from-emerald-500/20 to-emerald-500/10 text-emerald-300 border border-emerald-500/35 shadow-[0_4px_12px_rgba(16,185,129,0.2),0_1px_0_rgba(16,185,129,0.2)_inset]"
                : "text-neutral-400 hover:text-emerald-300 hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <i className={`fas fa-arrow-down text-[11px] ${activeTab === "ingresos" ? "text-emerald-400" : "text-neutral-500"}`} />
            <span>Ingresos</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums transition-colors ${
                activeTab === "ingresos"
                  ? "bg-emerald-500/25 text-emerald-200"
                  : "bg-white/[0.04] text-neutral-400"
              }`}
            >
              {ingresosCountInDateRange}
            </span>
          </button>

          {/* Tab 3: Egresos */}
          <button
            onClick={() => setActiveTab("egresos")}
            className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 select-none ${
              activeTab === "egresos"
                ? "bg-gradient-to-b from-rose-500/20 to-rose-500/10 text-rose-300 border border-rose-500/35 shadow-[0_4px_12px_rgba(244,63,94,0.2),0_1px_0_rgba(244,63,94,0.2)_inset]"
                : "text-neutral-400 hover:text-rose-300 hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <i className={`fas fa-arrow-up text-[11px] ${activeTab === "egresos" ? "text-rose-400" : "text-neutral-500"}`} />
            <span>Egresos</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums transition-colors ${
                activeTab === "egresos"
                  ? "bg-rose-500/25 text-rose-200"
                  : "bg-white/[0.04] text-neutral-400"
              }`}
            >
              {egresosCountInDateRange}
            </span>
          </button>

          {/* Tab 4: Pendientes */}
          {pendientesCountInDateRange > 0 && (
            <button
              onClick={() => setActiveTab("pendientes")}
              className={`flex-1 min-w-[105px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 select-none ${
                activeTab === "pendientes"
                  ? "bg-gradient-to-b from-amber-500/20 to-amber-500/10 text-amber-300 border border-amber-500/35 shadow-[0_4px_12px_rgba(245,158,11,0.2),0_1px_0_rgba(245,158,11,0.2)_inset]"
                  : "text-neutral-400 hover:text-amber-300 hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <i className={`fas fa-clock text-[11px] ${activeTab === "pendientes" ? "text-amber-400 animate-pulse" : "text-neutral-500"}`} />
              <span>Pendientes</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums transition-colors ${
                  activeTab === "pendientes"
                    ? "bg-amber-500/25 text-amber-200"
                    : "bg-white/[0.04] text-neutral-400"
                }`}
              >
                {pendientesCountInDateRange}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
       * MODAL SELECTOR DE MESES (12 PILLS DARK THEME)
       * ======================================================== */}
      {showMonthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#161822] border border-white/[0.14] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-5 sm:p-6 space-y-4">
            {/* Header del Modal con Selector de Año */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedYear((y) => y - 1)}
                  className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-neutral-300 hover:text-white text-xs cursor-pointer"
                >
                  <i className="fas fa-chevron-left" />
                </button>
                <span className="font-extrabold text-white text-base tracking-wide px-1">
                  {selectedYear}
                </span>
                <button
                  onClick={() => setSelectedYear((y) => y + 1)}
                  className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-neutral-300 hover:text-white text-xs cursor-pointer"
                >
                  <i className="fas fa-chevron-right" />
                </button>
              </div>

              <button
                onClick={() => setShowMonthModal(false)}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Grid de 12 Meses */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {MONTH_SHORT.map((mName, mIdx) => {
                const isSelected = selectedMonth === mIdx && dateFilter === "mes_especifico";
                const hasTransactions = activeMonthsInSelectedYear.has(mIdx);

                return (
                  <button
                    key={mName}
                    onClick={() => {
                      setSelectedMonth(mIdx);
                      setDateFilter("mes_especifico");
                      setShowMonthModal(false);
                    }}
                    className={`relative py-3 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-[#00BCD4] text-[#0C0D10] shadow-[0_0_15px_rgba(0,188,212,0.4)]"
                        : "bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/[0.06]"
                    }`}
                  >
                    <span>{mName}</span>
                    {/* Indicador de que ese mes tiene movimientos */}
                    {hasTransactions && !isSelected && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00BCD4]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Botón rápido "Mes actual" */}
            <button
              onClick={() => {
                const now = new Date();
                setSelectedYear(now.getFullYear());
                setSelectedMonth(now.getMonth());
                setDateFilter("este_mes");
                setShowMonthModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white transition cursor-pointer"
            >
              Ir al mes actual
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
       * LISTA DE MOVIMIENTOS FILTRADOS
       * ======================================================== */}
      <div className="space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="py-16 text-center bg-[#13151B]/50 rounded-2xl border border-white/[0.06] p-6 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-500">
              <i className="fas fa-folder-open text-xl" />
            </div>
            <p className="font-semibold text-neutral-200 text-sm">
              {searchQuery
                ? "No se encontraron coincidencias"
                : `No hay movimientos en ${activeDateLabel.toLowerCase()}`}
            </p>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              {searchQuery
                ? `Prueba buscando con otro término o limpia el buscador.`
                : "No se registraron transacciones para el período seleccionado."}
            </p>

            <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
              {dateFilter !== "todos" && (
                <button
                  onClick={() => setDateFilter("todos")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-neutral-300 transition cursor-pointer"
                >
                  Ver todo el historial
                </button>
              )}

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-neutral-300 transition cursor-pointer"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredList.map((tx) => (
            <TransactionCard key={tx.transaccion_id} tx={tx} onPaid={refetch} />
          ))
        )}
      </div>
    </div>
  );
}
