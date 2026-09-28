import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useMesActual from "./useMesActual";
import SummaryCard from "../../Components/SummaryCard";
import DashboardCharts from "./DashboardCharts";
import LogoEmblem from "../../Components/LogoEmblem";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, error } = useMesActual();
  const [showBalance, setShowBalance] = useState(true);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400 space-y-3">
        <svg
          className="animate-spin h-7 w-7 text-[#00BCD4]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-xs uppercase tracking-wider font-medium text-neutral-400">
          Cargando tu información...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center my-8">
        <i className="fas fa-circle-exclamation text-2xl mb-2" />
        <p className="font-semibold text-sm">Error al cargar el dashboard</p>
        <p className="text-xs text-rose-400/80 mt-1">Revisa tu conexión o intenta nuevamente.</p>
      </div>
    );
  }

  const ingresos = data?.data?.ingresos || [];
  const egresos = data?.data?.egresos || [];

  const totalIngresos = ingresos.reduce((acc, i) => acc + Number(i.monto), 0);
  const totalEgresos = egresos.reduce((acc, e) => acc + Number(e.monto), 0);
  const neto = totalIngresos - totalEgresos;

  const totalFlujo = totalIngresos + totalEgresos;
  const pctIngresos = totalFlujo > 0 ? Math.round((totalIngresos / totalFlujo) * 100) : 50;
  const pctEgresos = totalFlujo > 0 ? 100 - pctIngresos : 50;

  const saldoNumber = Number(data?.saldo_actual || 0);
  const formattedSaldo = saldoNumber.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [intPart, decPart] = formattedSaldo.split(".");

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ===== TARJETA DE SALDO HERO (ULTRA MODERNA FINTECH BLACK) ===== */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-[#1C1F28] via-[#14161C] to-[#0A0B0E] border border-white/[0.12] shadow-[0_24px_50px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.08)_inset] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#00BCD4] before:to-transparent">
        {/* Glow ambiental cian y zafiro */}
        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "#00BCD4" }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: "#0284c7" }}
        />

        {/* Marca de agua con el emblema geométrico de la marca */}
        <div className="absolute -right-8 -bottom-10 w-56 h-56 opacity-[0.04] pointer-events-none select-none text-white transform -rotate-12">
          <LogoEmblem className="w-full h-full" circleColor="currentColor" dotColor="#00BCD4" />
        </div>

        {/* Fila superior: Chip de estado y Controles de tarjeta */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BCD4] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00BCD4]" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
              Billetera Principal
            </span>
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-[#00BCD4] border border-[#00BCD4]/20 tracking-wider">
              En vivo
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Símbolo Contactless */}
            <svg
              className="w-5 h-5 text-neutral-500 opacity-60 hidden sm:block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M8.5 16.5a5 5 0 0 1 0-9" />
              <path d="M12 19a9 9 0 0 0 0-14" />
              <path d="M15.5 21.5a13 13 0 0 0 0-19" />
            </svg>

            {/* Ocultar / Mostrar Saldo */}
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white transition-all active:scale-90 cursor-pointer"
              title={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
              aria-label={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
            >
              <i className={`fas ${showBalance ? "fa-eye-slash" : "fa-eye"} text-xs`} />
            </button>
          </div>
        </div>

        {/* Sección Cifra de Saldo Principal */}
        <div className="relative z-10 mt-4 sm:mt-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Saldo Total Disponible
          </p>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-light text-[#00BCD4] select-none">$</span>
            {showBalance ? (
              <>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight tabular-nums">
                  {intPart}
                </span>
                <span className="text-xl sm:text-2xl font-semibold text-neutral-400 tabular-nums">
                  .{decPart}
                </span>
              </>
            ) : (
              <span className="text-3xl sm:text-4xl font-extrabold text-neutral-400 tracking-[0.25em] ml-1 select-none">
                ••••••
              </span>
            )}
          </div>

          {/* Pill Inteligente: Comparativa de Gasto / Ahorro vs Mes Pasado */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {data?.comparativa?.tiene_datos_mes_anterior ? (
              <>
                {/* Comparativa de Gasto */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums border transition-all ${
                    data.comparativa.porcentaje_egresos <= 0
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      : "bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  }`}
                >
                  <i
                    className={`fas ${
                      data.comparativa.porcentaje_egresos <= 0
                        ? "fa-arrow-trend-down text-emerald-400"
                        : "fa-arrow-trend-up text-amber-400"
                    } text-[11px]`}
                  />
                  <span>
                    {data.comparativa.porcentaje_egresos < 0
                      ? `Has gastado ${Math.abs(data.comparativa.porcentaje_egresos)}% menos`
                      : data.comparativa.porcentaje_egresos > 0
                      ? `Has gastado ${Math.abs(data.comparativa.porcentaje_egresos)}% más`
                      : "Mismo nivel de gasto"}
                  </span>
                  <span className="text-neutral-400 font-normal text-[10px]">que el mes pasado</span>
                </div>

                {/* Comparativa de Ahorro / Superávit Neto */}
                {data.comparativa.porcentaje_ahorro !== 0 && (
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums border ${
                      data.comparativa.porcentaje_ahorro > 0
                        ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/25 shadow-[0_0_12px_rgba(0,188,212,0.15)]"
                        : "bg-rose-500/10 text-rose-300 border-rose-500/25"
                    }`}
                  >
                    <i
                      className={`fas ${
                        data.comparativa.porcentaje_ahorro > 0
                          ? "fa-piggy-bank text-[#00BCD4]"
                          : "fa-arrow-trend-down text-rose-400"
                      } text-[11px]`}
                    />
                    <span>
                      {data.comparativa.porcentaje_ahorro > 0
                        ? `+${data.comparativa.porcentaje_ahorro}% ahorro neto`
                        : `${data.comparativa.porcentaje_ahorro}% ahorro neto`}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums border bg-white/[0.04] border-white/[0.08]">
                <i
                  className={`fas ${
                    neto >= 0 ? "fa-arrow-trend-up text-emerald-400" : "fa-arrow-trend-down text-rose-400"
                  } text-[11px]`}
                />
                <span className={neto >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {neto >= 0 ? "+" : "-"}${Math.abs(neto).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-neutral-500 font-normal text-[10px]">flujo neto del mes</span>
              </div>
            )}
          </div>
        </div>


        {/* Acciones Rápidas Integradas (Dock de FinTech) */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/[0.08]">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {/* Acción 1: Ingreso */}
            <button
              onClick={() => navigate("/app/transacciones/nueva", { state: { tipo: "Ingreso" } })}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.06] hover:bg-[#00BCD4]/15 border border-white/[0.08] hover:border-[#00BCD4]/50 hover:shadow-[0_0_15px_rgba(0,188,212,0.25)] flex items-center justify-center text-white transition-all duration-200 active:scale-90">
                <i className="fas fa-plus text-[#00BCD4] text-sm group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-medium text-neutral-300 group-hover:text-white transition-colors">
                Ingreso
              </span>
            </button>

            {/* Acción 2: Gasto */}
            <button
              onClick={() => navigate("/app/transacciones/nueva", { state: { tipo: "Egreso" } })}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.06] hover:bg-rose-500/15 border border-white/[0.08] hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.25)] flex items-center justify-center text-white transition-all duration-200 active:scale-90">
                <i className="fas fa-arrow-up text-rose-400 text-sm group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-medium text-neutral-300 group-hover:text-white transition-colors">
                Gasto
              </span>
            </button>

            {/* Acción 3: Historial */}
            <button
              onClick={() => navigate("/app/movimientos")}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-white transition-all duration-200 active:scale-90">
                <i className="fas fa-arrow-right-arrow-left text-neutral-300 text-sm group-hover:text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-medium text-neutral-300 group-hover:text-white transition-colors">
                Historial
              </span>
            </button>

            {/* Acción 4: Fijos */}
            <button
              onClick={() => navigate("/app/gastos-fijos")}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-white transition-all duration-200 active:scale-90">
                <i className="fas fa-list-check text-neutral-300 text-sm group-hover:text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-medium text-neutral-300 group-hover:text-white transition-colors">
                Fijos
              </span>
            </button>
          </div>
        </div>

        {/* Barra Visual de Proporción Mensual (Ingresos vs Egresos) */}
        {totalFlujo > 0 && (
          <div className="relative z-10 mt-5 pt-3.5 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Ingresos ${totalIngresos.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({pctIngresos}%)
              </span>
              <span className="flex items-center gap-1.5">
                ({pctEgresos}%) ${totalEgresos.toLocaleString("en-US", { minimumFractionDigits: 2 })} Egresos
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


      {/* ===== RESUMEN ===== */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
        <SummaryCard
          title="Ingresos mes actual"
          amount={totalIngresos}
          icon="fas fa-arrow-down"
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />

        <SummaryCard
          title="Egresos mes actual"
          amount={totalEgresos}
          icon="fas fa-arrow-up"
          color="text-rose-400"
          bg="bg-rose-500/10"
        />
      </div>

      {/* VISTA ESTADÍSTICAS */}
      <DashboardCharts />
    </div>
  );
}
