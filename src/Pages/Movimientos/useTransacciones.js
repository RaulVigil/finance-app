import { useEffect, useState } from "react";
import Api from "../../Services/api";

export default function useTransacciones() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTransacciones = async () => {
    try {
      setLoading(true);
      const res = await Api.get("transacciones-todas");
      setData(res.data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransacciones();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchTransacciones,
  };
}
