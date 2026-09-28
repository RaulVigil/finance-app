import { useState } from "react";
import TransactionMiniRow from "./TransactionMiniRow";

export default function DeudaCard({ deuda }) {
  const [open, setOpen] = useState(false);

  const isCobrar = deuda.tipo_deuda === "Cobrar";
  const isPagada = deuda.estado === "Pagada" || Number(deuda.saldo_pendiente) <= 0;

  const total = Number(deuda.monto_total_inicial || 0);
  const pendiente = Number(deuda.saldo_pendiente || 0);
  const cuota = Number(deuda.cuota_mensual || 0);
  const pagado = Math.max(0, total - pendiente);
  const porcentaje = total > 0 ? Math.min(100, Math.round((pagado / total) * 100)) : 0;

  // Cálculo de proyección de meses restantes
  const mesesFaltantes = cuota > 0 && pendiente > 0 ? Math.ceil(pendiente / cuota) : 0;

  const fechaEstimada = (() => {
    if (mesesFaltantes <= 0) return null;
    const hoy = new Date();
    const yaPagoEsteMes = deuda.transacciones?.some((tx) => {
      const fechaTx = new Date(tx.fecha);
      return (
        fechaTx.getMonth() === hoy.getMonth() &&
        fechaTx.getFullYear() === hoy.getFullYear()
      );
    });
    const mesesAAgregar = yaPagoEsteMes ? mesesFaltantes : Math.max(0, mesesFaltantes - 1);
    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + mesesAAgregar);
    return fechaFin.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  })();

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
        isPagada
          ? "bg-[#111318]/70 border-white/[0.05] opacity-75"
          : "bg-[#14161F] hover:bg-[#161822] border-white/[0.08] hover:border-white/[0.15]"
      }`}
    >
      {/* Botón Cabecera de la Tarjeta */}
      <div
        onClick={() => setOpen(!open)}
        className="p-4 sm:p-5 cursor-pointer select-none space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Lado izquierdo: Icono y datos principales */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isCobrar
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  : deuda.tarjeta_id
                  ? "bg-[#00BCD4]/10 text-[#00BCD4] border-[#00BCD4]/25"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/25"
              }`}
            >
              <i
                className={`fas ${
                  isCobrar
                    ? "fa-hand-holding-dollar"
                    : deuda.tarjeta_id
                    ? "fa-credit-card"
                    : "fa-money-bill-transfer"
                } text-sm`}
              />
            </div>

            <div className="min-w-0">
              <h4 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                {deuda.nombre_deuda}
              </h4>

              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {cuota > 0 && !isCobrar && (
                  <span className="text-[11px] text-neutral-400">
                    Cuota: <strong className="text-neutral-200">${cuota.toFixed(2)} / mes</strong>
                  </span>
                )}
                {isCobrar && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Por Cobrar
                  </span>
                )}
                {deuda.tarjeta_id && (
                  <span className="text-[10px] font-bold text-[#00BCD4] bg-[#00BCD4]/10 border border-[#00BCD4]/20 px-2 py-0.5 rounded-full">
                    Tarjeta
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lado derecho: Monto y Estado */}
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
              {isPagada ? (isCobrar ? "Cobrado" : "Liquidado") : (isCobrar ? "Por Cobrar" : "Por Liquidar")}
            </p>
            <p
              className={`text-base sm:text-lg font-black tabular-nums tracking-tight ${
                isPagada
                  ? "text-neutral-500 line-through"
                  : isCobrar
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              ${pendiente.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>

            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPagada
                    ? "bg-neutral-600"
                    : isCobrar
                    ? "bg-emerald-400 shadow-[0_0_6px_#10B981]"
                    : "bg-rose-400 shadow-[0_0_6px_#F43F5E]"
                }`}
              />
              <span className="text-[10px] font-semibold text-neutral-400">
                {isPagada ? "Completado" : "Activa"}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progreso de Amortización */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-neutral-400 font-medium">
              {isCobrar ? "Recuperado:" : "Amortizado:"}{" "}
              <strong className="text-white">${pagado.toFixed(2)}</strong> de ${total.toFixed(2)}
            </span>
            <span
              className={`font-bold tabular-nums ${
                isPagada
                  ? "text-neutral-400"
                  : isCobrar
                  ? "text-emerald-400"
                  : "text-[#00BCD4]"
              }`}
            >
              {porcentaje}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden flex">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isPagada
                  ? "bg-neutral-600"
                  : isCobrar
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "bg-gradient-to-r from-[#00BCD4] to-emerald-400 shadow-[0_0_8px_rgba(0,188,212,0.4)]"
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>

        {/* Toggle / Ver más */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-white/[0.04]">
          <span>
            {deuda.transacciones?.length || 0} {(deuda.transacciones?.length === 1) ? "abono registrado" : "abonos registrados"}
          </span>
          <span className="flex items-center gap-1 text-[#00BCD4] font-semibold">
            {open ? "Ocultar detalles" : "Ver movimientos"}
            <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </span>
        </div>
      </div>

      {/* DETALLES EXPANDIDOS */}
      {open && (
        <div className="border-t border-white/[0.08] bg-[#0E1015]/60 p-4 sm:p-5 space-y-3.5 animate-in fade-in duration-200">
          {/* Proyección de Pago (Si tiene cuota mensual) */}
          {!isPagada && cuota > 0 && pendiente > 0 && fechaEstimada && (
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <i className="fas fa-hourglass-half text-[#00BCD4]" />
                <span>
                  A este ritmo, terminarás en <strong className="text-white">{mesesFaltantes} {mesesFaltantes === 1 ? "mes" : "meses"}</strong>
                </span>
              </div>
              <span className="text-[11px] text-cyan-300 font-semibold bg-[#00BCD4]/10 border border-[#00BCD4]/20 px-2 py-0.5 rounded-full capitalize">
                📅 {fechaEstimada}
              </span>
            </div>
          )}


          {/* Historial de Transacciones / Abonos */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Historial de Abonos
            </p>

            {!deuda.transacciones || deuda.transacciones.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-2 text-center">
                Sin abonos registrados aún
              </p>
            ) : (
              <div className="space-y-1.5">
                {deuda.transacciones.map((tx) => (
                  <TransactionMiniRow key={tx.transaccion_id} tx={tx} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

