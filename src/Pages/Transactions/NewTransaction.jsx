import { useState, useEffect } from "react";
import useNewTransaction from "./useNewTransaction";
import useNewDeuda from "./useNewDeuda";
import TransactionCard from "../../Components/TransactionCard";
import useCategorias from "./useCategorias";
import useDeudas from "./useDeudas";
import DropdownSelect from "../../Components/DropdownSelect";

export default function NewTransaction() {
  /* =========================
   * WIZARD
   ========================= */
  const [step, setStep] = useState(1);
  const [accion, setAccion] = useState(null);
  // "ingreso" | "egreso" | "deuda"

  /* =========================
   * TRANSACCIÓN
   ========================= */
  const {
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
    loading,
    message,
    submit,
  } = useNewTransaction();

  const { categorias, loading: categoriasLoading } = useCategorias();
  const { deudas, loading: deudasLoading } = useDeudas();
  const [successMessage, setSuccessMessage] = useState(null);

  /* =========================
   * DEUDA
   ========================= */
  const {
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
    loading: deudaLoading,
    message: deudaMessage,
    submit: submitDeuda,
  } = useNewDeuda();

  useEffect(() => {
    if (message?.type === "success") {
      setSuccessMessage(message.text);

      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setStep(1);
        setAccion(null);
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (deudaMessage?.type === "success") {
      setSuccessMessage(deudaMessage.text);

      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setStep(1);
        setAccion(null);
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [deudaMessage]);

  const inputBase =
    "w-full rounded-lg border border-gray-200 px-4 py-2 " +
    "focus:outline-none focus:ring-2 focus:ring-[#2c295a]/30 transition";

  const isIngreso = tipo === "Ingreso";

  const deudasFiltradas = deudas.filter((d) => {
    // Excluir deudas ya pagadas
    if (d.estado === "Pagada") return false;

    if (tipo === "Ingreso") return d.tipo_deuda === "Cobrar";
    if (tipo === "Egreso") return d.tipo_deuda === "Pagar";
    return false;
  });

  useEffect(() => {
    setDeudaId("");
  }, [tipo]);

  /* =========================
   * STEP 1 – SELECCIÓN
   ========================= */
  if (step === 1) {
    return (
      <div className="space-y-6">
        {successMessage && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            ✔ {successMessage}
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-800">
          ¿Qué deseas registrar?
        </h2>

        <div className="space-y-3">
          {/* GASTO */}
          <button
            onClick={() => {
              setAccion("egreso");
              setTipo("Egreso");
              setEstado("pagado");
              setStep(2);
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-100 text-red-600">
                <i className="fas fa-arrow-up"></i>
              </div>

              <div className="text-left">
                <p className="font-semibold text-gray-900">Registrar gasto</p>
                <p className="text-xs text-gray-500">
                  Dinero que sale de tu cuenta
                </p>
              </div>
            </div>

            <i className="fas fa-chevron-right text-gray-400"></i>
          </button>

          {/* INGRESO */}
          <button
            onClick={() => {
              setAccion("ingreso");
              setTipo("Ingreso");
              setEstado("pagado");
              setStep(2);
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-green-100 text-green-600">
                <i className="fas fa-arrow-down"></i>
              </div>

              <div className="text-left">
                <p className="font-semibold text-gray-900">Registrar ingreso</p>
                <p className="text-xs text-gray-500">
                  Dinero que entra a tu cuenta
                </p>
              </div>
            </div>

            <i className="fas fa-chevron-right text-gray-400"></i>
          </button>

          {/* DEUDA */}
          <button
            onClick={() => {
              setAccion("deuda");
              setStep(2);
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#2c295a]/10 text-[#2c295a]">
                <i className="fas fa-file-invoice-dollar"></i>
              </div>

              <div className="text-left">
                <p className="font-semibold text-gray-900">Crear deuda</p>
                <p className="text-xs text-gray-500">
                  Pagos pendientes o por cobrar
                </p>
              </div>
            </div>

            <i className="fas fa-chevron-right text-gray-400"></i>
          </button>
        </div>
      </div>
    );
  }

  /* =========================
   * STEP 2 – TRANSACCIÓN
   ========================= */
  if (step === 2 && accion !== "deuda") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-2 text-sm text-[#2c295a] font-medium hover:opacity-80 transition"
        >
          <i className="fas fa-arrow-left text-xs"></i>
          Volver
        </button>

        {message && (
          <div
            className={`text-sm px-4 py-2 rounded-lg ${message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <input
            type="number"
            placeholder="Monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className={inputBase}
          />

          <DropdownSelect
            placeholder="Selecciona una categoría"
            items={categorias}
            value={categoriaId}
            onChange={setCategoriaId}
            loading={categoriasLoading}
            getKey={(c) => c.categoria_id}
            getLabel={(c) => c.nombre}
          />

          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={inputBase}
          />

          {/* Asociar a deuda (opcional) */}

          <DropdownSelect
            placeholder={
              tipo === "Ingreso"
                ? "Asociar a deuda por cobrar (opcional)"
                : "Asociar a deuda por pagar (opcional)"
            }
            items={deudasFiltradas}
            value={deudaId}
            onChange={(id) => {
              setDeudaId(id);
              if (id) {
                const selected = deudas.find((d) => String(d.deuda_id) === String(id));
                if (selected && Number(selected.cuota_mensual) > 0) {
                  setMonto(selected.cuota_mensual);
                }
              }
            }}
            loading={deudasLoading}
            allowEmpty
            emptyLabel="Sin deuda"
            getLabel={(d) => d.nombre_deuda}
            getKey={(d) => d.deuda_id}
          />


          {/* Estado SOLO si es Egreso */}
          {tipo === "Egreso" && (
            <div className="flex gap-2">
              {["pagado", "pendiente"].map((e) => (
                <button
                  key={e}
                  onClick={() => setEstado(e)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${estado === e
                    ? e === "pagado"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-500"
                    }`}
                >
                  {e === "pagado" ? "Pagado ahora" : "Pagar después"}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Preview */}
        <TransactionCard
          tx={{
            descripcion: descripcion || "Descripción",
            categoria: "Categoría",
            fecha: new Date().toISOString().slice(0, 10),
            tipo,
            monto: monto || 0,
            estado,
          }}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-[#2c295a]"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    );
  }

  /* =========================
   * STEP 2 – DEUDA
   ========================= */
  if (step === 2 && accion === "deuda") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-2 text-sm text-[#2c295a] font-medium hover:opacity-80 transition"
        >
          <i className="fas fa-arrow-left text-xs"></i>
          Volver
        </button>

        {deudaMessage && (
          <div
            className={`text-sm px-4 py-2 rounded-lg ${deudaMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {deudaMessage.text}
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex gap-2">
            {["Pagar", "Cobrar"].map((t) => (
              <button
                key={t}
                onClick={() => setTipoDeuda(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tipoDeuda === t
                  ? "bg-[#2c295a] text-white"
                  : "bg-gray-100 text-gray-600"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <input
            placeholder="Nombre de la deuda"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputBase}
          />

          <input
            type="number"
            placeholder="Monto total"
            value={montoTotal}
            onChange={(e) => setMontoTotal(e.target.value)}
            className={inputBase}
          />

          {tipoDeuda === "Pagar" && (
            <>
              <input
                type="number"
                placeholder="Cuota mensual (opcional)"
                value={cuotaMensual}
                onChange={(e) => setCuotaMensual(e.target.value)}
                className={inputBase}
              />

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Fecha de vencimiento
                </label>

                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className={inputBase}
                />

                <p className="text-xs text-gray-400">
                  Fecha límite en la que debes pagar esta deuda
                </p>
              </div>
            </>
          )}
        </div>

        <button
          onClick={submitDeuda}
          disabled={deudaLoading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-[#2c295a]"
        >
          {deudaLoading ? "Guardando..." : "Crear deuda"}
        </button>
      </div>
    );
  }

  return null;
}
