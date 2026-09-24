import { useState } from "react";
import useGastosFijos from "./useGastosFijos";
import useCategorias from "../Transactions/useCategorias";
import useDeudas from "../Transactions/useDeudas";
import Api from "../../Services/api";
import { toast } from "react-toastify";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const inputBase =
  "w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-[#2c295a]/30 transition";

// ── Modal genérico ────────────────────────────────────────────
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

// ── Tarjeta de gasto pendiente ────────────────────────────────
function GastoCard({ gasto, onSetMonto, onPagar, onEliminar }) {
  const isPagado = gasto.estado === "pagado";
  const sinMonto = !gasto.monto || Number(gasto.monto) === 0;

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm p-4 flex justify-between items-start gap-3 ${
        isPagado ? "opacity-60" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{gasto.nombre}</p>
        <p className="text-xs text-gray-500 mt-0.5">{gasto.categoria}</p>
        {gasto.descripcion && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{gasto.descripcion}</p>
        )}
        {gasto.deuda_id && (
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5">
              <i className="fas fa-file-invoice-dollar text-[10px]" />
              {gasto.tarjeta_nombre ? `Tarjeta: ${gasto.tarjeta_nombre}` : (gasto.nombre_deuda || "Cuota de deuda")}
            </span>
            {gasto.deuda_saldo_pendiente && (
              <span className="text-[10px] text-gray-400 font-medium">
                Saldo: ${Number(gasto.deuda_saldo_pendiente).toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        {/* Monto */}
        {sinMonto && !isPagado ? (
          <button
            onClick={() => onSetMonto(gasto)}
            className="text-xs text-[#2c295a] font-medium border border-[#2c295a]/30 rounded-lg px-2 py-1"
          >
            + Definir monto
          </button>
        ) : (
          <span className={`font-bold text-sm tabular-nums ${isPagado ? "text-gray-400" : "text-gray-800"}`}>
            ${Number(gasto.monto).toFixed(2)}
          </span>
        )}

        {/* Estado */}
        {isPagado ? (
          <span className="text-[10px] font-medium text-green-600 flex items-center gap-1">
            <i className="fas fa-check-circle" /> Pagado
          </span>
        ) : (
          <div className="flex gap-1">
            {!sinMonto && (
              <button
                onClick={() => onPagar(gasto)}
                className="text-[11px] bg-[#2c295a] text-white rounded-lg px-2 py-1 font-medium hover:opacity-90 transition"
              >
                Pagar
              </button>
            )}
            {!sinMonto && (
              <button
                onClick={() => onSetMonto(gasto)}
                className="text-[11px] text-gray-500 border border-gray-200 rounded-lg px-2 py-1"
              >
                <i className="fas fa-pencil text-[10px]" />
              </button>
            )}
            <button
              onClick={() => onEliminar(gasto)}
              className="text-[11px] text-red-400 border border-red-100 rounded-lg px-2 py-1"
            >
              <i className="fas fa-trash text-[10px]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tarjeta de plantilla ──────────────────────────────────────
function PlantillaCard({ plantilla, onEditar, onToggle }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 flex justify-between items-center">
      <div>
        <p className="font-medium text-gray-900">{plantilla.nombre}</p>
        <p className="text-xs text-gray-500">{plantilla.categoria}</p>
        {Number(plantilla.monto_estimado) > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">
            Estimado: ${Number(plantilla.monto_estimado).toFixed(2)}
          </p>
        )}
        {plantilla.deuda_id && (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5">
              <i className="fas fa-link text-[9px]" />
              {plantilla.nombre_deuda ? `Vinculada a: ${plantilla.nombre_deuda}` : "Vinculada a deuda"}
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => onEditar(plantilla)}
          className="text-xs text-[#2c295a] border border-[#2c295a]/30 rounded-lg px-2 py-1"
        >
          <i className="fas fa-pencil text-[10px]" />
        </button>
        <button
          onClick={() => onToggle(plantilla)}
          className={`text-xs rounded-lg px-2 py-1 border ${
            plantilla.activa == 1
              ? "text-green-600 border-green-200"
              : "text-gray-400 border-gray-200"
          }`}
        >
          <i className={`fas ${plantilla.activa == 1 ? "fa-toggle-on" : "fa-toggle-off"} text-sm`} />
        </button>
      </div>
    </div>
  );
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────
export default function GastosFijos() {
  const { gastos, totales, plantillas, loading, mes, setMes, anio, setAnio, refetch } =
    useGastosFijos();
  const { categorias } = useCategorias();
  const { deudas, refetch: refetchDeudas } = useDeudas();

  const [tab, setTab] = useState("pendientes"); // "pendientes" | "plantillas"

  // Deudas activas por pagar (incluye cuotas de tarjetas / tasa 0)
  const deudasPagar = (deudas || []).filter(
    (d) => d.tipo_deuda === "Pagar" && d.estado !== "Pagada"
  );

  // Modales
  const [modalGasto, setModalGasto] = useState(null);    // crear gasto esporádico
  const [modalMonto, setModalMonto] = useState(null);    // definir monto
  const [modalPagar, setModalPagar] = useState(null);    // confirmar pago
  const [modalPlantilla, setModalPlantilla] = useState(null); // crear/editar plantilla

  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const pendientes = gastos.filter((g) => g.estado === "pendiente");
  const pagados    = gastos.filter((g) => g.estado === "pagado");

  // ── Generar mes desde plantillas ──
  async function handleGenerarMes() {
    setSaving(true);
    try {
      const res = await Api.postJson("gastos-pendientes/generar-mes", { mes, anio });
      toast.success(res.data.message);
      refetch();
    } catch (e) {
      toast.error("Error al generar gastos del mes");
    } finally {
      setSaving(false);
    }
  }

  // ── Crear gasto esporádico ──
  async function handleCrearGasto() {
    if (!form.nombre || !form.categoria_id) {
      toast.error("Nombre y categoría son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await Api.postJson("gastos-pendientes", { ...form, mes, anio });
      toast.success("Gasto agregado");
      setModalGasto(false);
      setForm({});
      refetch();
    } catch {
      toast.error("Error al crear el gasto");
    } finally {
      setSaving(false);
    }
  }

  // ── Definir monto ──
  async function handleSetMonto() {
    if (!form.monto || Number(form.monto) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    setSaving(true);
    try {
      await Api.patch(`gastos-pendientes/${modalMonto.gasto_id}/monto`, { monto: form.monto });
      toast.success("Monto actualizado");
      setModalMonto(null);
      setForm({});
      refetch();
    } catch {
      toast.error("Error al actualizar el monto");
    } finally {
      setSaving(false);
    }
  }

  // ── Pagar gasto ──
  async function handlePagar() {
    setSaving(true);
    try {
      const res = await Api.postJson(`gastos-pendientes/${modalPagar.gasto_id}/pagar`, {});
      toast.success("✅ Gasto pagado correctamente");
      setModalPagar(null);
      refetch();
      if (refetchDeudas) refetchDeudas();
    } catch {
      toast.error("Error al pagar el gasto");
    } finally {
      setSaving(false);
    }
  }

  // ── Eliminar gasto ──
  async function handleEliminar(gasto) {
    if (!confirm(`¿Eliminar "${gasto.nombre}"?`)) return;
    try {
      await Api.delete(`gastos-pendientes/${gasto.gasto_id}`);
      toast.success("Gasto eliminado");
      refetch();
    } catch {
      toast.error("Error al eliminar");
    }
  }

  // ── Crear/Actualizar plantilla ──
  async function handleGuardarPlantilla() {
    if (!form.nombre || !form.categoria_id) {
      toast.error("Nombre y categoría son obligatorios");
      return;
    }
    setSaving(true);
    try {
      if (form.plantilla_id) {
        await Api.put(`gastos-fijos/plantillas/${form.plantilla_id}`, form);
      } else {
        await Api.postJson("gastos-fijos/plantillas", form);
      }
      toast.success(form.plantilla_id ? "Plantilla actualizada" : "Plantilla creada");
      setModalPlantilla(false);
      setForm({});
      refetch();
    } catch {
      toast.error("Error al guardar la plantilla");
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle activa plantilla ──
  async function handleTogglePlantilla(plantilla) {
    try {
      await Api.put(`gastos-fijos/plantillas/${plantilla.plantilla_id}`, {
        activa: plantilla.activa == 1 ? 0 : 1,
      });
      refetch();
    } catch {
      toast.error("Error al actualizar plantilla");
    }
  }

  if (loading) {
    return <p className="text-center text-gray-400 mt-10">Cargando gastos...</p>;
  }

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Gastos Fijos</h2>
          <p className="text-xs text-gray-500">Control de gastos recurrentes y pendientes</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab("pendientes")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            tab === "pendientes" ? "bg-[#2c295a] text-white shadow" : "text-gray-500"
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setTab("plantillas")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            tab === "plantillas" ? "bg-[#2c295a] text-white shadow" : "text-gray-500"
          }`}
        >
          Plantillas ({plantillas.length})
        </button>
      </div>

      {/* ─── TAB: PENDIENTES ─── */}
      {tab === "pendientes" && (
        <>
          {/* Selector mes/año */}
          <div className="bg-white rounded-xl border shadow-sm p-3 flex items-center gap-2">
            <button
              onClick={() => {
                if (mes === 1) { setMes(12); setAnio(anio - 1); }
                else setMes(mes - 1);
              }}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <i className="fas fa-chevron-left text-xs" />
            </button>
            <p className="flex-1 text-center text-sm font-semibold text-gray-800">
              {MESES[mes - 1]} {anio}
            </p>
            <button
              onClick={() => {
                if (mes === 12) { setMes(1); setAnio(anio + 1); }
                else setMes(mes + 1);
              }}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <i className="fas fa-chevron-right text-xs" />
            </button>
          </div>

          {/* Resumen del mes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 rounded-xl p-3 border border-red-100">
              <p className="text-xs text-red-500 font-medium">Pendiente</p>
              <p className="text-lg font-bold text-red-600 tabular-nums">
                ${Number(totales.pendiente).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
              <p className="text-xs text-green-600 font-medium">Pagado</p>
              <p className="text-lg font-bold text-green-700 tabular-nums">
                ${Number(totales.pagado).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerarMes}
              disabled={saving || plantillas.length === 0}
              className="flex-1 py-2.5 text-sm rounded-xl border border-[#2c295a] text-[#2c295a] font-medium flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <i className="fas fa-magic text-xs" />
              Generar desde plantillas
            </button>
            <button
              onClick={() => { setForm({ mes, anio }); setModalGasto(true); }}
              className="py-2.5 px-4 text-sm rounded-xl bg-[#2c295a] text-white font-medium flex items-center gap-2"
            >
              <i className="fas fa-plus text-xs" />
              Manual
            </button>
          </div>

          {/* Lista pendientes */}
          {pendientes.length === 0 && pagados.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <i className="fas fa-clipboard-list text-3xl mb-2 block" />
              <p className="text-sm">No hay gastos este mes.</p>
              <p className="text-xs mt-1">Genera desde plantillas o agrega uno manual.</p>
            </div>
          ) : (
            <>
              {pendientes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Por pagar ({pendientes.length})
                  </p>
                  {pendientes.map((g) => (
                    <GastoCard
                      key={g.gasto_id}
                      gasto={g}
                      onSetMonto={(g) => { setModalMonto(g); setForm({ monto: g.monto || "" }); }}
                      onPagar={(g) => setModalPagar(g)}
                      onEliminar={handleEliminar}
                    />
                  ))}
                </div>
              )}

              {pagados.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Pagados ({pagados.length})
                  </p>
                  {pagados.map((g) => (
                    <GastoCard
                      key={g.gasto_id}
                      gasto={g}
                      onSetMonto={() => {}}
                      onPagar={() => {}}
                      onEliminar={() => {}}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ─── TAB: PLANTILLAS ─── */}
      {tab === "plantillas" && (
        <>
          <button
            onClick={() => { setForm({}); setModalPlantilla(true); }}
            className="w-full py-2.5 text-sm rounded-xl bg-[#2c295a] text-white font-medium flex items-center justify-center gap-2"
          >
            <i className="fas fa-plus text-xs" />
            Nueva plantilla
          </button>

          {plantillas.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <i className="fas fa-layer-group text-3xl mb-2 block" />
              <p className="text-sm">No tienes plantillas.</p>
              <p className="text-xs mt-1">Crea una para tus gastos recurrentes.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {plantillas.map((p) => (
                <PlantillaCard
                  key={p.plantilla_id}
                  plantilla={p}
                  onEditar={(p) => {
                    setForm({
                      plantilla_id: p.plantilla_id,
                      nombre: p.nombre,
                      descripcion: p.descripcion || "",
                      categoria_id: p.categoria_id,
                      monto_estimado: p.monto_estimado || "",
                      deuda_id: p.deuda_id || "",
                    });
                    setModalPlantilla(true);
                  }}
                  onToggle={handleTogglePlantilla}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MODAL: Crear gasto esporádico / cuota ── */}
      {modalGasto && (
        <Modal title="Agregar gasto manual" onClose={() => { setModalGasto(false); setForm({}); }}>
          {deudasPagar.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">
                ¿Corresponde a una deuda o compra a cuotas? (opcional)
              </label>
              <select
                className={inputBase}
                value={form.deuda_id || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setForm({ ...form, deuda_id: null });
                  } else {
                    const sel = deudasPagar.find((d) => String(d.deuda_id) === String(val));
                    const cuota = Number(sel?.cuota_mensual || 0);
                    const saldo = Number(sel?.saldo_pendiente || 0);
                    const suggestedMonto = cuota > 0 ? sel.cuota_mensual : (saldo > 0 ? sel.saldo_pendiente : "");
                    const catDeuda = categorias.find((c) => Number(c.categoria_id) === 12 || c.nombre.toLowerCase().includes("deuda"));
                    const catId12 = catDeuda ? catDeuda.categoria_id : 12;

                    setForm({
                      ...form,
                      deuda_id: val,
                      nombre: cuota > 0 ? `Cuota: ${sel.nombre_deuda}` : `Pago: ${sel.nombre_deuda}`,
                      monto: suggestedMonto,
                      categoria_id: catId12,
                    });
                  }
                }}
              >
                <option value="">Ninguna (gasto normal / de compra)</option>
                {deudasPagar.map((d) => (
                  <option key={d.deuda_id} value={d.deuda_id}>
                    {d.nombre_deuda} {Number(d.cuota_mensual) > 0 ? `(Cuota: $${Number(d.cuota_mensual).toFixed(2)})` : ""} · Saldo: ${Number(d.saldo_pendiente).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <input
            placeholder="Nombre del gasto"
            className={inputBase}
            value={form.nombre || ""}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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
            type="number"
            placeholder="Monto (opcional, puedes definirlo después)"
            className={inputBase}
            value={form.monto || ""}
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
          />
          <input
            placeholder="Descripción (opcional)"
            className={inputBase}
            value={form.descripcion || ""}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
          <button
            onClick={handleCrearGasto}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#2c295a] text-white font-semibold"
          >
            {saving ? "Guardando..." : "Agregar gasto"}
          </button>
        </Modal>
      )}

      {/* ── MODAL: Definir monto ── */}
      {modalMonto && (
        <Modal
          title={`Definir monto — ${modalMonto.nombre}`}
          onClose={() => { setModalMonto(null); setForm({}); }}
        >
          <p className="text-sm text-gray-500">¿Cuánto costó este gasto?</p>
          <input
            type="number"
            placeholder="Monto"
            className={inputBase}
            value={form.monto || ""}
            autoFocus
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
          />
          <button
            onClick={handleSetMonto}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#2c295a] text-white font-semibold"
          >
            {saving ? "Guardando..." : "Guardar monto"}
          </button>
        </Modal>
      )}

      {/* ── MODAL: Confirmar pago ── */}
      {modalPagar && (
        <Modal title="Confirmar pago" onClose={() => setModalPagar(null)}>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-gray-900">{modalPagar.nombre}</p>
            <p className="text-2xl font-bold text-[#2c295a] tabular-nums">
              ${Number(modalPagar.monto).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              Este monto se descontará de tu saldo actual en cuenta corriente.
            </p>

            {modalPagar.deuda_id && (
              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-indigo-700 bg-indigo-50/80 p-2.5 rounded-lg space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <i className="fas fa-info-circle text-[11px]" /> Abono automático a tu deuda:
                </p>
                <p>
                  • Se reducirá el saldo de <strong>"{modalPagar.nombre_deuda || 'tu deuda'}"</strong>.
                </p>
                {modalPagar.tarjeta_nombre && (
                  <p>
                    • Se liberarán <strong>${Number(modalPagar.monto).toFixed(2)}</strong> de cupo disponible en tu tarjeta <strong>{modalPagar.tarjeta_nombre}</strong>.
                  </p>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handlePagar}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#2c295a] text-white font-semibold"
          >
            {saving ? "Procesando..." : "Confirmar pago"}
          </button>
        </Modal>
      )}

      {/* ── MODAL: Plantilla ── */}
      {modalPlantilla && (
        <Modal
          title={form.plantilla_id ? "Editar plantilla" : "Nueva plantilla"}
          onClose={() => { setModalPlantilla(false); setForm({}); }}
        >
          {deudasPagar.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">
                Vincular a Deuda / Tarjeta Tasa 0 (opcional)
              </label>
              <select
                className={inputBase}
                value={form.deuda_id || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setForm({ ...form, deuda_id: null });
                  } else {
                    const sel = deudasPagar.find((d) => String(d.deuda_id) === String(val));
                    const cuota = Number(sel?.cuota_mensual || 0);
                    const saldo = Number(sel?.saldo_pendiente || 0);
                    const suggestedMonto = cuota > 0 ? sel.cuota_mensual : (saldo > 0 ? sel.saldo_pendiente : "");
                    const catDeuda = categorias.find((c) => Number(c.categoria_id) === 12 || c.nombre.toLowerCase().includes("deuda"));
                    const catId12 = catDeuda ? catDeuda.categoria_id : 12;

                    setForm({
                      ...form,
                      deuda_id: val,
                      nombre: cuota > 0 ? `Cuota: ${sel.nombre_deuda}` : `Pago: ${sel.nombre_deuda}`,
                      monto_estimado: suggestedMonto,
                      categoria_id: catId12,
                    });
                  }
                }}
              >
                <option value="">Ninguna (recurrente regular)</option>
                {deudasPagar.map((d) => (
                  <option key={d.deuda_id} value={d.deuda_id}>
                    {d.nombre_deuda} {Number(d.cuota_mensual) > 0 ? `(Cuota: $${Number(d.cuota_mensual).toFixed(2)})` : ""} · Saldo: ${Number(d.saldo_pendiente).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <input
            placeholder="Nombre del gasto (ej: Energía Eléctrica)"
            className={inputBase}
            value={form.nombre || ""}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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
            type="number"
            placeholder="Monto estimado (puedes dejar en 0 si varía)"
            className={inputBase}
            value={form.monto_estimado || ""}
            onChange={(e) => setForm({ ...form, monto_estimado: e.target.value })}
          />
          <input
            placeholder="Descripción (opcional)"
            className={inputBase}
            value={form.descripcion || ""}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
          <button
            onClick={handleGuardarPlantilla}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#2c295a] text-white font-semibold"
          >
            {saving ? "Guardando..." : form.plantilla_id ? "Actualizar" : "Crear plantilla"}
          </button>
        </Modal>
      )}
    </div>
  );
}
