import { useEffect, useState } from "react";
import Api from "../../Services/api";

export default function useDeudas() {
  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeudas = async () => {
    try {
      const res = await Api.get("deudaslist");
      setDeudas(res?.data?.data || []);
    } catch {
      setDeudas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeudas();
  }, []);

  return { deudas, loading, refetch: fetchDeudas };
}
