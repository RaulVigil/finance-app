import { useState } from "react";
import Api from "../../Services/api";

export default function useNewDeuda() {
  const [tipoDeuda, setTipoDeuda] = useState("Pagar"); // Pagar | Cobrar
  const [nombre, setNombre] = useState("");
  const [montoTotal, setMontoTotal] = useState("");
  const [cuotaMensual, setCuotaMensual] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const resetForm = () => {
    setTipoDeuda("Pagar");
    setNombre("");
    setMontoTotal("");
    setCuotaMensual("");
    setFechaVencimiento("");
  };

  const submit = async () => {
    setMessage(null);

    if (!nombre.trim()) {
      return setMessage({
        type: "error",
        text: "El nombre de la deuda es obligatorio",
      });
    }

    if (!montoTotal || Number(montoTotal) <= 0) {
      return setMessage({
        type: "error",
        text: "Monto total inválido",
      });
    }

    const payload = {
      nombre_deuda: nombre,
      tipo_deuda: tipoDeuda,
      monto_total_inicial: Number(montoTotal),
      cuota_mensual: cuotaMensual ? Number(cuotaMensual) : null,
      fecha_vencimiento: fechaVencimiento || null,
    };

    try {
      setLoading(true);

      const res = await Api.postJson("deudas-crear", payload);

      setMessage({
        type: "success",
        text: res?.data?.message || "Deuda creada correctamente",
      });

      resetForm();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Error al crear la deuda",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    // form
    tipoDeuda,
    setTipoDeuda,
    nombre,
    setNombre,
    montoTotal,
    setMontoTotal,
    cuotaMensual,
    setCuotaMensual,
    fechaVencimiento,
    setFechaVencimiento,

    // ui
    loading,
    message,

    // actions
    submit,
    resetForm,
  };
}
