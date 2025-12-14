import { useState, useMemo } from "react";
import Api from "../../Services/api";
import useAuthStore from "../../store/useAuthStore";

export default function useNewTransaction() {
  const { user, updateSaldo } = useAuthStore();

  // Form state
  const [tipo, setTipo] = useState("Egreso");
  const [monto, setMonto] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [estado, setEstado] = useState("pendiente");
  const [descripcion, setDescripcion] = useState("");
  const [deudaId, setDeudaId] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); 

  const estadoFinal = useMemo(() => {
    return tipo === "Ingreso" ? "pagado" : estado;
  }, [tipo, estado]);

  const resetForm = () => {
    setTipo("Egreso");
    setMonto("");
    setCategoriaId("");
    setEstado("pendiente");
    setDescripcion("");
    setDeudaId("");
  };

  const submit = async () => {
    setMessage(null);

    if (!user?.usuario_id) {
      setMessage({ type: "error", text: "Usuario no autenticado" });
      return;
    }

    if (!monto || Number(monto) <= 0) {
      setMessage({ type: "error", text: "Monto inválido" });
      return;
    }

    if (!categoriaId) {
      setMessage({ type: "error", text: "Selecciona una categoría" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        usuario_id: Number(user.usuario_id),
        tipo,
        monto: Number(monto),
        categoria_id: Number(categoriaId),
        estado: estadoFinal,
        descripcion,
        deuda_id: deudaId ? Number(deudaId) : null,
      };

      const res = await Api.postJson(
        "transacciones-crear",
        payload
      );

      if (
        res?.data?.nuevo_saldo_usuario !== null &&
        res?.data?.nuevo_saldo_usuario !== undefined
      ) {
        updateSaldo(Number(res.data.nuevo_saldo_usuario));
      }

      setMessage({
        type: "success",
        text: res?.data?.message || "Transacción creada",
      });

      resetForm();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Error al crear la transacción",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    // form
    tipo,
    setTipo,
    monto,
    setMonto,
    categoriaId,
    setCategoriaId,
    estado,
    setEstado,
    descripcion,
    setDescripcion,
    deudaId,
    setDeudaId,

    // helpers
    estadoFinal,
    loading,
    message,

    // actions
    submit,
    resetForm,
  };
}
