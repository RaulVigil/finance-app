import { useState } from "react";
import useDeudasDetalle from "./useDeudasDetalle";
import DeudaCard from "../../Components/DeudaCard";
import "./Deudas.css";

export default function Deudas() {
  const { cobrar, pagar, totales, loading } = useDeudasDetalle();
  const [tab, setTab] = useState("pagar");

  if (loading) {
    return <p className="text-center text-gray-400 mt-10">Cargando...</p>;
  }

  const list = tab === "pagar" ? pagar : cobrar;

  const resumen = tab === "pagar" ? totales.pagar : totales.cobrar;

  const porcentaje =
    resumen.inicial > 0
      ? Math.round(
        ((resumen.inicial - resumen.pendiente) / resumen.inicial) * 100
      )
      : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Deudas</h2>

      {/* ===== CARD RESUMEN ===== */}
      <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Deuda total</p>
            <p className="text-sm font-semibold text-gray-800">
              {tab === "pagar" ? "Por pagar" : "Por cobrar"}
            </p>
          </div>

          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center ${tab === "pagar"
                ? "bg-red-100 text-red-500"
                : "bg-green-100 text-green-600"
              }`}
          >
            <i
              className={`fas ${tab === "pagar" ? "fa-credit-card" : "fa-hand-holding-usd"
                }`}
            />
          </div>
        </div>

        {/* Monto */}
        <p
          className={`text-2xl font-bold leading-none tabular-nums ${tab === "pagar" ? "text-red-500" : "text-green-600"
            }`}
        >
          ${Number(resumen.pendiente).toFixed(2)}
        </p>

        {/* Progreso */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>Progreso</span>
            <span>{porcentaje}%</span>
          </div>

          <div className="progress-container">
            <div
              className={`progress-bar ${tab === "pagar" ? "red" : "green"}`}
              style={{ width: `${porcentaje}%` }}
            >
              <span className="electric-line" />
            </div>
          </div>

          {/* TEXTO COMPLETO SIEMPRE */}
          <p className="text-[11px] text-gray-400">
            {tab === "pagar"
              ? `Pagado $${resumen.pagado.toFixed(
                2
              )} de $${resumen.inicial.toFixed(2)}`
              : `Recibido $${resumen.recibido.toFixed(
                2
              )} de $${resumen.inicial.toFixed(2)}`}
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab("pagar")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${tab === "pagar" ? "bg-[#2c295a] shadow text-white" : "text-gray-500"
            }`}
        >
          Pagar ({pagar.length})
        </button>

        <button
          onClick={() => setTab("cobrar")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${tab === "cobrar"
              ? "bg-[#2c295a] shadow text-white"
              : "text-gray-500"
            }`}
        >
          Cobrar ({cobrar.length})
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {list.map((deuda) => (
          <DeudaCard key={deuda.deuda_id} deuda={deuda} />
        ))}
      </div>
    </div>
  );
}
