import { useState } from "react";
import TransactionMiniRow from "./TransactionMiniRow";

export default function DeudaCard({ deuda }) {
  const [open, setOpen] = useState(false);

  const isCobrar = deuda.tipo_deuda === "Cobrar";
  const isPagada = deuda.estado === "Pagada";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      <button
        onClick={() => setOpen(!open)}
        className={`w-full p-4 flex justify-between items-center transition ${
          isPagada ? "opacity-70" : ""
        }`}
      >

        <div className="text-left">
          <p className="font-semibold text-gray-900">
            {deuda.nombre_deuda}
          </p>
          <p className="text-xs text-gray-500">
            Cuota ${Number(deuda.cuota_mensual).toFixed(2)}
          </p>
        </div>


        <div className="text-right">
          <p
            className={`font-bold ${
              isPagada
                ? "text-gray-400"
                : isCobrar
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            ${Number(deuda.saldo_pendiente).toFixed(2)}
          </p>

          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              deuda.estado === "Activa"
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
