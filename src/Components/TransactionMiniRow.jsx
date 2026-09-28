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

export default function TransactionMiniRow({ tx }) {
  const isIngreso = tx.tipo === "Ingreso";

  return (
    <div className="flex justify-between items-center bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl px-3.5 py-2.5 transition">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs border ${
            isIngreso
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}
        >
          <i className={`fas ${isIngreso ? "fa-arrow-down" : "fa-arrow-up"} text-[10px]`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">
            {tx.descripcion || (isIngreso ? "Abono recibido" : "Abono a deuda")}
          </p>
          <p className="text-[10px] text-neutral-400">{formatFecha(tx.fecha)}</p>
        </div>
      </div>

      <p
        className={`text-xs font-black tabular-nums shrink-0 ml-2 ${
          isIngreso ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        {isIngreso ? "+" : "-"}${Number(tx.monto).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

