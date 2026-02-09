import { useState } from "react";
import TransactionMiniRow from "./TransactionMiniRow";

export default function DeudaCard({ deuda }) {
  const [open, setOpen] = useState(false);

  const isCobrar = deuda.tipo_deuda === "Cobrar";
  const isPagada = deuda.estado === "Pagada";

  const total = Number(deuda.monto_total_inicial);
  const pendiente = Number(deuda.saldo_pendiente);
  const pagado = total - pendiente;
  const porcentaje = total > 0 ? (pagado / total) * 100 : 0;

  // Determine color based on progress
  let progressColor = "bg-[#2c295a]"; // Default/Middle
  let badgeColor = "bg-blue-100 text-blue-800";

  if (porcentaje < 25) {
    progressColor = "bg-red-500";
    badgeColor = "bg-red-100 text-red-800";
  } else if (porcentaje > 75) {
    progressColor = "bg-green-500";
    badgeColor = "bg-green-100 text-green-800";
  } else {
    progressColor = "bg-yellow-500"; // Amber/Yellow for middle
    badgeColor = "bg-yellow-100 text-yellow-800";
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      <button
        onClick={() => setOpen(!open)}
        className={`w-full p-4 flex justify-between items-center transition ${isPagada ? "opacity-70" : ""
          }`}
      >
        <div className="text-left w-full mr-4">
          <p className="font-semibold text-gray-900">
            {deuda.nombre_deuda}
          </p>

          {/* Progress Bar for Debt (Pagar) only */}
          {!isCobrar && !isPagada && (
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden my-1">
              <div
                className={`h-full ${progressColor} transition-all duration-500 ease-out`}
                style={{ width: `${porcentaje}%` }}
              ></div>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Cuota ${Number(deuda.cuota_mensual).toFixed(2)}
          </p>
        </div>

        <div className="text-right min-w-fit">
          <div className="flex items-center justify-end gap-2 mb-1">
            {!isPagada && !isCobrar && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap ${badgeColor}`}>
                {Math.round(porcentaje)}%
              </span>
            )}
            <p
              className={`font-bold whitespace-nowrap ${isPagada
                ? "text-gray-400"
                : isCobrar
                  ? "text-green-600"
                  : "text-red-500"
                }`}
            >
              ${Number(deuda.saldo_pendiente).toFixed(2)}
            </p>
          </div>

          <span
            className={`text-xs px-2 py-0.5 rounded-full inline-block whitespace-nowrap ${deuda.estado === "Activa"
              ? "bg-yellow-100 text-yellow-700"
              : deuda.estado === "Pagada"
                ? "bg-gray-200 text-gray-600"
                : "bg-green-100 text-green-700"
              }`}
          >
            {deuda.estado}
          </span>
        </div>
      </button>


      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 space-y-2">
          {/* PROYECCION DE PAGO */}
          {Number(deuda.cuota_mensual) > 0 && Number(deuda.saldo_pendiente) > 0 && (
            <div className="mt-3 mb-2 bg-[#f4f4f9] p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-[#2c295a] font-medium flex items-center gap-2">
                <i className="fas fa-hourglass-half text-[#2c295a]"></i>
                <span>
                  A este ritmo, terminarás tu deuda en{" "}
                  <span className="font-bold">
                    {Math.ceil(Number(deuda.saldo_pendiente) / Number(deuda.cuota_mensual))}
                  </span>{" "}
                  meses
                </span>
              </p>
              <p className="text-[10px] text-gray-500 ml-5 mt-1">
                <i className="far fa-calendar-alt mr-1"></i>
                Fecha estimada:{" "}
                {(() => {
                  const meses = Math.ceil(
                    Number(deuda.saldo_pendiente) / Number(deuda.cuota_mensual)
                  );
                  const fecha = new Date();
                  fecha.setMonth(fecha.getMonth() + meses);
                  return fecha.toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                  });
                })()}
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-2">
            Monto inicial: $
            {Number(deuda.monto_total_inicial).toFixed(2)}
          </div>

          {deuda.transacciones.length === 0 ? (
            <p className="text-xs text-gray-400 mt-2">
              Sin transacciones registradas
            </p>
          ) : (
            deuda.transacciones.map((tx) => (
              <TransactionMiniRow
                key={tx.transaccion_id}
                tx={tx}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
