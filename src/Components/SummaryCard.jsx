
export default function SummaryCard({
  title,
  amount = 0,
  icon,
  color = "text-emerald-400",
  bg = "bg-emerald-500/10",
}) {
  return (
    <div className="
      relative overflow-hidden
      bg-[#13151B]/85 backdrop-blur-md
      rounded-2xl
      p-4 sm:p-5
      border border-white/[0.08] hover:border-white/[0.15]
      shadow-[0_10px_25px_rgba(0,0,0,0.35)]
      transition-all duration-200
      active:scale-[0.98]
    ">
      <div className="flex items-center justify-between">
        {/* Texto y Cifra */}
        <div className="min-w-0 pr-2">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider truncate">
            {title}
          </p>

          <p className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums mt-1 ${color}`}>
            ${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Icono con contenedor glassmorphic */}
        <div
          className={`
            w-10 h-10 sm:w-11 sm:h-11
            flex items-center justify-center shrink-0
            rounded-xl
            border border-white/[0.08]
            ${bg}
            transition-transform duration-200
          `}
        >
          <i className={`${icon} text-sm sm:text-base ${color}`} />
        </div>
      </div>
    </div>
  );
}

