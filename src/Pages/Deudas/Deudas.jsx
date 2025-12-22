import { useState } from "react";
import useDeudasDetalle from "./useDeudasDetalle";
import DeudaCard from "../../Components/DeudaCard";

export default function Deudas() {
  const { cobrar, pagar, loading } = useDeudasDetalle();
  const [tab, setTab] = useState("pagar");

  if (loading) {
    return <p className="text-center text-gray-400 mt-10">Cargando...</p>;
  }

  const list = tab === "pagar" ? pagar : cobrar;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Deudas</h2>

      {/* TABS */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab("pagar")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            tab === "pagar"
              ? "bg-[#2c295a] shadow text-white"
              : "text-gray-500"
          }`}
        >
          Pagar ({pagar.length})
        </button>

        <button
          onClick={() => setTab("cobrar")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            tab === "cobrar"
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
