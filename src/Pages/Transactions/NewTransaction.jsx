import { useState, useEffect } from "react";
import useNewTransaction from "./useNewTransaction";
import useNewDeuda from "./useNewDeuda";
import TransactionCard from "../../Components/TransactionCard";
import useCategorias from "./useCategorias";
import useDeudas from "./useDeudas";
import DropdownSelect from "../../Components/DropdownSelect";

export default function NewTransaction() {
  /** =========================
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

  /** =========================
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

  const [activeTab, setActiveTab] = useState("transaccion");

  const inputBase =
    "w-full rounded-lg border border-gray-200 px-4 py-2 " +
    "focus:outline-none focus:ring-2 focus:ring-[#2c295a]/30 transition";

  const isIngreso = tipo === "Ingreso";

  const deudasFiltradas = deudas.filter((d) => {
    if (tipo === "Ingreso") return d.tipo_deuda === "Cobrar";
    if (tipo === "Egreso") return d.tipo_deuda === "Pagar";
    return false;
  });

  useEffect(() => {
    setDeudaId("");
  }, [tipo]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Nueva operación</h2>

      {/* ===== TABS PRINCIPALES ===== */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("transaccion")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "transaccion"
              ? "bg-white shadow text-[#2c295a]"
              : "text-gray-500"
          }`}
        >
          Nueva Transacción
        </button>

        <button
          onClick={() => setActiveTab("deuda")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "deuda"
              ? "bg-white shadow text-[#2c295a]"
              : "text-gray-500"
          }`}
        >
          Nueva Deuda
        </button>
      </div>

      {/* =============================
          TAB TRANSACCIÓN 
      ============================= */}
      {activeTab === "transaccion" && (
        <>
          {message && (
            <div
              className={`text-sm px-4 py-2 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div className="flex gap-2">
              {["Ingreso", "Egreso"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTipo(t);
                    if (t === "Ingreso") setEstado("pagado");
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    tipo === t
                      ? "bg-[#2c295a] text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

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

            <DropdownSelect
              placeholder="Selecciona una deuda (opcional)"
              items={deudasFiltradas}
              value={deudaId}
              onChange={setDeudaId}
              loading={deudasLoading}
              allowEmpty
              emptyLabel="Sin deuda"
              getKey={(d) => d.deuda_id}
              getLabel={(d) => d.nombre_deuda}
            />

            {!isIngreso && (
              <div className="flex gap-2">
                {["pagado", "pendiente"].map((e) => (
                  <button
                    key={e}
                    onClick={() => setEstado(e)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      estado === e
                        ? e === "pagado"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

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
        </>
      )}

      {/* =============================
          TAB DEUDA 
      ============================= */}
      {activeTab === "deuda" && (
        <>
          {deudaMessage && (
            <div
              className={`text-sm px-4 py-2 rounded-lg ${
                deudaMessage.type === "success"
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
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    tipoDeuda === t
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
              <input
                type="number"
                placeholder="Cuota mensual (opcional)"
                value={cuotaMensual}
                onChange={(e) => setCuotaMensual(e.target.value)}
                className={inputBase}
              />
            )}

            {tipoDeuda === "Pagar" && (
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className={inputBase}
              />
            )}
          </div>

          <button
            onClick={submitDeuda}
            disabled={deudaLoading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[#2c295a]"
          >
            {deudaLoading ? "Guardando..." : "Crear deuda"}
          </button>
        </>
      )}
    </div>
  );
}
