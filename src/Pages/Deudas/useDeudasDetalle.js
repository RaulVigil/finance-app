import { useEffect, useState } from "react";
import Api from "../../Services/api";

export default function useDeudasDetalle() {
  const [data, setData] = useState({ cobrar: [], pagar: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await Api.get("deudas-detalle");
        setData(res?.data?.data || { cobrar: [], pagar: [] });
      } catch {
        setData({ cobrar: [], pagar: [] });
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { ...data, loading };
}
