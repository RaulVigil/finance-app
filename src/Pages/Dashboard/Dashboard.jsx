import { useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import useMesActual from "./useMesActual";
import TransactionCard from "../../Components/TransactionCard";
import SummaryCard from "../../Components/SummaryCard";

export default function Dashboard() {
  const { saldoActual } = useAuthStore();
  const { data, loading, error } = useMesActual();
  const [activeTab, setActiveTab] = useState("ingresos");

  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-10">Cargando información...</p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 mt-10">
        Error al cargar el dashboard
      </p>
    );
  }

  const ingresos = data.data.ingresos;
  const egresos = data.data.egresos;

  const totalIngresos = ingresos.reduce((acc, i) => acc + Number(i.monto), 0);

  const totalEgresos = egresos.reduce((acc, e) => acc + Number(e.monto), 0);

  const transaccionesMostradas = activeTab === "ingresos" ? ingresos : egresos;

  return (
    <div className="space-y-6">
      {/* ===== SALDO ===== */}
      <div className="bg-[#2c295a] rounded-2xl p-6 shadow-lg text-white">
        <p className="text-sm opacity-80">Saldo actual</p>
        <p className="text-3xl font-bold mt-1">
          ${Number(data.saldo_actual).toFixed(2)}
        </p>
      </div>

      {/* ===== RESUMEN ===== */}
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          title="Ingresos"
          amount={totalIngresos}
          icon="fas fa-arrow-down"
          color="text-green-600"
          bg="bg-green-100"
        />

        <SummaryCard
          title="Egresos"
          amount={totalEgresos}
          icon="fas fa-arrow-up"
          color="text-red-500"
          bg="bg-red-100"
        />
      </div>

      {/* ===== MOVIMIENTOS ===== */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800">Movimientos del mes</h3>

        {/* Tabs */}
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

        {/* Lista */}
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {transaccionesMostradas
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .map((tx) => (
              <TransactionCard key={tx.transaccion_id} tx={tx} />
            ))}
        </div>
      </div>
    </div>
  );
}
