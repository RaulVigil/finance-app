import { useState, useMemo } from "react";
import useDashboardGraficas from "./useDashboardGraficas";

const CATEGORY_COLORS = [
  "#00BCD4", // Cyan neón
  "#8B5CF6", // Violeta
  "#EC4899", // Rosa
  "#F59E0B", // Ámbar
  "#10B981", // Esmeralda
  "#3B82F6", // Azul
  "#F97316", // Naranja
  "#06B6D4", // Teal
  "#A855F7", // Púrpura
  "#64748B", // Pizarra
];

export default function DashboardCharts() {
  const { gastosCategoria = [], flujoCaja = [], loading } = useDashboardGraficas();
  const [activeCategory, setActiveCategory] = useState(null);
  const [chartMode, setChartMode] = useState("barras"); // "barras" | "tendencia"
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(null);

  /* ========================================================
   * CÁLCULOS: GASTOS POR CATEGORÍA
   * ======================================================== */
  const totalGastos = useMemo(() => {
    return (gastosCategoria || []).reduce((sum, item) => sum + Number(item.valor || 0), 0);
  }, [gastosCategoria]);

  const categoriesWithPercent = useMemo(() => {
    const list = gastosCategoria || [];
    const radius = 68;
    const circumference = 2 * Math.PI * radius; // ~427.25

    let accumulatedPercent = 0;
    return list.map((item, index) => {
      const val = Number(item.valor || 0);
      const ratio = totalGastos > 0 ? val / totalGastos : 0;
      const percent = Math.round(ratio * 100);
      const strokeLength = Math.max(0, ratio * circumference - 2);
      const strokeDasharray = `${strokeLength} ${circumference}`;
      const strokeDashoffset = -(accumulatedPercent * circumference);
      accumulatedPercent += ratio;

      const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
      return {
        ...item,
        valorNum: val,
        percent,
        color,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [gastosCategoria, totalGastos]);

  const activeCategoryData = useMemo(() => {
    if (activeCategory === null) return null;
    return categoriesWithPercent[activeCategory] || null;
  }, [activeCategory, categoriesWithPercent]);

  /* ========================================================
   * CÁLCULOS: FLUJO DE CAJA (6 MESES)
   * ======================================================== */
  const monthsData = useMemo(() => {
    return (flujoCaja || []).map((m, index) => {
      const ing = Number(m.ingresos || 0);
      const egr = Number(m.egresos || 0);
      const neto = ing - egr;
      return {
        ...m,
        index,
        ingresosNum: ing,
        egresosNum: egr,
        netoNum: neto,
      };
    });
  }, [flujoCaja]);

  // Mes activo seleccionado (por defecto el último)
  const currentMonthIndex = selectedMonthIndex ?? (monthsData.length > 0 ? monthsData.length - 1 : 0);
  const activeMonth = monthsData[currentMonthIndex] || null;

  // Valor máximo para escalar las barras
  const maxFlowValue = useMemo(() => {
    const max = Math.max(
      ...monthsData.map((m) => Math.max(m.ingresosNum, m.egresosNum)),
      100
    );
    return max * 1.15; // 15% de margen superior
  }, [monthsData]);

  // Totales acumulados de 6 meses
  const totalHistoricoIngresos = useMemo(
    () => monthsData.reduce((acc, m) => acc + m.ingresosNum, 0),
    [monthsData]
  );
  const totalHistoricoEgresos = useMemo(
    () => monthsData.reduce((acc, m) => acc + m.egresosNum, 0),
    [monthsData]
  );

  /* Puntos para la curva de tendencia neta */
  const trendPoints = useMemo(() => {
    if (monthsData.length === 0) return { path: "", area: "", points: [] };
    const width = 460;
    const height = 150;
    const paddingX = 35;
    const paddingY = 25;

    const netValues = monthsData.map((m) => m.netoNum);
    const minNet = Math.min(...netValues, 0);
    const maxNet = Math.max(...netValues, 0);
    const range = Math.max(maxNet - minNet, 50);

    const stepX = (width - paddingX * 2) / Math.max(monthsData.length - 1, 1);

    const pts = monthsData.map((m, i) => {
      const x = paddingX + i * stepX;
      const normalizedY = (m.netoNum - minNet) / range;
      const y = height - paddingY - normalizedY * (height - paddingY * 2);
      return { x, y, ...m };
    });

    // Generar curva Bézier suave
    let pathD = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const baselineY = height - paddingY - ((0 - minNet) / range) * (height - paddingY * 2);
    const areaD = `${pathD} L ${pts[pts.length - 1].x} ${baselineY} L ${pts[0].x} ${baselineY} Z`;

    return { path: pathD, area: areaD, baselineY, points: pts };
  }, [monthsData]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-5 animate-pulse">
        <div className="bg-[#13151B]/80 rounded-2xl sm:rounded-3xl p-6 h-64 border border-white/[0.06] flex items-center justify-center">
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
            Cargando estadísticas...
          </span>
        </div>
        <div className="bg-[#13151B]/80 rounded-2xl sm:rounded-3xl p-6 h-64 border border-white/[0.06] flex items-center justify-center">
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
            Cargando flujo de caja...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ========================================================
       * TARJETA 1: GASTOS POR CATEGORÍA (DONUT + BREAKDOWN)
       * ======================================================== */}
      <div className="relative overflow-hidden bg-[#13151B]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
        {/* Glow sutil en esquina */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "#00BCD4" }}
        />

        {/* Encabezado de la tarjeta */}
        <div className="relative z-10 flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Gastos por Categoría
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Distribución del mes actual</p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-semibold text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00BCD4]" />
            <span>{categoriesWithPercent.length} categorías</span>
          </div>
        </div>

        {categoriesWithPercent.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-500">
              <i className="fas fa-chart-pie text-xl" />
            </div>
            <p className="text-sm font-semibold text-neutral-300">Sin gastos este mes</p>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Cuando registres egresos, verás aquí su desglose visual por categoría.
            </p>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Donut SVG interactivo con información central */}
            <div className="md:col-span-5 flex justify-center items-center">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full transform -rotate-90 select-none"
                >
                  {/* Círculo base de fondo */}
                  <circle
                    cx="100"
                    cy="100"
                    r="68"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="14"
                  />

                  {/* Segmentos de categorías */}
                  {categoriesWithPercent.map((cat, idx) => {
                    const isSelected = activeCategory === idx;
                    const isDimmed = activeCategory !== null && !isSelected;

                    return (
                      <circle
                        key={cat.nombre + idx}
                        cx="100"
                        cy="100"
                        r="68"
                        fill="none"
                        stroke={cat.color}
                        strokeWidth={isSelected ? 18 : 14}
                        strokeDasharray={cat.strokeDasharray}
                        strokeDashoffset={cat.strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 cursor-pointer origin-center"
                        style={{
                          opacity: isDimmed ? 0.35 : 1,
                          filter: isSelected ? `drop-shadow(0 0 8px ${cat.color})` : "none",
                        }}
                        onMouseEnter={() => setActiveCategory(idx)}
                        onMouseLeave={() => setActiveCategory(null)}
                        onClick={() => setActiveCategory(activeCategory === idx ? null : idx)}
                      />
                    );
                  })}
                </svg>

                {/* Centro del Donut: Datos dinámicos */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
                  {activeCategoryData ? (
                    <>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate max-w-[130px]">
                        {activeCategoryData.nombre}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight mt-0.5">
                        ${activeCategoryData.valorNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span
                        className="text-[11px] font-bold mt-0.5 px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${activeCategoryData.color}20`,
                          color: activeCategoryData.color,
                        }}
                      >
                        {activeCategoryData.percent}% del total
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Total Gastos
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight mt-0.5">
                        ${totalGastos.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[11px] font-medium text-[#00BCD4] mt-0.5">
                        Mes en curso
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Lista interactiva de categorías con barra de progreso */}
            <div className="md:col-span-7 space-y-2.5">
              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                {categoriesWithPercent.map((cat, idx) => {
                  const isSelected = activeCategory === idx;
                  const isDimmed = activeCategory !== null && !isSelected;

                  return (
                    <div
                      key={cat.nombre + idx}
                      onMouseEnter={() => setActiveCategory(idx)}
                      onMouseLeave={() => setActiveCategory(null)}
                      onClick={() => setActiveCategory(activeCategory === idx ? null : idx)}
                      className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                        isSelected
                          ? "bg-white/[0.08] border-[#00BCD4]/40 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                          : "bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.05]"
                      } ${isDimmed ? "opacity-40" : "opacity-100"}`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: cat.color,
                              boxShadow: isSelected ? `0 0 8px ${cat.color}` : "none",
                            }}
                          />
                          <span className="font-semibold text-neutral-200 truncate">
                            {cat.nombre}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 tabular-nums">
                          <span className="text-[11px] font-medium text-neutral-400">
                            {cat.percent}%
                          </span>
                          <span className="font-bold text-white">
                            ${cat.valorNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Mini barra de progreso relativa */}
                      <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(cat.percent, 3)}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
       * TARJETA 2: FLUJO DE CAJA (HISTÓRICO 6 MESES - ULTRA RESPONSIVE)
       * ======================================================== */}
      <div className="relative overflow-hidden bg-[#13151B]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
        {/* Glow sutil en esquina */}
        <div
          className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "#10B981" }}
        />

        {/* Encabezado con Switcher de Modos */}
        <div className="relative z-10 flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Flujo de Caja
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Historial de los últimos 6 meses</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setChartMode("barras")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartMode === "barras"
                  ? "bg-[#00BCD4] text-[#0C0D10] shadow-[0_0_12px_rgba(0,188,212,0.4)]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <i className="fas fa-chart-column mr-1.5 text-[10px]" />
              Barras
            </button>
            <button
              onClick={() => setChartMode("tendencia")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartMode === "tendencia"
                  ? "bg-[#00BCD4] text-[#0C0D10] shadow-[0_0_12px_rgba(0,188,212,0.4)]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <i className="fas fa-chart-line mr-1.5 text-[10px]" />
              Tendencia
            </button>
          </div>
        </div>

        {/* Banner de Inspección del Mes Activo */}
        {activeMonth && (
          <div className="relative z-10 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white bg-white/[0.08] px-2.5 py-0.5 rounded-md uppercase tracking-wider text-[11px]">
                {activeMonth.name}
              </span>
              <span className="text-neutral-400 text-[11px]">Detalle del mes:</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 tabular-nums">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-neutral-400 text-[11px]">Ingresos:</span>
                <span className="font-bold text-emerald-400">
                  ${activeMonth.ingresosNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </span>

              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="text-neutral-400 text-[11px]">Egresos:</span>
                <span className="font-bold text-rose-400">
                  ${activeMonth.egresosNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </span>

              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[11px] border ${
                  activeMonth.netoNum >= 0
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                }`}
              >
                {activeMonth.netoNum >= 0 ? "+" : "-"}${Math.abs(activeMonth.netoNum).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* ========================================================
         * MODO 1: BARRAS COMPARATIVAS (100% VECTOR / CSS FLEX - CERO DISTORSIÓN)
         * ======================================================== */}
        {chartMode === "barras" && (
          <div className="relative z-10 pt-2 pb-1">
            {/* Líneas guía horizontales */}
            <div className="absolute inset-x-0 top-6 bottom-10 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="w-full border-b border-dashed border-white" />
              <div className="w-full border-b border-dashed border-white" />
              <div className="w-full border-b border-dashed border-white" />
            </div>

            {/* Contenedor de columnas de meses */}
            <div className="h-52 sm:h-56 flex items-end justify-between gap-1 sm:gap-3 px-1 sm:px-2">
              {monthsData.map((m, idx) => {
                const isSelected = currentMonthIndex === idx;
                const altIng = Math.max(3, (m.ingresosNum / maxFlowValue) * 100);
                const altEgr = Math.max(3, (m.egresosNum / maxFlowValue) * 100);

                return (
                  <div
                    key={m.name + idx}
                    onClick={() => setSelectedMonthIndex(idx)}
                    onMouseEnter={() => setSelectedMonthIndex(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {/* Par de Barras */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-[160px] pb-2">
                      {/* Barra Ingresos */}
                      <div className="relative w-2.5 sm:w-3.5 max-w-[16px] h-full flex items-end justify-center">
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            isSelected
                              ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                              : "bg-emerald-500/70 group-hover:bg-emerald-400"
                          }`}
                          style={{ height: `${altIng}%` }}
                        />
                      </div>

                      {/* Barra Egresos */}
                      <div className="relative w-2.5 sm:w-3.5 max-w-[16px] h-full flex items-end justify-center">
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            isSelected
                              ? "bg-gradient-to-t from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                              : "bg-rose-500/70 group-hover:bg-rose-400"
                          }`}
                          style={{ height: `${altEgr}%` }}
                        />
                      </div>
                    </div>

                    {/* Nombre del mes e indicador activo */}
                    <div className="pt-2 flex flex-col items-center">
                      <span
                        className={`text-[11px] sm:text-xs font-semibold tracking-tight transition-colors ${
                          isSelected
                            ? "text-[#00BCD4] font-bold"
                            : "text-neutral-400 group-hover:text-neutral-200"
                        }`}
                      >
                        {m.name}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1 transition-all ${
                          isSelected ? "bg-[#00BCD4] shadow-[0_0_6px_#00BCD4]" : "bg-transparent"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
         * MODO 2: TENDENCIA NETA (CURVA VECTORIAL SUAVE BÉZIER)
         * ======================================================== */}
        {chartMode === "tendencia" && (
          <div className="relative z-10 pt-2 pb-1">
            <div className="w-full h-52 sm:h-56 flex items-center justify-center">
              <svg viewBox="0 0 460 150" className="w-full h-full overflow-visible select-none">
                <defs>
                  {/* Gradiente de relleno para la curva */}
                  <linearGradient id="netAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00BCD4" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00BCD4" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Gradiente de línea */}
                  <linearGradient id="netLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00BCD4" />
                    <stop offset="50%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>

                {/* Línea base cero */}
                <line
                  x1="20"
                  y1={trendPoints.baselineY}
                  x2="440"
                  y2={trendPoints.baselineY}
                  stroke="rgba(255,255,255,0.12)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />

                {/* Área sombreada */}
                {trendPoints.area && (
                  <path d={trendPoints.area} fill="url(#netAreaGrad)" />
                )}

                {/* Línea de curva */}
                {trendPoints.path && (
                  <path
                    d={trendPoints.path}
                    fill="none"
                    stroke="url(#netLineGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 2px 8px rgba(0,188,212,0.4))" }}
                  />
                )}

                {/* Puntos interactivos sobre cada mes */}
                {trendPoints.points.map((pt, idx) => {
                  const isSelected = currentMonthIndex === idx;
                  const isPositive = pt.netoNum >= 0;

                  return (
                    <g
                      key={pt.name + idx}
                      className="cursor-pointer"
                      onClick={() => setSelectedMonthIndex(idx)}
                    >
                      {/* Halo del punto activo */}
                      {isSelected && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="10"
                          fill="none"
                          stroke={isPositive ? "#00BCD4" : "#F43F5E"}
                          strokeWidth="2"
                          opacity="0.6"
                          className="animate-ping"
                        />
                      )}

                      {/* Punto central */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? "6" : "4.5"}
                        fill="#12141A"
                        stroke={isPositive ? "#00BCD4" : "#F43F5E"}
                        strokeWidth={isSelected ? "3" : "2"}
                        className="transition-all duration-200"
                      />

                      {/* Etiqueta del mes debajo */}
                      <text
                        x={pt.x}
                        y="145"
                        textAnchor="middle"
                        fill={isSelected ? "#00BCD4" : "#9CA3AF"}
                        fontSize="11"
                        fontWeight={isSelected ? "700" : "500"}
                      >
                        {pt.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Resumen al pie del gráfico */}
        <div className="relative z-10 mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              Ingresos totales:
              <strong className="text-white ml-0.5 tabular-nums">
                ${totalHistoricoIngresos.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
              Egresos totales:
              <strong className="text-white ml-0.5 tabular-nums">
                ${totalHistoricoEgresos.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
