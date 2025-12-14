import { useState } from "react";
import useTransacciones from "./useTransacciones";
import TransactionCard from "../../Components/TransactionCard";

export default function Movimientos() {
  const { data, loading, error } = useTransacciones();
  const [activeTab, setActiveTab] = useState("ingresos");

  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Cargando movimientos...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 mt-10">
        Error al cargar movimientos
      </p>
    );
  }

  const ingresos = data.data.ingresos;
  const egresos = data.data.egresos;

  const list =
    activeTab === "ingresos" ? ingresos : egresos;

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Movimientos
        </h2>
        <p className="text-sm text-gray-500">
          Historial completo
        </p>
      </div>

      {/* ===== TABS ===== */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("ingresos")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "ingresos"
              ? "bg-white shadow text-[#2c295a]"
              : "text-gray-500"
          }`}
        >
          Ingresos ({ingresos.length})
        </button>

        <button
          onClick={() => setActiveTab("egresos")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "egresos"
              ? "bg-white shadow text-[#2c295a]"
              : "text-gray-500"
          }`}
        >
          Egresos ({egresos.length})
        </button>
      </div>

      {/* ===== LIST ===== */}
      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
        {list
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .map((tx) => (
            <TransactionCard
              key={tx.transaccion_id}
              tx={tx}
            />
          ))}
      </div>
    </div>
  );
}
