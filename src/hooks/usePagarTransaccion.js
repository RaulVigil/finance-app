import { useState } from "react";
import Api from "../Services/api";
import useAuthStore from "../store/useAuthStore";

export default function usePagarTransaccion() {
  const [loading, setLoading] = useState(false);
  const { updateSaldo } = useAuthStore();

  const pagar = async (transaccionId) => {
    setLoading(true);
    try {
      const res = await Api.postJson(
        `transacciones/${transaccionId}/pagar`
      );

      if (
        res?.data?.nuevo_saldo_usuario !== null &&
        res?.data?.nuevo_saldo_usuario !== undefined
      ) {
        updateSaldo(Number(res.data.nuevo_saldo_usuario));
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Error al pagar la transacción",
      };
    } finally {
      setLoading(false);
    }
  };

  return { pagar, loading };
}
