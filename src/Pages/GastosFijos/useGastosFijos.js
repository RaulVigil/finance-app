import { useState, useEffect, useCallback } from "react";
import Api from "../../Services/api";

export default function useGastosFijos() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());

  const [gastos, setGastos] = useState([]);
  const [totales, setTotales] = useState({ pendiente: 0, pagado: 0 });
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pendRes, plantRes] = await Promise.all([
        Api.get("gastos-pendientes", { mes, anio }),
        Api.get("gastos-fijos/plantillas"),
      ]);
      setGastos(pendRes.data.data);
      setTotales(pendRes.data.totales);
      setPlantillas(plantRes.data.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [mes, anio]);

  useEffect(() => {
    fetchPendientes();
  }, [fetchPendientes]);

  return {
    gastos,
    totales,
    plantillas,
    loading,
    error,
    mes,
    setMes,
    anio,
    setAnio,
    refetch: fetchPendientes,
  };
}
