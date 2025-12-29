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

  // ===== TOTALES =====
  const totalPagarInicial = data.pagar.reduce(
    (acc, d) => acc + Number(d.monto_total_inicial || 0),
    0
  );

  const totalPagarPendiente = data.pagar.reduce(
    (acc, d) => acc + Number(d.saldo_pendiente || 0),
    0
  );

  const totalCobrarInicial = data.cobrar.reduce(
    (acc, d) => acc + Number(d.monto_total_inicial || 0),
    0
  );

  const totalCobrarPendiente = data.cobrar.reduce(
    (acc, d) => acc + Number(d.saldo_pendiente || 0),
    0
  );

  return {
    cobrar: data.cobrar,
    pagar: data.pagar,
    loading,
    totales: {
      pagar: {
        inicial: totalPagarInicial,
        pendiente: totalPagarPendiente,
        pagado: totalPagarInicial - totalPagarPendiente,
      },
      cobrar: {
        inicial: totalCobrarInicial,
        pendiente: totalCobrarPendiente,
        recibido: totalCobrarInicial - totalCobrarPendiente,
      },
    },
  };
}
