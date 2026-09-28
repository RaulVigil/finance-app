import usePagarTransaccion from "../hooks/usePagarTransaccion";

const formatFecha = (fecha) => {
  if (!fecha) return "";

  const [year, month, day] = fecha.split("-");
  const localDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  return localDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function TransactionCard({ tx, onPaid }) {
  const isIngreso = tx.tipo === "Ingreso";
  const isPagado = tx.estado === "pagado";
  const { pagar, loading } = usePagarTransaccion();

  const handlePagar = async () => {
    const res = await pagar(tx.transaccion_id);
    if (res.success && onPaid) {
      onPaid();
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#13151B]/85 hover:bg-[#181B22] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-3.5 sm:p-4 transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.25)] group">
      <div className="flex items-center justify-between gap-3">
        {/* Lado Izquierdo: Ícono y Datos del Movimiento */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Badge del tipo de transacción con ícono */}
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${
              isIngreso
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
            }`}
          >
            <i
              className={`fas ${
                isIngreso ? "fa-arrow-down" : "fa-arrow-up"
              } text-xs sm:text-sm`}
            />
          </div>

          {/* Textos: Descripción, Categoría y Fecha */}
          <div className="min-w-0 space-y-1">
            <p className="font-semibold text-white text-sm sm:text-base truncate tracking-tight">
              {tx.descripcion || (isIngreso ? "Ingreso registrado" : "Gasto registrado")}
            </p>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {tx.categoria && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/[0.05] text-[11px] font-medium text-neutral-300 border border-white/[0.06]">
                  {tx.categoria}
                </span>
              )}

              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <i className="far fa-calendar text-[10px] text-neutral-500" />
                {formatFecha(tx.fecha)}
              </span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Monto, Estado y Botón de Pago */}
        <div className="text-right shrink-0 space-y-1">
          <p
            className={`font-extrabold text-sm sm:text-base tracking-tight tabular-nums ${
              isIngreso ? "text-emerald-400" : "text-white"
            }`}
          >
            {isIngreso ? "+" : "-"}${Number(tx.monto).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>

          <div className="flex items-center justify-end gap-1.5">
            {isPagado ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Pagado
              </span>
            ) : (
              <div className="flex flex-col items-end gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Pendiente
                </span>

                <button
                  onClick={handlePagar}
                  disabled={loading}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00BCD4] hover:bg-[#00acc1] text-[#0C0D10] font-bold text-xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer shadow-[0_0_10px_rgba(0,188,212,0.3)]"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-[10px]" />
                      <span>...</span>
                    </>
                  ) : (
                    <>
                      <span>Pagar</span>
                      <i className="fas fa-arrow-right text-[9px]" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
