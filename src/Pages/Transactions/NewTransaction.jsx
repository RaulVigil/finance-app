import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useNewTransaction from "./useNewTransaction";
import useNewDeuda from "./useNewDeuda";
import TransactionCard from "../../Components/TransactionCard";
import useCategorias from "./useCategorias";
import useDeudas from "./useDeudas";
import useTarjetas from "../Tarjetas/useTarjetas";
import DropdownSelect from "../../Components/DropdownSelect";
import LogoEmblem from "../../Components/LogoEmblem";

export default function NewTransaction() {
  const location = useLocation();

  /* =========================
   * WIZARD
   ========================= */
  const [step, setStep] = useState(() => {
    if (location.state?.tipo === "Ingreso" || location.state?.tipo === "Egreso") return 2;
    return 1;
  });
  const [accion, setAccion] = useState(() => {
    if (location.state?.tipo === "Ingreso") return "ingreso";
    if (location.state?.tipo === "Egreso") return "egreso";
    return null;
  });

  /* =========================
   * TRANSACCIÓN HOOK
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
    metodoPago,
    setMetodoPago,
    tarjetaId,
    setTarjetaId,
    reponerTarjeta,
    setReponerTarjeta,
    loading,
    message,
    submit,
  } = useNewTransaction();

  const { categorias, loading: categoriasLoading } = useCategorias();
  const { deudas, loading: deudasLoading } = useDeudas();
  const { tarjetas, loading: tarjetasLoading } = useTarjetas();
  const [successMessage, setSuccessMessage] = useState(null);

  /* =========================
   * DEUDA HOOK
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
    if (location.state?.tipo) {
      setTipo(location.state.tipo);
      setEstado("pagado");
    }
  }, [location.state?.tipo, setTipo, setEstado]);

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

  const isIngreso = tipo === "Ingreso";

  const deudasFiltradas = deudas.filter((d) => {
    if (d.estado === "Pagada") return false;
    if (tipo === "Ingreso") return d.tipo_deuda === "Cobrar";
    if (tipo === "Egreso") return d.tipo_deuda === "Pagar";
    return false;
  });

  useEffect(() => {
    setDeudaId("");
  }, [tipo, setDeudaId]);

  const categoriaSeleccionada = categorias.find(
    (c) => String(c.categoria_id) === String(categoriaId)
  )?.nombre;

  /* =========================
   * STEP 1 – SELECCIÓN DE ACCIÓN (FINTECH OBSIDIAN)
   ========================= */
  if (step === 1) {
    return (
      <div className="space-y-6 max-w-lg mx-auto pb-10">
        {/* Banner de Éxito temporal */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <i className="fas fa-check text-emerald-400 text-sm" />
            </div>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Cabecera de la Pantalla */}
        <div className="space-y-1.5 pt-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BCD4] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00BCD4]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
              Registro Rápido
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ¿Qué deseas registrar?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Elige el tipo de movimiento financiero para actualizar tu balance
          </p>
        </div>

        {/* Lista de 3 Opciones Modernas */}
        <div className="space-y-3.5">
          {/* OPCIÓN 1: REGISTRAR GASTO */}
          <button
            type="button"
            onClick={() => {
              setAccion("egreso");
              setTipo("Egreso");
              setEstado("pagado");
              setStep(2);
            }}
            className="w-full relative overflow-hidden group p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/20 via-[#151720] to-[#12131A] hover:to-[#171922] border border-rose-500/20 hover:border-rose-500/50 transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex items-center justify-between gap-4 text-left cursor-pointer active:scale-[0.99]"
          >
            {/* Glow sutil */}
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/15 transition" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/25 text-rose-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.15)] group-hover:scale-105 group-hover:bg-rose-500/25 transition-all">
                <i className="fas fa-arrow-trend-down text-lg" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-rose-200 transition">
                    Registrar gasto
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20">
                    Salida
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Dinero que sale de tu cuenta o billetera
                </p>
              </div>
            </div>

            <div className="w-9 h-9 rounded-xl bg-white/[0.04] group-hover:bg-rose-500/20 border border-white/[0.06] group-hover:border-rose-500/30 flex items-center justify-center text-neutral-400 group-hover:text-rose-300 transition-all shrink-0">
              <i className="fas fa-chevron-right text-xs group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* OPCIÓN 2: REGISTRAR INGRESO */}
          <button
            type="button"
            onClick={() => {
              setAccion("ingreso");
              setTipo("Ingreso");
              setEstado("pagado");
              setStep(2);
            }}
            className="w-full relative overflow-hidden group p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-[#151720] to-[#12131A] hover:to-[#171922] border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex items-center justify-between gap-4 text-left cursor-pointer active:scale-[0.99]"
          >
            {/* Glow sutil */}
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/15 transition" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-105 group-hover:bg-emerald-500/25 transition-all">
                <i className="fas fa-arrow-trend-up text-lg" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-emerald-200 transition">
                    Registrar ingreso
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    Entrada
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Dinero que entra a tu cuenta o billetera
                </p>
              </div>
            </div>

            <div className="w-9 h-9 rounded-xl bg-white/[0.04] group-hover:bg-emerald-500/20 border border-white/[0.06] group-hover:border-emerald-500/30 flex items-center justify-center text-neutral-400 group-hover:text-emerald-300 transition-all shrink-0">
              <i className="fas fa-chevron-right text-xs group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* OPCIÓN 3: CREAR DEUDA */}
          <button
            type="button"
            onClick={() => {
              setAccion("deuda");
              setStep(2);
            }}
            className="w-full relative overflow-hidden group p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-[#151720] to-[#12131A] hover:to-[#171922] border border-[#00BCD4]/20 hover:border-[#00BCD4]/50 transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex items-center justify-between gap-4 text-left cursor-pointer active:scale-[0.99]"
          >
            {/* Glow sutil */}
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-[#00BCD4]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#00BCD4]/15 transition" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#00BCD4]/15 border border-[#00BCD4]/25 text-[#00BCD4] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,188,212,0.15)] group-hover:scale-105 group-hover:bg-[#00BCD4]/25 transition-all">
                <i className="fas fa-file-invoice-dollar text-lg" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-cyan-200 transition">
                    Crear deuda o préstamo
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#00BCD4]/15 text-[#00BCD4] border border-[#00BCD4]/20">
                    Compromiso
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Pagos pendientes o dinero por cobrar a terceros
                </p>
              </div>
            </div>

            <div className="w-9 h-9 rounded-xl bg-white/[0.04] group-hover:bg-[#00BCD4]/20 border border-white/[0.06] group-hover:border-[#00BCD4]/30 flex items-center justify-center text-neutral-400 group-hover:text-cyan-300 transition-all shrink-0">
              <i className="fas fa-chevron-right text-xs group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  /* =========================
   * STEP 2 – REGISTRAR GASTO / INGRESO
   ========================= */
  if (step === 2 && accion !== "deuda") {
    return (
      <div className="space-y-5 max-w-lg mx-auto pb-10">
        {/* Barra superior de navegación */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white border border-white/[0.08] transition cursor-pointer active:scale-95"
          >
            <i className="fas fa-arrow-left text-xs" />
            <span>Volver</span>
          </button>

          {/* Badge del modo actual */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isIngreso
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/15 border-rose-500/30 text-rose-400"
            }`}
          >
            <i className={`fas ${isIngreso ? "fa-arrow-trend-up" : "fa-arrow-trend-down"} text-xs`} />
            <span>{isIngreso ? "Nuevo Ingreso" : "Nuevo Gasto"}</span>
          </div>
        </div>

        {/* Mensaje de error o éxito */}
        {message && (
          <div
            className={`text-xs sm:text-sm px-4 py-3 rounded-2xl font-medium flex items-center gap-2.5 animate-in fade-in duration-200 ${
              message.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
            }`}
          >
            <i className={`fas ${message.type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"}`} />
            <span>{message.text}</span>
          </div>
        )}

        {/* TARJETA HERO: MONTO DE LA TRANSACCIÓN */}
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#1C1F28] via-[#14161C] to-[#0A0B0E] border border-white/[0.12] shadow-[0_20px_45px_rgba(0,0,0,0.6)] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#00BCD4] before:to-transparent">
          {/* Glow ambiental */}
          <div
            className="absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: isIngreso ? "#10B981" : "#F43F5E" }}
          />

          {/* Marca de agua */}
          <div className="absolute -right-6 -bottom-8 w-44 h-44 opacity-[0.03] pointer-events-none select-none text-white transform -rotate-12">
            <LogoEmblem className="w-full h-full" circleColor="currentColor" dotColor="#00BCD4" />
          </div>

          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 relative z-10">
            Monto de la transacción
          </label>

          <div className="relative z-10 flex items-baseline gap-2">
            <span
              className={`text-3xl sm:text-4xl font-light select-none ${
                isIngreso ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              $
            </span>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              autoFocus
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full bg-transparent text-3xl sm:text-4xl lg:text-5xl font-black text-white placeholder-neutral-600 focus:outline-none tracking-tight tabular-nums"
            />
          </div>
        </div>

        {/* TARJETA FORMULARIO: CAMPOS DETALLADOS */}
        <div className="bg-[#161822] rounded-3xl p-5 border border-white/[0.1] shadow-xl space-y-4">
          {/* Selector de Categoría */}
          <DropdownSelect
            label="Categoría"
            placeholder="Selecciona una categoría"
            items={categorias}
            value={categoriaId}
            onChange={setCategoriaId}
            loading={categoriasLoading}
            getKey={(c) => c.categoria_id}
            getLabel={(c) => c.nombre}
          />

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Descripción o Concepto
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. Supermercado semanal, Pago de nómina..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full rounded-xl bg-[#12141A] border border-white/[0.1] focus:border-[#00BCD4]/70 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none transition shadow-inner"
              />
            </div>
          </div>

          {/* Método / Origen de Pago (Solo si es Egreso/Gasto) */}
          {tipo === "Egreso" && (
            <div className="space-y-2 pt-1 border-t border-white/[0.08]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Método / Origen del pago
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#12141A] border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setMetodoPago("billetera")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    metodoPago === "billetera"
                      ? "bg-white/[0.12] text-white border border-white/[0.2] shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <i className="fas fa-wallet text-xs" />
                  <span>Billetera / Débito</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMetodoPago("tarjeta");
                    if (!tarjetaId && tarjetas.length > 0) {
                      setTarjetaId(tarjetas[0].tarjeta_id);
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    metodoPago === "tarjeta"
                      ? "bg-[#00BCD4]/20 text-[#00BCD4] border border-[#00BCD4]/40 shadow-[0_0_12px_rgba(0,188,212,0.25)]"
                      : "text-neutral-400 hover:text-[#00BCD4] hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <i className="fas fa-credit-card text-xs" />
                  <span>Tarjeta de Crédito</span>
                </button>
              </div>

              {/* Si se paga con Tarjeta de Crédito */}
              {metodoPago === "tarjeta" && (
                <div className="mt-2 p-3.5 rounded-2xl bg-[#00BCD4]/[0.06] border border-[#00BCD4]/20 space-y-3 animate-in fade-in duration-200">
                  <DropdownSelect
                    label="Tarjeta de Crédito utilizada"
                    placeholder="Elige tu tarjeta"
                    items={tarjetas}
                    value={tarjetaId}
                    onChange={setTarjetaId}
                    loading={tarjetasLoading}
                    getKey={(t) => t.tarjeta_id}
                    getLabel={(t) => `${t.nombre} ${t.banco ? `(${t.banco})` : ""} · Disp: $${Number(t.saldo_disponible).toFixed(2)}`}
                  />

                  {/* Switch para auto-agregar a pendientes de Gastos del Mes */}
                  <label className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={reponerTarjeta}
                      onChange={(e) => setReponerTarjeta(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#00BCD4] accent-[#00BCD4] bg-[#12141A] border-white/[0.2] cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-white group-hover:text-[#00BCD4] transition">
                        Agregar a "Por Pagar" en Gastos del Mes
                      </span>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                        Te recordará reponer este dinero a tu tarjeta antes de la fecha de corte para que no pagues intereses.
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Asociar a Deuda y Estado (Solo si es Billetera / Efectivo) */}
          {metodoPago === "billetera" && (
            <>
              <DropdownSelect
                label="Asociar a Compromiso (Opcional)"
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
                    if (selected) {
                      const cuota = Number(selected.cuota_mensual || 0);
                      const saldo = Number(selected.saldo_pendiente || 0);
                      const total = Number(selected.monto_total_inicial || 0);
                      
                      if (cuota > 0) {
                        setMonto(selected.cuota_mensual);
                      } else if (saldo > 0) {
                        setMonto(selected.saldo_pendiente);
                      }

                      // Auto-generar descripción "Cuota #X de [Nombre]"
                      if (cuota > 0 && total > 0) {
                        const pagado = Math.max(0, total - saldo);
                        const cuotasPagadas = Math.floor(pagado / cuota);
                        const nextCuota = cuotasPagadas + 1;
                        // Solo sobreescribir si está vacío o si tiene una descripción generada previa
                        if (!descripcion || descripcion.startsWith("Cuota #") || descripcion === "") {
                          setDescripcion(`Cuota #${nextCuota} de ${selected.nombre_deuda}`);
                        }
                      } else {
                        // Si no es a cuotas, sugerir pago general
                        if (!descripcion || descripcion.startsWith("Pago de ") || descripcion === "") {
                          setDescripcion(`Pago de ${selected.nombre_deuda}`);
                        }
                      }
                    }
                    if (tipo === "Egreso") {
                      const catDeuda = categorias.find(
                        (c) => Number(c.categoria_id) === 12 || c.nombre.toLowerCase().includes("deuda")
                      );
                      setCategoriaId(catDeuda ? catDeuda.categoria_id : 12);
                    }
                  }
                }}
                loading={deudasLoading}
                allowEmpty
                emptyLabel="Sin deuda asociada"
                getLabel={(d) => `${d.nombre_deuda} (Saldo: $${Number(d.saldo_pendiente || 0).toLocaleString("en-US")})`}
                getKey={(d) => d.deuda_id}
              />

              {tipo === "Egreso" && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Estado del pago
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#12141A] border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setEstado("pagado")}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                        estado === "pagado"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                          : "text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <i className={`fas fa-circle-check text-xs ${estado === "pagado" ? "text-emerald-400" : "text-neutral-500"}`} />
                      <span>Pagado ahora</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEstado("pendiente")}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                        estado === "pendiente"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                          : "text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <i className={`fas fa-clock text-xs ${estado === "pendiente" ? "text-amber-400 animate-pulse" : "text-neutral-500"}`} />
                      <span>Pagar después</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* VISTA PREVIA EN TIEMPO REAL */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 px-1">
            <i className="fas fa-eye text-[11px] text-[#00BCD4]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Vista previa en tiempo real
            </span>
          </div>

          <TransactionCard
            tx={{
              transaccion_id: "preview",
              descripcion: descripcion || (isIngreso ? "Nuevo Ingreso" : "Nuevo Gasto"),
              categoria: categoriaSeleccionada || "Categoría",
              fecha: new Date().toISOString().slice(0, 10),
              tipo,
              monto: Number(monto) || 0,
              estado: isIngreso ? "pagado" : estado,
            }}
          />
        </div>

        {/* BOTÓN CTA GUARDAR */}
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-sm text-[#0C0D10] bg-[#00BCD4] hover:bg-[#00acc1] shadow-[0_0_24px_rgba(0,188,212,0.35)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <i className="fas fa-circle-notch fa-spin text-base" />
              <span>Guardando movimiento...</span>
            </>
          ) : (
            <>
              <i className={`fas ${isIngreso ? "fa-arrow-down" : "fa-arrow-up"} text-xs`} />
              <span>{isIngreso ? "Registrar Ingreso" : "Registrar Gasto"}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  /* =========================
   * STEP 2 – CREAR DEUDA (FINTECH OBSIDIAN)
   ========================= */
  if (step === 2 && accion === "deuda") {
    return (
      <div className="space-y-5 max-w-lg mx-auto pb-10">
        {/* Barra superior de navegación */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white border border-white/[0.08] transition cursor-pointer active:scale-95"
          >
            <i className="fas fa-arrow-left text-xs" />
            <span>Volver</span>
          </button>

          {/* Badge del modo actual */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-[#00BCD4]/15 border-[#00BCD4]/30 text-[#00BCD4]">
            <i className="fas fa-file-invoice-dollar text-xs" />
            <span>Nueva Deuda</span>
          </div>
        </div>

        {/* Mensaje de error o éxito */}
        {deudaMessage && (
          <div
            className={`text-xs sm:text-sm px-4 py-3 rounded-2xl font-medium flex items-center gap-2.5 animate-in fade-in duration-200 ${
              deudaMessage.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
            }`}
          >
            <i className={`fas ${deudaMessage.type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"}`} />
            <span>{deudaMessage.text}</span>
          </div>
        )}

        {/* TARJETA HERO: TIPO Y MONTO DE LA DEUDA */}
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#1C1F28] via-[#14161C] to-[#0A0B0E] border border-white/[0.12] shadow-[0_20px_45px_rgba(0,0,0,0.6)] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#00BCD4] before:to-transparent space-y-4">
          {/* Selector de Tipo: Pagar vs Cobrar */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#12141A] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setTipoDeuda("Pagar")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                tipoDeuda === "Pagar"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <i className="fas fa-hand-holding-dollar text-xs" />
              <span>Por Pagar</span>
            </button>

            <button
              type="button"
              onClick={() => setTipoDeuda("Cobrar")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                tipoDeuda === "Cobrar"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <i className="fas fa-money-bill-trend-up text-xs" />
              <span>Por Cobrar</span>
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Monto total inicial
            </label>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-light text-[#00BCD4] select-none">$</span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                autoFocus
                value={montoTotal}
                onChange={(e) => setMontoTotal(e.target.value)}
                className="w-full bg-transparent text-3xl sm:text-4xl lg:text-5xl font-black text-white placeholder-neutral-600 focus:outline-none tracking-tight tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* TARJETA FORMULARIO DE DEUDA */}
        <div className="bg-[#161822] rounded-3xl p-5 border border-white/[0.1] shadow-xl space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Nombre o acreedor de la deuda
            </label>
            <input
              type="text"
              placeholder="Ej. Préstamo Bancario, Amigo Juan, Tarjeta..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl bg-[#12141A] border border-white/[0.1] focus:border-[#00BCD4]/70 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none transition shadow-inner"
            />
          </div>

          {tipoDeuda === "Pagar" && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Cuota mensual (opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="Monto de cuota fija"
                    value={cuotaMensual}
                    onChange={(e) => setCuotaMensual(e.target.value)}
                    className="w-full rounded-xl bg-[#12141A] border border-white/[0.1] focus:border-[#00BCD4]/70 pl-8 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none transition shadow-inner tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Fecha de vencimiento (límite)
                </label>
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className="w-full rounded-xl bg-[#12141A] border border-white/[0.1] focus:border-[#00BCD4]/70 px-4 py-3 text-sm text-white focus:outline-none transition shadow-inner [color-scheme:dark]"
                />
                <p className="text-[11px] text-neutral-500">
                  Fecha de corte o fecha límite en la que debes liquidar esta deuda
                </p>
              </div>
            </>
          )}
        </div>

        {/* BOTÓN CTA GUARDAR DEUDA */}
        <button
          type="button"
          onClick={submitDeuda}
          disabled={deudaLoading}
          className="w-full py-4 rounded-2xl font-black text-sm text-[#0C0D10] bg-[#00BCD4] hover:bg-[#00acc1] shadow-[0_0_24px_rgba(0,188,212,0.35)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {deudaLoading ? (
            <>
              <i className="fas fa-circle-notch fa-spin text-base" />
              <span>Creando compromiso...</span>
            </>
          ) : (
            <>
              <i className="fas fa-plus text-xs" />
              <span>Crear Deuda</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return null;
}
