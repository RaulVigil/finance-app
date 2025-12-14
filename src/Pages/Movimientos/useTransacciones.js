import { useEffect, useState } from "react";
import Api from "../../Services/api";

export default function useTransacciones() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await Api.get("transacciones-todas");
        setData(res.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { data, loading, error };
}
