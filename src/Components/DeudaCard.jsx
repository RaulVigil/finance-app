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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full p-4 flex justify-between items-center transition ${isPagada ? "opacity-60" : ""
          }`}
      >
        <div className="text-left w-full mr-4">
          <p className="font-semibold text-gray-900">
            {deuda.nombre_deuda}
          </p>

          {/* Progress Bar - Consistent with Summary */}
          {!isCobrar && !isPagada && (
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden my-2">
              <div
                className="h-full bg-[#2c295a] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${porcentaje}%` }}
              ></div>
            </div>
          )}

          <p className="text-[11px] text-gray-400 tabular-nums">
            Cuota ${Number(deuda.cuota_mensual).toFixed(2)}
          </p>
        </div>

        <div className="text-right min-w-fit">
          <div className="flex items-center justify-end gap-2 mb-1">
            {!isPagada && !isCobrar && (
              <span className="text-[10px] text-gray-500 font-medium tabular-nums">
                {Math.round(porcentaje)}%
              </span>
            )}
            <p
              className={`font-bold whitespace-nowrap ${isPagada
                ? "text-gray-300"
                : isCobrar
                  ? "text-green-600"
                  : "text-red-500"
                }`}
            >
              ${Number(deuda.saldo_pendiente).toFixed(2)}
            </p>
          </div>

          {/* Minimalist Status Indicator (Dot + Text) */}
          <div className="flex items-center justify-end gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${deuda.estado === "Activa"
              ? "bg-green-500"
              : deuda.estado === "Pagada"
                ? "bg-gray-300"
                : "bg-green-500"
              }`} />
            <span className="text-[10px] font-medium text-gray-500">
              {deuda.estado}
            </span>
          </div>
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
                  const mesesFaltantes = Math.ceil(
                    Number(deuda.saldo_pendiente) / Number(deuda.cuota_mensual)
                  );
                  const hoy = new Date();

                  // Determinar si ya pagó en el mes actual
                  const yaPagoEsteMes = deuda.transacciones?.some((tx) => {
                    const fechaTx = new Date(tx.fecha);
                    return (
                      fechaTx.getMonth() === hoy.getMonth() &&
                      fechaTx.getFullYear() === hoy.getFullYear()
                    );
                  });

                  // Si ya pagó, sumamos los meses faltantes. 
                  // Si NO ha pagado, la cuota de este mes cuenta como la primera, restamos 1.
                  const mesesAAgregar = yaPagoEsteMes
                    ? mesesFaltantes
                    : Math.max(0, mesesFaltantes - 1);

                  const fechaFin = new Date();
                  fechaFin.setMonth(fechaFin.getMonth() + mesesAAgregar);

                  return fechaFin.toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                  });
                })()}
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
            <i className="fas fa-coins text-gray-400"></i>
            <span className="tabular-nums">
              Monto inicial: $
              {Number(deuda.monto_total_inicial).toFixed(2)}
            </span>
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
