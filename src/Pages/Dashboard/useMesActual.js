import { useEffect, useState } from "react";
import Api from "../../Services/api";

export default function useMesActual() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMesActual = async () => {
    try {
      setLoading(true);
      const res = await Api.get("transacciones-mes-actual");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data || "Error al cargar transacciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesActual();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchMesActual,
  };
}
