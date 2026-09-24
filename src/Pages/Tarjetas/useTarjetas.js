import { useState, useEffect, useCallback } from "react";
import Api from "../../Services/api";

export default function useTarjetas() {
  const [tarjetas, setTarjetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTarjetas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await Api.get("tarjetas");
      setTarjetas(res.data.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTarjetas();
  }, [fetchTarjetas]);

  return { tarjetas, loading, error, refetch: fetchTarjetas };
}
