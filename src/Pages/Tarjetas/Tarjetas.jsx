import { useState } from "react";
import useTarjetas from "./useTarjetas";
import useCategorias from "../Transactions/useCategorias";
import Api from "../../Services/api";
import { toast } from "react-toastify";

const inputBase =
  "w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-[#2c295a]/30 transition";

// ── Modal genérico ─────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-5 pb-28 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Tarjeta de crédito card ────────────────────────────────────
function TarjetaCard({ tarjeta, onSelect }) {
  const limite    = Number(tarjeta.limite_credito);
  const utilizado = Number(tarjeta.saldo_utilizado);
  const pct       = limite > 0 ? Math.round((utilizado / limite) * 100) : 0;
  const isActive  = tarjeta.estado === "Activa";

  const barColor =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-[#2c295a]";

  return (
    <button
      onClick={() => onSelect(tarjeta)}
      className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-left space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{tarjeta.nombre}</p>
          {tarjeta.banco && (
            <p className="text-xs text-gray-500">{tarjeta.banco}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-300"}`} />
          <span className="text-[10px] text-gray-500">{tarjeta.estado}</span>
        </div>
      </div>

      {/* Montos */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-gray-400">Límite</p>
          <p className="text-sm font-bold text-gray-800 tabular-nums">${limite.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400">Disponible</p>
          <p className="text-sm font-bold text-green-600 tabular-nums">
            ${Number(tarjeta.saldo_disponible).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400">Utilizado</p>
          <p className={`text-sm font-bold tabular-nums ${utilizado > 0 ? "text-red-500" : "text-gray-400"}`}>
            ${utilizado.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Barra de uso */}
      <div>
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>Uso del crédito</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Fechas de corte/pago */}
      {(tarjeta.dia_corte || tarjeta.dia_pago) && (
        <div className="flex gap-3 text-[10px] text-gray-400">
          {tarjeta.dia_corte && (
            <span>
              <i className="fas fa-scissors mr-1" />
              Corte día {tarjeta.dia_corte}
            </span>
          )}
          {tarjeta.dia_pago && (
            <span>
              <i className="fas fa-calendar-check mr-1" />
              Pago día {tarjeta.dia_pago}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

// ── Detalle de tarjeta (vista expandida) ───────────────────────
function TarjetaDetalle({ tarjeta: initial, categorias, onBack, onRefetch }) {
  const [tarjeta, setTarjeta] = useState(initial);
  const [modal, setModal] = useState(null); // "gasto" | "pagar" | "cuota"
  const [transacciones, setTransacciones] = useState([]);
  const [deudas, setDeudas] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(true);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Cargar detalle
  useState(() => {
    Api.get(`tarjetas/${tarjeta.tarjeta_id}`)
      .then((r) => {
        setTarjeta(r.data.tarjeta);
        setTransacciones(r.data.transacciones);
        setDeudas(r.data.deudas_cuotas);
      })
      .finally(() => setLoadingDetalle(false));
  }, []);

  const limite    = Number(tarjeta.limite_credito);
  const utilizado = Number(tarjeta.saldo_utilizado);
  const pct       = limite > 0 ? Math.round((utilizado / limite) * 100) : 0;
  const barColor  = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-[#2c295a]";

  // ── Registrar gasto con tarjeta ──
  async function handleGasto() {
    if (!form.monto || !form.categoria_id) {
      toast.error("Monto y categoría son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await Api.postJson(`tarjetas/${tarjeta.tarjeta_id}/gasto`, form);
      toast.success("Gasto registrado con la tarjeta");
      setModal(null);
      setForm({});
      const r = await Api.get(`tarjetas/${tarjeta.tarjeta_id}`);
      setTarjeta(r.data.tarjeta);
      setTransacciones(r.data.transacciones);
      onRefetch();
    } catch (e) {
      toast.error(e?.response?.data?.messages?.error || "Error al registrar el gasto");
    } finally {
      setSaving(false);
    }
  }

  // ── Pagar tarjeta ──
  async function handlePagar() {
    setSaving(true);
    try {
      const res = await Api.postJson(`tarjetas/${tarjeta.tarjeta_id}/pagar`, {
        monto: form.monto || undefined,
        categoria_id: form.categoria_id || undefined,
      });
      toast.success("✅ Pago de tarjeta registrado");
      setModal(null);
      setForm({});
      const r = await Api.get(`tarjetas/${tarjeta.tarjeta_id}`);
      setTarjeta(r.data.tarjeta);
      setTransacciones(r.data.transacciones);
      onRefetch();
    } catch (e) {
      toast.error(e?.response?.data?.messages?.error || "Error al pagar la tarjeta");
    } finally {
      setSaving(false);
    }
  }

  // ── Registrar cuota tasa 0 ──
  async function handleCuota() {
    if (!form.nombre_deuda || !form.monto_total_inicial || !form.cuota_mensual) {
      toast.error("Nombre, monto total y cuota son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await Api.postJson(`tarjetas/${tarjeta.tarjeta_id}/cuota`, form);
      toast.success("Compra a cuotas registrada");
      setModal(null);
      setForm({});
      const r = await Api.get(`tarjetas/${tarjeta.tarjeta_id}`);
      setTarjeta(r.data.tarjeta);
      setDeudas(r.data.deudas_cuotas);
      onRefetch();
    } catch (e) {
      toast.error(e?.response?.data?.messages?.error || "Error al registrar la cuota");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#2c295a] font-medium"
      >
        <i className="fas fa-arrow-left text-xs" /> Mis tarjetas
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
        <div>
          <p className="font-bold text-lg text-gray-900">{tarjeta.nombre}</p>
          {tarjeta.banco && <p className="text-sm text-gray-500">{tarjeta.banco}</p>}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-gray-400">Límite</p>
            <p className="text-sm font-bold text-gray-800 tabular-nums">${limite.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Disponible</p>
            <p className="text-sm font-bold text-green-600 tabular-nums">
              ${Number(tarjeta.saldo_disponible).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Utilizado</p>
            <p className={`text-sm font-bold tabular-nums ${utilizado > 0 ? "text-red-500" : "text-gray-400"}`}>
              ${utilizado.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => { setForm({}); setModal("gasto"); }}
          className="flex flex-col items-center gap-1 bg-white border border-gray-200 rounded-xl py-3 shadow-sm"
        >
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <i className="fas fa-shopping-cart text-xs" />
          </div>
          <span className="text-[11px] text-gray-700 font-medium">Registrar gasto</span>
        </button>

        <button
          onClick={() => { setForm({ monto: utilizado }); setModal("pagar"); }}
          disabled={utilizado <= 0}
          className="flex flex-col items-center gap-1 bg-white border border-gray-200 rounded-xl py-3 shadow-sm disabled:opacity-40"
        >
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <i className="fas fa-money-bill-wave text-xs" />
          </div>
          <span className="text-[11px] text-gray-700 font-medium">Pagar tarjeta</span>
        </button>

        <button
          onClick={() => { setForm({}); setModal("cuota"); }}
          className="flex flex-col items-center gap-1 bg-white border border-gray-200 rounded-xl py-3 shadow-sm"
        >
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <i className="fas fa-layer-group text-xs" />
          </div>
          <span className="text-[11px] text-gray-700 font-medium">Cuotas/Tasa 0</span>
        </button>
      </div>

      {/* Compras a cuotas / Tasa 0 */}
      {deudas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Planes a Cuotas / Tasa 0 ({deudas.length})
            </p>
            <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-medium border border-purple-100">
              Financiamiento activo
            </span>
          </div>

          {deudas.map((d) => {
            const total = Number(d.monto_total_inicial || 0);
            const pendiente = Number(d.saldo_pendiente || 0);
            const cuota = Number(d.cuota_mensual || 0);
            const pagado = Math.max(0, total - pendiente);
            const pct = total > 0 ? Math.min(100, Math.round((pagado / total) * 100)) : 0;
            const isPagada = d.estado === "Pagada" || pendiente <= 0;

            const cuotasTotales = cuota > 0 ? Math.ceil(total / cuota) : 0;
            const cuotasPagadas = cuota > 0 ? Math.min(cuotasTotales, Math.floor(pagado / cuota)) : 0;
            const cuotasFaltantes = cuotasTotales - cuotasPagadas;

            return (
              <div
                key={d.deuda_id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3"
              >
                {/* Encabezado del plan */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <i className="fas fa-layer-group text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {d.nombre_deuda}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                          Plan Tasa 0%
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            isPagada ? "text-gray-400" : "text-green-600"
                          }`}
                        >
                          ● {isPagada ? "Completado" : "En curso"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-400 font-medium">Por liquidar</p>
                    <p
                      className={`font-bold text-base tabular-nums ${
                        isPagada ? "text-gray-400" : "text-purple-700"
                      }`}
                    >
                      ${pendiente.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Barra de progreso visual */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">{pct}% pagado</span>
                    {cuotasTotales > 0 && (
                      <span className="text-gray-500 font-medium">
                        {cuotasPagadas} de {cuotasTotales} cuotas
                      </span>
                    )}
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-gray-400 pt-0.5">
                    <span>
                      Abonado: <strong className="text-gray-600">${pagado.toFixed(2)}</strong>
                    </span>
                    <span>
                      Total inicial: <strong className="text-gray-600">${total.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>

                {/* Detalle cuota y meses faltantes */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <i className="far fa-calendar-check text-gray-400" />
                    Cuota mensual:{" "}
                    <strong className="text-gray-800">${cuota.toFixed(2)}</strong>
                  </span>
                  {!isPagada && cuotasFaltantes > 0 && (
                    <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                      Resta {cuotasFaltantes} {cuotasFaltantes === 1 ? "mes" : "meses"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historial de movimientos con esta tarjeta */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Movimientos con esta tarjeta
          </p>
          <span className="text-[11px] text-gray-400">
            {transacciones.length} {transacciones.length === 1 ? "movimiento" : "movimientos"}
          </span>
        </div>

        {loadingDetalle ? (
          <p className="text-center text-gray-400 text-sm py-4">Cargando...</p>
        ) : transacciones.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 space-y-1">
            <i className="fas fa-receipt text-2xl mb-1 text-gray-300" />
            <p className="text-sm">Sin movimientos con esta tarjeta</p>
            <p className="text-xs text-gray-400">Las compras y pagos realizados aparecerán aquí.</p>
          </div>
        ) : (
          transacciones.map((tx) => (
            <div
              key={tx.transaccion_id}
              className="bg-white rounded-xl border border-gray-100 p-3.5 flex justify-between items-center gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.es_abono
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  <i
                    className={`fas ${
                      tx.es_abono ? "fa-arrow-down" : "fa-shopping-cart"
                    } text-xs`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {tx.descripcion || tx.categoria}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-400">{tx.fecha}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        tx.es_abono
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tx.es_abono ? "Abono / Pago" : "Cargo a tarjeta"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p
                  className={`text-sm font-bold tabular-nums ${
                    tx.es_abono ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {tx.es_abono ? "+" : "-"}${Number(tx.monto).toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── MODAL: Registrar gasto ── */}
      {modal === "gasto" && (
        <Modal title="Registrar gasto con tarjeta" onClose={() => { setModal(null); setForm({}); }}>
          <p className="text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2">
            <i className="fas fa-info-circle mr-1 text-blue-500" />
            Este gasto reduce el saldo disponible de la tarjeta. <strong>No</strong> descuenta de tu cuenta corriente hasta que pagues el corte.
          </p>
          <input
            type="number"
            placeholder="Monto"
            className={inputBase}
            value={form.monto || ""}
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
          />
          <select
            className={inputBase}
            value={form.categoria_id || ""}
            onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
          >
            <option value="">Selecciona categoría</option>
            {categorias.map((c) => (
              <option key={c.categoria_id} value={c.categoria_id}>{c.nombre}</option>
            ))}
          </select>
          <input
            placeholder="Descripción"
            className={inputBase}
            value={form.descripcion || ""}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
          <input
            type="date"
            className={inputBase}
            value={form.fecha || new Date().toISOString().slice(0, 10)}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />
          <button
            onClick={handleGasto}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#2c295a] text-white font-semibold"
          >
            {saving ? "Guardando..." : "Registrar gasto"}
          </button>
        </Modal>
      )}

      {/* ── MODAL: Pagar tarjeta ── */}
      {modal === "pagar" && (
        <Modal title="Pagar tarjeta" onClose={() => { setModal(null); setForm({}); }}>
          <p className="text-xs text-gray-500 bg-green-50 rounded-lg px-3 py-2">
            <i className="fas fa-info-circle mr-1 text-green-600" />
            Este pago sí descuenta de tu saldo actual (cuenta corriente) y libera cupo en la tarjeta.
          </p>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Saldo utilizado</p>
            <p className="text-xl font-bold text-red-500 tabular-nums">${utilizado.toFixed(2)}</p>
          </div>
          <input
            type="number"
            placeholder={`Monto a pagar (máx $${utilizado.toFixed(2)})`}
            className={inputBase}
            value={form.monto || ""}
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
          />
          <select
            className={inputBase}
            value={form.categoria_id || "7"}
            onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
          >
            <option value="">Selecciona categoría</option>
            {categorias.map((c) => (
              <option key={c.categoria_id} value={c.categoria_id}>{c.nombre}</option>
            ))}
          </select>
          <input
            type="date"
            className={inputBase}
            value={form.fecha || new Date().toISOString().slice(0, 10)}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />
          <button
            onClick={handlePagar}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold"
          >
            {saving ? "Procesando..." : "Confirmar pago"}
          </button>
        </Modal>
      )}

      {/* ── MODAL: Cuotas / Tasa 0 ── */}
      {modal === "cuota" && (
        <Modal title="Compra a cuotas / Tasa 0" onClose={() => { setModal(null); setForm({}); }}>
          <p className="text-xs text-gray-500 bg-purple-50 rounded-lg px-3 py-2">
            <i className="fas fa-info-circle mr-1 text-purple-600" />
            Se crea una deuda mensual vinculada a esta tarjeta. Cada mes pagas la cuota desde tu saldo actual.
          </p>
          <input
            placeholder="Nombre (ej: Laptop Samsung Tasa 0)"
            className={inputBase}
            value={form.nombre_deuda || ""}
            onChange={(e) => setForm({ ...form, nombre_deuda: e.target.value })}
          />
          <input
            type="number"
            placeholder="Monto total de la compra"
            className={inputBase}
            value={form.monto_total_inicial || ""}
            onChange={(e) => setForm({ ...form, monto_total_inicial: e.target.value })}
          />
          <input
            type="number"
            placeholder="Cuota mensual"
            className={inputBase}
            value={form.cuota_mensual || ""}
            onChange={(e) => setForm({ ...form, cuota_mensual: e.target.value })}
          />
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Fecha de vencimiento (opcional)</label>
            <input
              type="date"
              className={inputBase}
              value={form.fecha_vencimiento || ""}
              onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
            />
          </div>
          <button
            onClick={handleCuota}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-purple-700 text-white font-semibold"
          >
            {saving ? "Guardando..." : "Registrar compra a cuotas"}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── PÁGINA PRINCIPAL ───────────────────────────────────────────
export default function Tarjetas() {
  const { tarjetas, loading, error, refetch } = useTarjetas();
  const { categorias } = useCategorias();
  const [selected, setSelected] = useState(null);
  const [modalNueva, setModalNueva] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  async function handleCrearTarjeta() {
    if (!form.nombre || !form.limite_credito) {
      toast.error("Nombre y límite son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await Api.postJson("tarjetas", form);
      toast.success("Tarjeta creada correctamente");
      setModalNueva(false);
      setForm({});
      refetch();
    } catch {
      toast.error("Error al crear la tarjeta");
    } finally {
      setSaving(false);
    }
  }

  if (selected) {
    return (
      <TarjetaDetalle
        tarjeta={selected}
        categorias={categorias}
        onBack={() => { setSelected(null); refetch(); }}
        onRefetch={refetch}
      />
    );
  }

  if (loading) return <p className="text-center text-gray-400 mt-10">Cargando tarjetas...</p>;
  if (error)   return <p className="text-center text-red-400 mt-10">Error al cargar tarjetas</p>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Tarjetas de Crédito</h2>
          <p className="text-xs text-gray-500">Control de cupo y gastos por tarjeta</p>
        </div>
        <button
          onClick={() => { setForm({}); setModalNueva(true); }}
          className="w-9 h-9 rounded-full bg-[#2c295a] text-white flex items-center justify-center shadow-md"
        >
          <i className="fas fa-plus text-sm" />
        </button>
      </div>

      {/* Lista */}
      {tarjetas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <i className="fas fa-credit-card text-4xl mb-3 block" />
          <p className="font-medium text-gray-600">Sin tarjetas registradas</p>
          <p className="text-sm mt-1">Agrega tu primera tarjeta de crédito.</p>
          <button
            onClick={() => { setForm({}); setModalNueva(true); }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#2c295a] text-white text-sm font-medium"
          >
            Agregar tarjeta
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tarjetas.map((t) => (
            <TarjetaCard key={t.tarjeta_id} tarjeta={t} onSelect={setSelected} />
          ))}
        </div>
      )}

      {/* Modal: Nueva tarjeta */}
      {modalNueva && (
        <Modal title="Nueva tarjeta de crédito" onClose={() => { setModalNueva(false); setForm({}); }}>
          <input
            placeholder="Nombre (ej: Clásica Banco Agrícola)"
            className={inputBase}
            value={form.nombre || ""}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <input
            placeholder="Banco (opcional)"
            className={inputBase}
            value={form.banco || ""}
            onChange={(e) => setForm({ ...form, banco: e.target.value })}
          />
          <input
            type="number"
            placeholder="Límite de crédito"
            className={inputBase}
            value={form.limite_credito || ""}
            onChange={(e) => setForm({ ...form, limite_credito: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Día de corte</label>
              <input
                type="number"
                min="1" max="31"
                placeholder="ej: 15"
                className={inputBase}
                value={form.dia_corte || ""}
                onChange={(e) => setForm({ ...form, dia_corte: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Día de pago</label>
              <input
                type="number"
                min="1" max="31"
                placeholder="ej: 5"
                className={inputBase}
                value={form.dia_pago || ""}
                onChange={(e) => setForm({ ...form, dia_pago: e.target.value })}
              />
            </div>
          </div>
          <button
            onClick={handleCrearTarjeta}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#2c295a] text-white font-semibold"
          >
            {saving ? "Guardando..." : "Crear tarjeta"}
          </button>
        </Modal>
      )}
    </div>
  );
}
