import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import useMesActual from "./useMesActual";
import SummaryCard from "../../Components/SummaryCard";
import DashboardCharts from "./DashboardCharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, error } = useMesActual();

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

  return (
    <div className="space-y-6">
      {/* ===== SALDO ===== */}
      <div className="bg-[#2c295a] rounded-2xl p-6 shadow-lg text-white">
        <div className="flex justify-between items-start">
          <p className="text-sm opacity-80">Saldo actual</p>
          <span
            onClick={() => navigate("/app/movimientos")}
            className="text-xs opacity-80 cursor-pointer hover:opacity-100 transition"
          >
            Ver historial →
          </span>
        </div>
        <p className="text-3xl font-bold mt-1 tabular-nums">
          ${Number(data.saldo_actual).toFixed(2)}
        </p>
      </div>

      {/* ===== RESUMEN ===== */}
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          title="Ingresos mes actual"
          amount={totalIngresos}
          icon="fas fa-arrow-down"
          color="text-green-600"
          bg="bg-green-100"
        />

        <SummaryCard
          title="Egresos mes actual"
          amount={totalEgresos}
          icon="fas fa-arrow-up"
          color="text-red-500"
          bg="bg-red-100"
        />
      </div>

      {/* VISTA ESTADÍSTICAS */}
      <DashboardCharts />
    </div>
  );
}
