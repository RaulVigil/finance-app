export default function SummaryCard({
  title,
  amount = 0,
  icon,
  color = "text-gray-800",   // SOLO para el monto
  bg = "bg-gray-100",        // fondo suave opcional
}) {
  return (
    <div className="
      bg-white
      rounded-2xl
      p-5
      shadow-sm
      border border-gray-100
      transition-all
      duration-200
      active:scale-[0.98]
      hover:shadow-md
    ">
      <div className="flex items-center justify-between">
        
        {/* Texto */}
        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          {/* Monto (semántico) */}
          <p className={`text-2xl font-bold ${color}`}>
            ${Number(amount).toFixed(2)}
          </p>
        </div>

        {/* Icono (branding) */}
        <div
          className={`
            w-11 h-11
            flex items-center justify-center
            rounded-xl
            bg-[#eceaff]
            text-[#2c295a]
            ring-1 ring-[#6b5cff]/20
          `}
        >
          <i className={`${icon} text-lg`} />
        </div>
      </div>
    </div>
  );
}
