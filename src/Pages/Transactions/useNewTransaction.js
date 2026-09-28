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

  // Soporte de método de pago: billetera vs tarjeta de crédito
  const [metodoPago, setMetodoPago] = useState("billetera"); // "billetera" | "tarjeta"
  const [tarjetaId, setTarjetaId] = useState("");
  const [reponerTarjeta, setReponerTarjeta] = useState(true);

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
    setMetodoPago("billetera");
    setTarjetaId("");
    setReponerTarjeta(true);
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

    // Validación si se seleccionó pagar con tarjeta
    if (tipo === "Egreso" && metodoPago === "tarjeta" && !tarjetaId) {
      setMessage({ type: "error", text: "Selecciona la tarjeta de crédito utilizada" });
      return;
    }

    setLoading(true);
    try {
      if (tipo === "Egreso" && metodoPago === "tarjeta") {
        if (reponerTarjeta) {
          // Registrar consumo y agregar a gastos pendientes para reponer a la tarjeta
          const hoy = new Date();
          const res = await Api.postJson("gastos-pendientes", {
            nombre: descripcion || "Compra con tarjeta de crédito",
            categoria_id: Number(categoriaId),
            monto: Number(monto),
            tarjeta_id: Number(tarjetaId),
            descripcion: descripcion || null,
            mes: hoy.getMonth() + 1,
            anio: hoy.getFullYear(),
          });

          setMessage({
            type: "success",
            text: res?.data?.message || "Gasto con tarjeta registrado y agregado a pendientes por reponer",
          });
        } else {
          // Registrar consumo directo en la tarjeta
          const res = await Api.postJson(`tarjetas/${tarjetaId}/gasto`, {
            monto: Number(monto),
            categoria_id: Number(categoriaId),
            descripcion: descripcion || "",
          });

          setMessage({
            type: "success",
            text: res?.data?.message || "Gasto registrado en tu tarjeta de crédito",
          });
        }
      } else {
        // Gasto o Ingreso normal de billetera principal
        const payload = {
          usuario_id: Number(user.usuario_id),
          tipo,
          monto: Number(monto),
          categoria_id: Number(categoriaId),
          estado: estadoFinal,
          descripcion,
          deuda_id: deudaId ? Number(deudaId) : null,
        };

        const res = await Api.postJson("transacciones-crear", payload);

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
      }

      resetForm();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Error al procesar la operación",
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
    metodoPago,
    setMetodoPago,
    tarjetaId,
    setTarjetaId,
    reponerTarjeta,
    setReponerTarjeta,

    // helpers
    estadoFinal,
    loading,
    message,

    // actions
    submit,
    resetForm,
  };
}
